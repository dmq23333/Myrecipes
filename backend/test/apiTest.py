import json
import requests
import os

from unittest import TestCase
from unittest.mock import patch

from app import app
import namespaces.auth
import namespaces.user
import namespaces.recipe
import namespaces.categories

from util.DB_Interface import DB


# unit test123 for testing api
class TestAuth(TestCase):
    def setUp(self) -> None:
        self.url = 'http://localhost:5000/'
        self.app = app.test_client()
        self.headers = {'Content-Type': 'application/json',
                        'Authorization': 'T 79dcd9eb0e63576566061260236873b1a1b7f5490558f3d66ecaecde25c91145'}

    # test login api in different request and returning different result code
    def test_login(self):
        # case 200 success login
        body = {"username": "testUser1", "password": "1234"}
        res = self.app.post(self.url + 'auth/login', json=body)
        self.assertEqual(res.status_code, 200)

        # getting result
        # print(res.status_code)
        # print(res.__dict__)
        # print(res.get_data(as_text=True))

        # case 400 missing username or password
        body = {"password": "1234"}
        res = self.app.post(self.url + 'auth/login', json=body)
        self.assertEqual(res.status_code, 400)
        self.assertTrue('Expected request object to contain in body: username"' in res.get_data(as_text=True))

        # case 403
        body = {"username": "testUser", "password": "5678"}
        res = self.app.post(self.url + 'auth/login', json=body)
        self.assertEqual(res.status_code, 403)
        self.assertTrue('Invalid Username/Password' in res.get_data(as_text=True))

    def test_signup(self):
        # case 200 success signup
        body = {"username": "dummyUser1", "password": "1234", "email": "testSignup@test.com"}
        res = self.app.post(self.url + 'auth/signup', json=body)
        self.assertEqual(res.status_code, 200)

        # case 400 missing username or email
        body = {"password": "1234"}
        res = self.app.post(self.url + 'auth/signup', json=body)
        self.assertEqual(res.status_code, 400)
        self.assertTrue('Expected request object to contain in body: username, email"' in res.get_data(as_text=True))

        # case 409 username has been used
        body = {"username": "testUser1", "password": "5678", "email": "testSignup@test.com"}
        res = self.app.post(self.url + 'auth/signup', json=body)
        self.assertEqual(res.status_code, 409)
        self.assertTrue('Username Taken' in res.get_data(as_text=True))


class TestUser(TestCase):
    def setUp(self) -> None:
        self.url = 'http://localhost:5000/'
        self.app = app.test_client()
        self.headers = {'Content-Type': 'application/json',
                        'Authorization': 'T ddb696062c3f4ce301c17f71ec964d80b37b88cb623439918d9b086f2ef7cdfe'}

    def test_patchuser(self):
        # # case 200 success patch user
        body = {"username": "dummyPatchUser0", "password": "1234", "email": "testSignup@test.com"}
        res = self.app.patch(self.url + 'user/', json=body, headers=self.headers)
        self.assertEqual(res.status_code, 200)

        # case 400 missing email or password
        body = {"password": ''}
        res = self.app.patch(self.url + 'user/', json=body, headers=self.headers)
        self.assertEqual(res.status_code, 400)
        self.assertTrue('Missing password' in res.get_data(as_text=True))

        # case 403 token not found in db
        header = {'Content-Type': 'application/json',
                  'Authorization': 'T ddb696062c3f4ce301c17f71ec964d80b37b83439918d9b086f2ef7cdf1'}
        body = {"password": ''}
        res = self.app.patch(self.url + 'user/', json=body, headers=header)
        self.assertEqual(res.status_code, 403)
        self.assertTrue('Your Token is not valid' in res.get_data(as_text=True))

        # case 409 username has been used
        body = {"username": "dummyPatchUser0", "password": "5678"}
        res = self.app.patch(self.url + 'user/', json=body, headers=self.headers)
        self.assertEqual(res.status_code, 409)
        self.assertTrue('Username Taken' in res.get_data(as_text=True))

    def test_getUser(self):
        # case 200 success get user
        res = self.app.get(self.url + 'user/', headers=self.headers)
        self.assertEqual(res.status_code, 200)

        # case 405 user not found
        res = self.app.get(self.url + 'user/?username=dummy', headers=self.headers)
        self.assertEqual(res.status_code, 405)
        self.assertTrue('User Not Found' in res.get_data(as_text=True))

        # case 403 token not found in db
        header = {'Content-Type': 'application/json',
                  'Authorization': 'T ddb696062c3f4ce301c17f71ec964d80b37b83439918d9b086f2ef7cdf1'}
        res = self.app.get(self.url + 'user/?username=dummy', headers=header)
        self.assertEqual(res.status_code, 403)
        self.assertTrue('Your Token is not valid' in res.get_data(as_text=True))

        # case 400 not valid request parameter
        res = self.app.get(self.url + 'user/?sort=likes', headers=self.headers)
        self.assertEqual(res.status_code, 400)
        self.assertTrue('the parameter sort should either be published or liked_num, no other choice' in res.get_data(as_text=True))

    def test_getUserFeed(self):
        # case 200 success get user
        res = self.app.get(self.url + 'user/feed', headers=self.headers)
        self.assertEqual(res.status_code, 200)

        # case 403 token not found in db
        header = {'Content-Type': 'application/json',
                  'Authorization': 'T ddb696062c3f4ce301c17f71ec964d80b37b83439918d9b086f2ef7cdf1'}
        res = self.app.get(self.url + 'user/feed?username=dummy', headers=header)
        self.assertEqual(res.status_code, 403)
        self.assertTrue('Your Token is not valid' in res.get_data(as_text=True))

        # case 400 not valid request parameter
        res = self.app.get(self.url + 'user/feed?sort=likes', headers=self.headers)
        self.assertEqual(res.status_code, 400)
        self.assertTrue('the parameter sort should either be published or liked_num, no other choice' in res.get_data(as_text=True))


if __name__ == '__main__':
    # TestAuth().test_login()
    TestAuth().test_signup()
