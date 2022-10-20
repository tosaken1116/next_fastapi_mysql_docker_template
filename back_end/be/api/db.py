from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import os
USER = os.environ.get('MYSQL_USER')
PASSWORD = os.environ.get('MYSQL_PASSWORD')
HOST = "db:3308"
DB_NAME = os.environ.get('MYSQL_DATABASE')

DATABASE = 'mysql://%s:%s@%s/%s?charset=utf8' % (
    USER,
    PASSWORD,
    HOST,
    DB_NAME,
)

ENGINE = create_engine(
    DATABASE,
    encoding="utf-8",
    echo=True
)

session = scoped_session(
    sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=ENGINE
    )
)

Base = declarative_base()
Base.query = session.query_property()
