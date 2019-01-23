# based on the tutorial by Miguel Grinberg
# https://blog.miguelgrinberg.com/
from flask import Flask
from flask_pymongo import PyMongo
from .config import Config

app = Flask(__name__)
# TODO: is this the way to use local config files!? unsecure?
app.config.from_object(Config)
mongo = PyMongo(app)


from app import routes
