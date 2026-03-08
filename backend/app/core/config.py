import os
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3"

if not TMDB_API_KEY:
    print("WARNING: TMDB_API_KEY is not set.")
if not YOUTUBE_API_KEY:
    print("WARNING: YOUTUBE_API_KEY is not set.")