from util.globals import *
from util.models import *
from util.handle_request import *
from flask_restx import Resource, abort

categories = api.namespace('categories', description='Category Services')


@categories.route('/', strict_slashes=False)
class Categories(Resource):
    @categories.response(200, 'Success')
    @categories.response(405, 'No recipe yet/No recipe for this category')
    @categories.response(400, 'Not valid requested form')
    @categories.param('name', 'name of the category requested')
    @categories.param('sort', 'the order of the requested recipes, only in [time, liked_num]')
    @categories.expect(auth_details)
    @categories.doc(description='''
        get all recipes categories when category name is not provided. And also provide all recipes 
        belong to the category
    ''')
    def get(self):
        category_name = get_request_arg('name')
        _ = authorize(request)
        sort_order = get_request_arg('sort', default='published')

        # if meal_type is provided then return recipe Lst, otherwise return the categories instead
        if category_name:
            query = f"SELECT * FROM RECIPES WHERE meal_type = '{category_name}'"
        else:
            query = 'SELECT DISTINCT meal_type FROM RECIPES;'
        result_raw = db.raw(query)
        if not result_raw:
            abort(405, 'No recipe yet')
        if category_name:
            # make sure the requested params is in valid form
            if sort_order not in ['published', 'liked_num']:
                abort(400, 'the parameter sort should either be published or liked_num, no other choice')

            all_recipes = [format_recipe(row) for row in result_raw]
            all_recipes.sort(reverse=True, key=lambda x: float(x[sort_order]))
            return {
                "recipes": all_recipes
            }
        else:
            return {
                'categories': result_raw
            }
