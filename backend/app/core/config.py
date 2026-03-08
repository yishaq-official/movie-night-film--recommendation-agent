# backend/app/core/config.py
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

if not TMDB_API_KEY:
    print("WARNING: TMDB_API_KEY is not set in the .env file.")