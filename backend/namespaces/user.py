from util.globals import *
from util.models import *
from util.handle_request import *
from flask_restx import Resource, abort
from flask import request

user = api.namespace('user', description='User Services')


@user.route('/', strict_slashes=False)
class User(Resource):
    @user.response(200, 'Success')
    @user.response(409, 'Username Taken')
    @user.response(400, 'Missing Password/Email')
    @user.response(403, 'Invalid token')
    @api.expect(user_update_details, auth_details)
    @user.doc(description='''
        change your profile which including email and password, username must be unique
         auth token must be provided, the user information to be changed on is user logged in
        If success updated, success message will return
    ''')
    def patch(self):
        curr_user = authorize(request)
        j = get_request_json()
        user_id = int(curr_user[0])

        profile_keys = ['username', 'password', 'email']
        profile = {}
        provided_info = [k for k in j.keys() if k in profile_keys]

        # error message for undue process
        if len(provided_info) < 1:
            abort(401, 'at least one of the field must be provided')
        if 'password' in provided_info and j['password'] == '':
            abort(400, 'Missing password')
        if 'email' in provided_info and j['email'] == '':
            abort(400, 'Missing email')
        if 'username' in provided_info and db.exists('USER').where(username=j['username']):
            abort(409, 'Username Taken')
        # update RECIPES table when username is altered
        if 'username' in provided_info:
            db.update('RECIPES').set(author=j['username']).where(author=curr_user[1]).execute()
        for k in provided_info:
            profile[k] = j[k]

        # update table USER when all process is ok
        db.update('USER').set(**profile).where(id=user_id).execute()

        return {
            'message': 'Success'
        }

    @user.response(200, 'Success', user_details)
    @user.response(405, 'User not found')
    @user.response(403, 'Invalid token')
    @user.response(400, 'the parameter sort should either be published or liked_num, no other choice')
    @user.param('id', 'the id of the user to get information from')
    @user.param('username', 'the username of the user to get information from')
    @user.param('sort', 'which order is required, time or likes, default sort by time')
    @api.expect(auth_details)
    @user.doc(description='''
            Get user information with provided id or username. If both provided then will account.
            If neither provided then will return information with token provided.
            Then result contains username, email, and following list, recipes list and followed_num.
            the keyword sort could either be liked_num or published, can't be in any other format
        ''')
    def get(self):
        curr_user = authorize(request)
        user_id = get_request_arg('id', int)
        username = get_request_arg('username')
        sort = get_request_arg('sort', default='published')

        # check if the param sort in well format
        if sort not in ['liked_num', 'published']:
            abort(400, 'the parameter sort should either be published or liked_num, no other choice')

        # get information from username or id provided
        if user_id or username:
            if user_id and db.exists("USER").where(id=user_id):
                user_id = int(user_id)
            elif username and db.exists("USER").where(username=username):
                user_id = int(db.select("USER").where(username=username).execute()[0])
            else:
                abort(405, "User Not Found")
        else:
            # print(u)
            user_id = int(curr_user[0])

        # get information from db
        u_db = db.select('USER').where(id=user_id).execute()

        follow_list = text_to_set(u_db[3], process_f=lambda x: int(x))
        recipe_ids = text_to_set(u_db[5], process_f=lambda x: int(x))

        recipes = []
        db_username = u_db[1]

        followed_num = if_num(u_db[4])
        liked_num = 0
        if recipe_ids:
            query_like = f"SELECT SUM(liked_num) FROM recipes where author = '{db_username}'"
            liked_num = db.raw(query_like)[0][0]
            query_recipes = f"SELECT * FROM recipes where author = '{db_username}' order by {sort} desc;"
            recipes_db = db.raw(query_recipes)
            recipes = [format_recipe(rcp) for rcp in recipes_db]
        return {
            'id': int(u_db[0]),
            'username': db_username,
            'email': u_db[2],
            'following': [int(x) for x in follow_list],
            'followed_num': followed_num,
            'recipes': recipes,
            'liked_num': liked_num
        }


@user.route('/feed', strict_slashes=False)
class Feed(Resource):
    @user.response(200, 'Success')
    @user.response(403, 'Invalid Token')
    @user.response(400, 'Not valid sort order provided')
    @user.expect(auth_details)
    @user.param('n', 'Number of recipe to fetch, default 10')
    @user.param('p', 'Page number of recipe to fetch, default 0')
    @user.param('sort', 'sort by likes or time')
    @user.doc(description='''
        return an array of recipe according to the token given user.
        It contains all of the recipe created by the user follows.
        number per page, and started page could be specified default 
        is 10 and 0. The sort param can sort the recipe by time or likes num,
        default by time
    ''')
    def get(self):
        curr_user = authorize(request)
        sort_order = get_request_arg('sort', default='published')
        number = get_request_arg('n', int, default=10)
        page = get_request_arg('p', int, default=0)

        if sort_order not in ['published', 'liked_num']:
            abort(400, 'the parameter sort should either be published or liked_num, no other choice')

        following = text_to_set(curr_user[3], process_f=lambda x: int(x))
        following = [db.select('USER').where(id=int(uid)).execute()[1] for uid in following]
        authors = ','.join([f"'{e}'" for e in following])
        q = f"SELECT * FROM recipes WHERE author in ({authors})"

        all_recipes = db.raw(q)

        all_recipes = [format_recipe(row) for row in all_recipes]

        all_recipes.sort(reverse=True, key=lambda x: float(x[sort_order]))
        if page > len(all_recipes) - 1:
            all_recipes = []
        else:
            all_recipes = all_recipes[page:page + number]
        return {
            'recipes': all_recipes,
            'userId': curr_user[0]
        }


@user.route('/subscribe', strict_slashes=False)
class Subscribe(Resource):
    @user.response(200, 'Success')
    @user.response(403, 'Invalid Token')
    @user.response(400, 'Not valid request form')
    @user.response(405, 'No such user found in db')
    @user.expect(auth_details)
    @user.param('username', 'the username of the user to be followed on')
    @user.doc(description='''
        Let current user able to subscribe other users and receive their newly updates
        The username and token string should provide. The username to be followed, and username
        have to be valid.
    ''')
    def patch(self):
        curr_user = authorize(request)
        # username to be followed
        follow_username = get_request_arg('username', required=True)
        # curr user original following list
        following_lst = text_to_set(curr_user[3], process_f=lambda x: int(x))

        # update USER and validation process
        if db.exists('USER').where(username=follow_username):
            if follow_username == curr_user[1]:
                abort(400, "Not valid request form, you can't follow yourself")
            follow_id = db.select('USER').where(username=follow_username).execute()[0]
            if follow_id not in following_lst:
                query = f'UPDATE USERS SET FOLLOWED_NUM = FOLLOWED_NUM + 1 WHERE ID = {follow_id}'
                db.raw(query)
            following_lst.add(follow_id)
            db.update('USER').set(following=lstSet_to_text(following_lst)).where(id=curr_user[0]).execute()
        else:
            abort(405, 'No such user found in db')
        return {
            'message': 'ok'
        }


@user.route('/unsubscribe', strict_slashes=False)
class UnSubscribe(Resource):
    @user.response(200, 'Success')
    @user.response(403, 'Invalid Token')
    @user.response(400, 'Not valid request form')
    @user.response(405, 'No such user found in db')
    @user.expect(auth_details)
    @user.param('username', 'username of the user to be unfollowed')
    @user.doc(description='''
        Let current user able to unsubscribe other users and stop receiving their newly updates
        The username and token string should provide. The username to be unsubscribed, and username
        have to be valid.
        
    ''')
    def patch(self):
        curr_user = authorize(request)
        # username to be unfollowed
        follow_username = get_request_arg('username', required=True)
        # curr user original following list
        following_lst = text_to_set(curr_user[3], process_f=lambda x: int(x))

        # update USER and validation process
        if db.exists('USER').where(username=follow_username):
            if follow_username == curr_user[1]:
                abort(400, "Not valid request form, you can't unfollow yourself")
            follow_id = db.select('USER').where(username=follow_username).execute()[0]
            if follow_id in following_lst:
                query = f'UPDATE USERS SET FOLLOWED_NUM = FOLLOWED_NUM - 1 WHERE ID = {follow_id}'
                db.raw(query)
            following_lst.discard(follow_id)
            db.update('USER').set(following=lstSet_to_text(following_lst)).where(id=curr_user[0]).execute()
        else:
            abort(405, 'No such user found in db')
        return {
            'message': 'ok'
        }


@user.route('/fans', strict_slashes=False)
class Fans(Resource):
    @user.response(200, 'Success')
    @user.response(403, 'Invalid Token')
    @user.response(400, 'Not valid request form')
    @user.response(405, 'No such user found in db')
    @user.expect(auth_details)
    @user.param('username', 'username of the user to be checked with')
    @user.doc(description='''
        Let current user able to view the followed list of provided user, the username must be provided
    ''')
    def get(self):
        _ = authorize(request)
        # username to be checked with
        follow_username = get_request_arg('username', required=True)
        following_users = []
        fans_users = []

        # update USER and validation process
        if db.exists('USER').where(username=follow_username):
            # Get user information with username
            check_user = db.select('USER').where(username=follow_username).execute()

            # Get user following list
            following_lst = text_to_set(check_user[3], process_f=lambda x: int(x))
            following_users = [db.select('USER').where(id=e).execute() for e in following_lst]
            following_users = [format_user(raw_query) for raw_query in following_users]

            # Get User's fans list
            query = f'SELECT ID,USERNAME,EMAIL,FOLLOWING,FOLLOWED_NUM, RECIPES FROM USERS where instr(following, {check_user[0]}) > 0;'
            raw_result = db.raw(query)
            fans_users = [format_user(raw_query) for raw_query in raw_result]

        else:
            abort(405, 'No such user found in db')
        return {
            'followings': following_users,
            'followed': fans_users
        }
