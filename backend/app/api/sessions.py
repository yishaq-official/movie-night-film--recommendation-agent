import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import tables
from app.schemas import schemas

from typing import List
from app.agent.recommender import GroupRecommendationAgent

# Create a router specifically for session/room related endpoints
router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

def generate_room_code(length: int = 6) -> str:
    """Generates a random uppercase string like 'X7B9TQ'"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@router.post("/", response_model=schemas.Room, status_code=status.HTTP_201_CREATED)
def create_room(db: Session = Depends(get_db)):
    """Creates a new movie night room with a unique 6-character code."""
    # Ensure the code is unique in the database
    while True:
        code = generate_room_code()
        existing_room = db.query(tables.Room).filter(tables.Room.id == code).first()
        if not existing_room:
            break

    new_room = tables.Room(id=code, status="gathering")
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.get("/{room_id}", response_model=schemas.Room)
def get_room(room_id: str, db: Session = Depends(get_db)):
    """Fetches the current status of a room and all users inside it."""
    room = db.query(tables.Room).filter(tables.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room

@router.post("/{room_id}/join", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def join_room(room_id: str, user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Adds a new user to an existing room."""
    room = db.query(tables.Room).filter(tables.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    
    # If this is the very first user joining, make them the host
    is_host = 1 if len(room.users) == 0 else 0
    
    new_user = tables.User(room_id=room_id, name=user.name, is_host=is_host)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/{room_id}/recommendations", response_model=List[schemas.RecommendedMovie])
async def generate_room_recommendations(room_id: str, db: Session = Depends(get_db)):
    """
    Triggers the AI agent to calculate the best movies for the group.
    """
    room = db.query(tables.Room).filter(tables.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
        
    # Change status to show the room is no longer just gathering
    room.status = "voting"
    db.commit()

    agent = GroupRecommendationAgent(db=db, room_id=room_id)
    recommendations = await agent.get_recommendations()
    
    return recommendations