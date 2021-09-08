from util.globals import *
from util.models import *
from util.handle_request import *
from flask_restx import Resource, abort
from flask import request
from PIL import Image
from io import BytesIO
import base64
import time

recipe = api.namespace('recipe', description='Recipe Services')


@recipe.route('/', strict_slashes=False)
class Recipe(Resource):
    @recipe.response(200, 'Success', recipe_id_details)
    @recipe.response(403, 'Invalid Auth Token')
    @recipe.response(400, 'Missing required information')
    @recipe.expect(auth_details, new_recipe_details)
    @recipe.doc(description='''
        Let you build a new recipe. name, ingredients, proportion, method, meal_type and src must be provided
        The provided image must be a png image and can be encoded in base64.
        return new recipe_id add on
    ''')
    def post(self):
        curr_user = authorize(request)
        curr_username = curr_user[1]
        # get information json data from http request
        j = get_request_json()
        (r_name, ingredients, proportion, method, src, meal_type) = unpack(j, 'name', 'ingredients', 'proportion',
                                                                           'method', 'src', 'meal_type')
        if not all([r_name, ingredients, proportion, method, src, meal_type]):
            abort(400, "missing required information")
        # transfer to base64 image
        thumbnail = self.get_thumbnail(src)

        recipe_id = db.insert('RECIPES').values(
            author=curr_username,
            name=r_name,
            ingredients=lstSet_to_text(ingredients),
            proportion=lstSet_to_text(proportion),
            method=lstSet_to_text(method),
            published=str(time.time()),
            likes='',
            thumbnail=thumbnail,
            src=src,
            meal_type=meal_type,
            liked_num=0
        ).execute()
        # update recipe_Lst of table USERS in db
        recipe_Lst = text_to_set(curr_user[5], process_f=lambda x: int(x))
        recipe_Lst.add(recipe_id)
        db.update('USER').set(recipes=lstSet_to_text(recipe_Lst)).where(id=curr_user[0]).execute()
        # return success information
        return {
            'recipe_id': recipe_id
        }

    # transfer to base64 and check if the image valid
    def get_thumbnail(self, src):
        try:
            size = (150, 150)
            im = Image.open(BytesIO(base64.b64decode(src)))
            im.thumbnail(size, Image.ANTIALIAS)
            buffered = BytesIO()
            im.save(buffered, format='PNG')
            return base64.b64encode(buffered.getvalue()).decode("utf-8")
        except:
            abort(400, 'Image Data Could Not Be Processed')

    @recipe.response(200, 'Success', recipe_details)
    @recipe.response(403, 'Invalid Auth Token')
    @recipe.response(405, 'Not found the recipe with required id')
    @recipe.param('id', 'id of the recipe to fetch, must provided')
    @recipe.expect(auth_details)
    @recipe.doc(description='''
           Let you get full information of recipe with provided recipe ID. Besides, user must login and provided 
           token information.
       ''')
    def get(self):
        curr_user = authorize(request)
        recipe_id = get_request_arg('id', int, required=True)
        # print(recipe_id)
        recipe_result = db.select('RECIPES').where(id=recipe_id).execute()
        # print(recipe_result)
        if not recipe_result:
            abort(405, f'Not found the recipe with required id {recipe_id}')

        return format_recipe(recipe_result)

    @recipe.response(200, 'Success')
    @recipe.response(403, 'Invalid Auth Token')
    @recipe.response(405, 'Not found the recipe with required id')
    @recipe.response(401, 'Not valid provided information')
    @recipe.param('id', 'id of the recipe to edit, must provide')
    @recipe.expect(auth_details, new_recipe_details)
    @recipe.doc(description='''
               Let you edit the recipe information, recipe ID must be provided. the src must be in png format and can be
               transferred into base 64 format. you should provide recipe name, ingredients, method, and proportion info
               to edit this recipe
           ''')
    def patch(self):
        curr_user = authorize(request)
        curr_username = curr_user[1]
        json_data = get_request_json()
        recipe_id = get_request_arg('id', int, required=True)
        if not db.exists('RECIPES').where(id=recipe_id):
            abort(405, 'No such Recipe found in db')

        # check if the current user is valid to edit this recipe
        recipe_author = db.select('RECIPES').where(id=recipe_id).execute()[1]
        if curr_username != recipe_author:
            abort(403, 'Only recipe author could edit this recipe')

        (name, ingredients, proportion, method, src, meal_type) = unpack(json_data,
                                                                         'name',
                                                                         'ingredients',
                                                                         'proportion',
                                                                         'method',
                                                                         'src',
                                                                         'meal_type',
                                                                         required=False)
        edit_recipe_keys = ['name', 'ingredients', 'proportion', 'method', 'meal_type', 'src']
        provided_info = [k for k in json_data.keys() if k in edit_recipe_keys]
        edit_recipe = {}
        if len(provided_info) < 1:
            abort(401, 'at least one of the field must be provided')
        if 'src' in provided_info:
            thumbnail = self.get_thumbnail(src)
            edit_recipe['thumbnail'] = thumbnail
            edit_recipe['src'] = src
        if 'meal_type' in provided_info:
            edit_recipe['meal_type'] = meal_type
        for k in provided_info:
            if k in ['ingredients', 'proportion', 'method']:
                edit_recipe[k] = lstSet_to_text(json_data[k])

        edit_recipe['published'] = str(time.time())
        db.update('RECIPES').set(**edit_recipe).where(id=recipe_id).execute()

        return {
            'message': 'ok'
        }

    @recipe.response(200, 'Success')
    @recipe.response(403, 'Not valid user')
    @recipe.response(405, 'Not found the recipe with required id')
    @recipe.param('id', 'id of the recipe to delete, must provide')
    @recipe.expect(auth_details)
    @recipe.doc(description='''
               Let you delete recipe with given id, only recipe author could delete recipe
           ''')
    def delete(self):
        curr_user = authorize(request)
        recipe_id = get_request_arg('id', int, required=True)

        recipe_result = db.select('RECIPES').where(id=recipe_id).execute()

        if not recipe_result:
            abort(405, f'Not found the recipe with required id {recipe_id}')
        if curr_user[1] != recipe_result[1]:
            abort(403, 'Only the author of the recipe could delete the recipe')

        comment_ids = text_to_set(recipe_result[10], process_f=lambda x: int(x))
        # delete comments on comments table
        for comment_id in comment_ids:
            db.delete('COMMENT').where(id=comment_id).execute()

        # delete recipe in table RECIPES
        db.delete('RECIPES').where(id=recipe_id).execute()

        # update user table when delete recipe
        recipe_lst = text_to_set(curr_user[5], process_f=lambda x: int(x))
        recipe_lst.discard(recipe_id)
        db.update('USER').set(recipes=lstSet_to_text(recipe_lst)).where(id=curr_user[0]).execute()
        return {
            'message': 'ok'
        }


@recipe.route('/like', strict_slashes=False)
class Like(Resource):
    @recipe.response(200, 'Success')
    @recipe.response(403, 'Invalid Token')
    @recipe.response(400, 'Not valid request form')
    @recipe.response(405, 'No such recipe found in db')
    @recipe.expect(auth_details)
    @recipe.param('id', 'the id of the recipe to be liked on')
    @recipe.doc(description='''
        Let current user able to give like to other users' recipe by the given id.
        User must login, and token must be provided and id is the id of recipe to be liked.
        Id must be valid.
    ''')
    def patch(self):
        curr_user = authorize(request)
        # get recipe id from request
        recipe_id = get_request_arg('id', int, required=True)
        if not db.exists('RECIPES').where(id=recipe_id):
            abort(405, 'No such recipe found in db')
        recipe_db = db.select('RECIPES').where(id=recipe_id).execute()
        like_lst = text_to_set(recipe_db[7], process_f=lambda x: int(x))
        # calculate liked_num value in db
        if curr_user[0] not in like_lst:
            query = f'UPDATE RECIPES SET LIKED_NUM = LIKED_NUM + 1 WHERE ID = {recipe_id}'
            db.raw(query)
        like_lst.add(curr_user[0])
        like_lst = lstSet_to_text(like_lst)
        db.update('RECIPES').set(likes=like_lst).where(id=recipe_id).execute()
        return {
            'message': 'ok'
        }


@recipe.route('/unlike', strict_slashes=False)
class UnLike(Resource):
    @recipe.response(200, 'Success')
    @recipe.response(403, 'Invalid Token')
    @recipe.response(400, 'Not valid request form')
    @recipe.response(405, 'No such recipe found in db')
    @recipe.expect(auth_details)
    @recipe.param('id', 'the id of the recipe to be unliked on')
    @recipe.doc(description='''
        Let current user able to cancel like to other users' recipe by the given id.
        User must login, and token must be provided and id is the id of recipe to be unliked.
        Id must be valid.
    ''')
    def patch(self):
        curr_user = authorize(request)
        # get recipe id from request
        recipe_id = get_request_arg('id', int, required=True)
        if not db.exists('RECIPES').where(id=recipe_id):
            abort(405, 'No such recipe found in db')
        recipe_db = db.select('RECIPES').where(id=recipe_id).execute()
        like_lst = text_to_set(recipe_db[7], process_f=lambda x: int(x))
        if curr_user[0] in like_lst:
            query = f'UPDATE RECIPES SET LIKED_NUM = LIKED_NUM - 1 WHERE ID = {recipe_id}'
            db.raw(query)
        like_lst.discard(curr_user[0])
        like_lst = lstSet_to_text(like_lst)
        db.update('RECIPES').set(likes=like_lst).where(id=recipe_id).execute()
        return {
            'message': 'ok'
        }


@recipe.route('/comment', strict_slashes=False)
class Comments(Resource):
    @recipe.response(200, 'Success')
    @recipe.response(403, 'Invalid Token')
    @recipe.response(400, 'Not valid request form')
    @recipe.response(405, 'No such recipe found in db')
    @recipe.expect(auth_details, new_comment_details)
    @recipe.param('id', 'the id of the recipe to be comment on')
    @recipe.doc(description='''
        Let current user able to comment on other users' recipe by the given id.
        User must login, and token must be provided and id is the id of recipe to be commented.
        Id must be valid. Id is the recipe id. 
        comments have to be provided too
    ''')
    def patch(self):
        curr_user = authorize(request)
        # get request json body
        json_data = get_request_json()
        # get recipe id from request
        recipe_id = get_request_arg('id', int, required=True)

        if not db.exists('RECIPES').where(id=recipe_id):
            abort(405, 'No such recipe found in db')

        (new_comment,) = unpack(json_data, 'comment')
        if new_comment == '':
            abort(400, 'you have to comment')
        new_cmt_id = db.insert('COMMENT').values(
            author=curr_user[1],
            published=str(time.time()),
            comment=new_comment
        ).execute()

        # get recipe information from db and edit table RECIPE
        recipe_db = db.select('RECIPES').where(id=recipe_id).execute()
        comments = text_to_set(recipe_db[10], process_f=lambda x: int(x))
        comments.add(new_cmt_id)
        comments = lstSet_to_text(comments)
        db.update('RECIPES').set(comments=comments).where(id=recipe_id).execute()
        return {
            'message': 'ok'
        }


@recipe.route('/search', strict_slashes=False)
class Search(Resource):
    @recipe.response(200, 'Success')
    @recipe.response(403, 'Invalid Token')
    @recipe.response(400, 'Not valid request form')
    @recipe.expect(auth_details)
    @recipe.param('qp', 'the query param of searching')
    @recipe.param('sort', 'the order of result could be either in time or liked_num')
    @recipe.doc(description='''
        Let current user able to search for the recipes. users could find recipes they are interested 
        in based on any combination of the following: ingredients, method, meal-type(s), recipe name; 
        search query should in the field 'qp' and must be provided
    ''')
    def get(self):
        curr_user = authorize(request)
        # get request param qp
        search_param = get_request_arg('qp', required=True)
        sort_param = get_request_arg('sort', required=True, default='published')
        result_recipes = []
        result_ids = {}

        # split the search param by whitespace
        sp_lst = search_param.split()

        # check if the param sort in well format
        if sort_param not in ['liked_num', 'published']:
            abort(400, 'the parameter sort should either be published or liked_num, no other choice')

        # for every key words, search in db
        for kw in sp_lst:
            query = f"SELECT id FROM RECIPES WHERE instr(lower(ingredients || name || meal_type || method), lower('{kw}')) > 0;"
            result_ids_raw = db.raw(query)
            result_ids = {rid[0] for rid in result_ids_raw}

        if result_ids:
            query_id = ','.join([f"'{e}'" for e in result_ids])
            query = f'SELECT * FROM RECIPES WHERE id in ({query_id})'
            db_recipes = db.raw(query)
            result_recipes = [format_recipe(rcp) for rcp in db_recipes]

            result_recipes.sort(reverse=True, key=lambda x: float(x[sort_param]))
        return {
            'recipes': result_recipes
        }


@recipe.route('/recommend', strict_slashes=False)
class Recommend(Resource):
    @recipe.response(200, 'Success')
    @recipe.response(403, 'Invalid Token')
    @recipe.response(400, 'Not valid request form')
    @recipe.response(405, 'No such recipe found in db')
    @recipe.expect(auth_details)
    @recipe.param('id', 'the id of the recipe to be compared with')
    @recipe.doc(description='''
        Let current user able to get recommendation with provided recipe. And the recipe id should be provided to 
        get recommendation. When the similarity is more than 50% you will get recommendation. This will give 
        recommendation over the similarity between ingredients of two recipes.
    ''')
    def get(self):
        curr_user = authorize(request)

        # get request recipe which need to be recommended
        recipe_id = get_request_arg('id', int, required=True)

        if not db.exists('RECIPES').where(id=recipe_id):
            abort(405, 'No such recipe found in db, you should provide valid id')

        result_recipes = []
        result_ids = set()

        provided_recipe = db.select('RECIPES').where(id=recipe_id).execute()
        provided_ingredients = text_to_set(provided_recipe[3])
        all_recipes = db.select_all('RECIPES').execute()

        # make comparison between provided recipe and recipe in database
        # the first info in result is recipe, second is similarity
        for rcp_db in all_recipes:
            rcp_db_ingredients = text_to_set(rcp_db[3])
            union_len = len(set.intersection(provided_ingredients, rcp_db_ingredients))
            similarity = union_len / len(provided_ingredients)
            if similarity > 0:
                tmp = (format_recipe(rcp_db), similarity)
                result_recipes.append(tmp)

        if result_recipes:
            result_recipes.sort(reverse=True, key=lambda x: x[1])

        return {
            'recipes': result_recipes
        }
