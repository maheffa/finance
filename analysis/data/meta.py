from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from data.model import Base

engine = create_engine('sqlite:///data/data.db')
Base.metadata.create_all(engine)
session: Session = sessionmaker(bind=engine)()
