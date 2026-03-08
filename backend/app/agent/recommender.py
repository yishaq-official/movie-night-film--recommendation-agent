# backend/app/agent/recommender.py
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import tables
from app.services.tmdb import tmdb_client

class GroupRecommendationAgent:
    def __init__(self, db: Session, room_id: str):
        self.db = db
        self.room_id = room_id
        self.alpha = 0.7  # Weight for average score (0.3 for minimum score)

    def _aggregate_constraints(self, users: List[tables.User]) -> Dict[str, Any]:
        """Combines all user preferences to build a broad TMDb search query."""
        all_favorite_genres = set()
        all_disliked_genres = set()
        min_years = []
        
        for user in users:
            if user.preferences:
                all_favorite_genres.update(user.preferences.favorite_genres)
                all_disliked_genres.update(user.preferences.disliked_genres)
                if user.preferences.preferred_year_min:
                    min_years.append(user.preferences.preferred_year_min)

        # Remove dislikes from the combined favorites pool
        safe_genres = all_favorite_genres - all_disliked_genres

        return {
            "with_genres": list(safe_genres)[:3], # TMDb works best with 1-3 broad genres
            "without_genres": list(all_disliked_genres),
            "year_min": min(min_years) if min_years else None
        }

    def _calculate_user_score(self, movie: Dict[str, Any], prefs: tables.Preference) -> float:
        """Calculates how much a single user will like a specific movie (0-100 scale)."""
        if not prefs:
            return 50.0 # Neutral score if no preferences submitted

        score = 50.0
        movie_genres = set(movie.get("genre_ids", []))

        # 1. Immediate Veto (Misery check)
        if movie_genres.intersection(set(prefs.disliked_genres)):
            return 0.0  # Absolute dealbreaker

        # 2. Genre Match Bonus
        match_count = len(movie_genres.intersection(set(prefs.favorite_genres)))
        score += (match_count * 15.0)

        # 3. Rating Adjustment
        movie_rating = movie.get("vote_average", 5.0)
        if movie_rating >= prefs.min_rating:
            score += 10.0
        else:
            score -= 20.0 # Penalty for being below their quality threshold

        # 4. Release Year Check
        release_year = int(movie.get("release_date", "2000")[:4]) if movie.get("release_date") else 2000
        if prefs.preferred_year_min and release_year < prefs.preferred_year_min:
            score -= 15.0
        if prefs.preferred_year_max and release_year > prefs.preferred_year_max:
            score -= 15.0

        return min(max(score, 0.0), 100.0) # Clamp between 0 and 100

    async def get_recommendations(self) -> List[Dict[str, Any]]:
        """The main orchestrator function."""
        room = self.db.query(tables.Room).filter(tables.Room.id == self.room_id).first()
        if not room or not room.users:
            return []

        # 1. Aggregate
        constraints = self._aggregate_constraints(room.users)
        
        # 2. Fetch Candidates
        candidates = await tmdb_client.discover_movies(
            with_genres=constraints["with_genres"],
            without_genres=constraints["without_genres"],
            year_min=constraints["year_min"]
        )

        scored_movies = []

        # 3. Score using "Least Misery"
        for movie in candidates:
            user_scores = [self._calculate_user_score(movie, u.preferences) for u in room.users]
            
            if not user_scores:
                continue
                
            avg_score = sum(user_scores) / len(user_scores)
            min_score = min(user_scores)

            # Veto: If any single user scored it 0, drop the movie entirely
            if min_score == 0.0:
                continue

            # The Least Misery Formula
            final_score = (self.alpha * avg_score) + ((1.0 - self.alpha) * min_score)

            movie_data = {
                "tmdb_id": movie["id"],
                "title": movie["title"],
                "genres": movie.get("genre_ids", []),
                "rating": movie.get("vote_average", 0.0),
                "poster_url": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path', '')}",
                "popularity": movie.get("popularity", 0.0),
                "match_score": round(final_score, 1)
            }
            scored_movies.append(movie_data)

        # 4. Sort by highest match score and return top 10
        scored_movies.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_movies[:10]