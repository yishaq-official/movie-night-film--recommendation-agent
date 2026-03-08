from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)
    status = Column(String, default="gathering") # 'gathering', 'voting', 'finished'
    
    # FIXED: back_populates instead of back_path
    users = relationship("User", back_populates="room", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"))
    name = Column(String, index=True)
    is_host = Column(Integer, default=0) # 1 for True, 0 for False 

    # FIXED: back_populates instead of back_path
    room = relationship("Room", back_populates="users")
    preferences = relationship("Preference", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    favorite_genres = Column(JSON, default=list)
    disliked_genres = Column(JSON, default=list)
    
    preferred_year_min = Column(Integer, nullable=True)
    preferred_year_max = Column(Integer, nullable=True)
    min_rating = Column(Float, default=5.0)

    # FIXED: back_populates instead of back_path
    user = relationship("User", back_populates="preferences")

class MovieCache(Base):
    __tablename__ = "movies_cache"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    title = Column(String, index=True)
    genres = Column(JSON) 
    rating = Column(Float)
    poster_url = Column(String)
    trailer_url = Column(String, nullable=True) 
    popularity = Column(Float)