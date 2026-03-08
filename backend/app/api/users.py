from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import tables
from app.schemas import schemas

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/{user_id}/preferences", response_model=schemas.Preference)
def submit_preferences(
    user_id: int, 
    pref_data: schemas.PreferenceCreate, 
    db: Session = Depends(get_db)
):
    """
    Submit or update movie preferences for a specific user.
    """
    # 1. Verify the user actually exists
    user = db.query(tables.User).filter(tables.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found."
        )

    # 2. Check if this user already has preferences saved
    existing_pref = db.query(tables.Preference).filter(tables.Preference.user_id == user_id).first()

    if existing_pref:
        # Update existing preferences
        existing_pref.favorite_genres = pref_data.favorite_genres
        existing_pref.disliked_genres = pref_data.disliked_genres
        existing_pref.preferred_year_min = pref_data.preferred_year_min
        existing_pref.preferred_year_max = pref_data.preferred_year_max
        existing_pref.min_rating = pref_data.min_rating
        
        db.commit()
        db.refresh(existing_pref)
        return existing_pref
    else:
        # Create new preferences
        new_pref = tables.Preference(
            user_id=user_id,
            favorite_genres=pref_data.favorite_genres,
            disliked_genres=pref_data.disliked_genres,
            preferred_year_min=pref_data.preferred_year_min,
            preferred_year_max=pref_data.preferred_year_max,
            min_rating=pref_data.min_rating
        )
        db.add(new_pref)
        db.commit()
        db.refresh(new_pref)
        return new_pref