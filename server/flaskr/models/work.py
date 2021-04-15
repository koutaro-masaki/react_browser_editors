from ..db import db
from sqlalchemy import Column, Integer, String


class Work(db.Model):
    __tablename__ = 'works'

    id = db.Column(Integer, primary_key=True, autoincrement=True)
    html = db.Column(String, nullable=False, default='<h1>Hello, World!</h1>')
    css = db.Column(String, nullable=False, default='')
    javascript = db.Column(String, nullable=False, default='')
