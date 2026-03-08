
import httpx
from typing import Optional
from app.core.config import YOUTUBE_API_KEY, YOUTUBE_BASE_URL

class YouTubeService:
    def __init__(self):
        self.api_key = YOUTUBE_API_KEY
        self.base_url = YOUTUBE_BASE_URL

    async def get_trailer_url(self, movie_title: str, year: int = None) -> Optional[str]:
        """
        Searches YouTube for the official movie trailer and returns an embed URL.
        """
        if not self.api_key:
            return None

        url = f"{self.base_url}/search"
        
        
        query = f"{movie_title} {year if year else ''} official trailer"
        
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": 1,
            "key": self.api_key
        }

        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    if items:
                        video_id = items[0]["id"]["videoId"]
                        
                        return f"https://www.youtube.com/embed/{video_id}"
            except Exception as e:
                print(f"YouTube API Error: {e}")
                
        return None


youtube_client = YouTubeService()