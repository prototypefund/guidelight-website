import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    # TODO: MongoDB needs different/secure init!? get info on how to!?
    MONGO_URI = "mongodb://localhost:27017/ptf"

