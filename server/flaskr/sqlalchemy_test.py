from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String


def init_db(app):
    db = SQLAlchemy(app)

    class FLASKDB(db.Model):
        __tablename__ = 'flask_table'

        id = db.Column(Integer, primary_key=True, autoincrement=True)
        username = db.Column(String, unique=True, nullable=False)

    db.create_all()
