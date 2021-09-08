from flask import Flask
from flask_restx import Api
from flask_cors import CORS

from util.DB_Interface import DB

app = Flask(__name__)
CORS(app)
api = Api(app, title="Myrecipes", description="API for Myrecipes project")
HOST_NAME = "127.0.0.1"
PORT = 5000
db = DB()
