from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

# --- PREFERENCES ---
class PreferenceBase(BaseModel):
    favorite_genres: List[int] = Field(default_factory=list, description="List of TMDb genre IDs")
    disliked_genres: List[int] = Field(default_factory=list, description="List of TMDb genre IDs to avoid")
    preferred_year_min: Optional[int] = None
    preferred_year_max: Optional[int] = None
    min_rating: float = Field(default=5.0, ge=0.0, le=10.0)

class PreferenceCreate(PreferenceBase):
    pass

class Preference(PreferenceBase):
    id: int
    user_id: int
    
    model_config = ConfigDict(from_attributes=True)

# --- USERS ---
class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    # The first user to join a room will be marked as host automatically in the route
    pass

class User(UserBase):
    id: int
    room_id: str
    is_host: int
    preferences: Optional[Preference] = None
    
    model_config = ConfigDict(from_attributes=True)

# --- ROOMS ---
class RoomBase(BaseModel):
    status: str

class Room(RoomBase):
    id: str
    users: List[User] = []
    
    model_config = ConfigDict(from_attributes=True)

# --- MOVIES (For Cache & Agent Output) ---
class MovieBase(BaseModel):
    tmdb_id: int
    title: str
    genres: List[int]
    rating: float
    poster_url: str
    trailer_url: Optional[str] = None
    popularity: float

class Movie(MovieBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# --- RECOMMENDATION OUTPUT ---
class RecommendedMovie(MovieBase):
    match_score: float = Field(..., description="The agent's calculated group satisfaction score")