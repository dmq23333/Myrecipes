from util.globals import *
from util.models import *
from util.handle_request import *
from flask_restx import Resource, abort

auth = api.namespace('auth', description='Authentication Services')


# login api for login function
@auth.route('/login', strict_slashes=False)
class Login(Resource):
    @auth.response(200, 'Success', token_details)
    @auth.response(400, 'Missing Username/Password')
    @auth.response(403, 'Invalid Username/Password')
    @auth.expect(login_details)
    @auth.doc(description='''
        for user to login, and return token
    ''')
    def post(self):
        j = get_request_json()
        (username, password) = unpack(j, 'username', 'password')
        if username == '' or password == '':
            abort(400, 'Username and password cannot be empty')
        if not db.exists('USER').where(username=username, password=password):
            abort(403, 'Invalid Username/Password')
        token = gen_token()
        db_r = db.update('USER').set(curr_token=token).where(username=username)
        db_r.execute()
        return {
            'token': token
        }


# signup api for login function
@auth.route('/signup', strict_slashes=False)
class Signup(Resource):
    @auth.response(200, 'Success', token_details)
    @auth.response(400, 'Missing Username/Password')
    @auth.response(409, 'Username Taken')
    @api.expect(signup_details)
    @auth.doc(description='''
        create new account, username must be unique and password should not be empty
    ''')
    def post(self):
        j = get_request_json()
        (username, password, em) = unpack(j, 'username', 'password', 'email')

        if db.exists('USER').where(username=username):
            abort(409, 'Username Taken')
        if username == '' or password == '':
            abort(400, 'Username and password cannot be empty')
        idLst = db.select_all('USER').execute()
        token = gen_token()
        db.insert('USER').values(
            curr_token=token,
            username=username,
            password=password,
            email=em,
            followed_num=0
        ).execute()
        return {
            'token': token
        }
