from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite stores the database in a local file named 'movie_night.db'
SQLALCHEMY_DATABASE_URL = "sqlite:///./movie_night.db"

# connect_args={"check_same_thread": False} is required ONLY for SQLite in FastAPI
# because FastAPI can handle multiple requests concurrently.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency function to get the database session in our routes later
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()