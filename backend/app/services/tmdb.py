# backend/app/services/tmdb.py
import httpx
from typing import List, Optional, Dict, Any
from app.core.config import TMDB_API_KEY, TMDB_BASE_URL

class TMDBService:
    def __init__(self):
        self.api_key = TMDB_API_KEY
        self.base_url = TMDB_BASE_URL

    async def discover_movies(
        self,
        with_genres: Optional[List[int]] = None,
        without_genres: Optional[List[int]] = None,
        year_min: Optional[int] = None,
        year_max: Optional[int] = None,
        min_rating: Optional[float] = None,
        page: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Fetches candidate movies from TMDb based on aggregated group constraints.
        """
        url = f"{self.base_url}/discover/movie"
        
        # TMDb expects comma-separated strings for lists of genre IDs
        params = {
            "api_key": self.api_key,
            "language": "en-US",
            "sort_by": "popularity.desc",
            "page": page,
            "vote_count.gte": 100, # Ignore obscure movies with only 1 or 2 votes
        }

        if with_genres:
            params["with_genres"] = ",".join(map(str, with_genres))
        if without_genres:
            params["without_genres"] = ",".join(map(str, without_genres))
        if year_min:
            params["primary_release_date.gte"] = f"{year_min}-01-01"
        if year_max:
            params["primary_release_date.lte"] = f"{year_max}-12-31"
        if min_rating:
            params["vote_average.gte"] = min_rating

        # Use an async context manager to handle the HTTP connection
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code != 200:
                print(f"TMDb API Error: {response.text}")
                return []
                
            data = response.json()
            return data.get("results", [])

# Instantiate a single service object to be used across the app
tmdb_client = TMDBService()