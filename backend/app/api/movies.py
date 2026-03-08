# backend/app/api/movies.py
from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.tmdb import tmdb_client

router = APIRouter(prefix="/api/movies", tags=["Movies"])

@router.get("/test-fetch")
async def test_fetch_movies(
    genres: str = Query(None, description="Comma-separated genre IDs (e.g. 28,12)"),
    year_min: int = Query(None),
    min_rating: float = Query(5.0)
):
    """Test endpoint to verify TMDb connection."""
    
    # Convert "28,12" string into [28, 12] list
    genre_list = [int(g) for g in genres.split(",")] if genres else None
    
    movies = await tmdb_client.discover_movies(
        with_genres=genre_list,
        year_min=year_min,
        min_rating=min_rating
    )
    
    return {"count": len(movies), "results": movies}