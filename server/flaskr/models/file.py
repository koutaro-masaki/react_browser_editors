import sqlalchemy
from ..db import db
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.schema import UniqueConstraint


class File(db.Model):
    __tablename__ = 'files'
    __table_args__ = (UniqueConstraint('work_id', 'file_name'),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    work_id = Column(Integer, ForeignKey('works.id'))
    file_name = Column(String, nullable=False, default='')
    content_type = Column(String, nullable=False, default='text/plain')
    body = Column(String, nullable=False, default='')
