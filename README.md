# Movie Night Agent

Movie Night Agent is a small, two-app project that helps coordinate a movie night. The backend handles movie data, recommendations, and persistence; the frontend provides the UI to browse options and run the session. The goal is to make it easy for a group to discover movies, vote or shortlist, and pick a final watch.

## What This Does
- Fetches and enriches movie data (e.g., posters, metadata, trailers).
- Supports workflows to build a short list for a movie night.
- Keeps state in a database so sessions can be revisited or shared.

## Typical Process
1. Start a movie night session.
2. Pull movie candidates from an external source and/or user input.
3. Review details (synopsis, rating, runtime, trailer).
4. Shortlist or vote on candidates.
5. Pick a final movie and save the decision.

## Repo Layout
- `backend/` API and services
- `frontend/` UI

## Getting Started
1. Install dependencies in each app:
   - Backend: follow instructions in `backend/`.
   - Frontend: follow instructions in `frontend/`.
2. Run the backend and frontend in separate terminals.

## Configuration
- Environment variables and secrets are defined per app.
- See each app directory for `.env` examples or setup guidance.

## Development Notes
- The backend is responsible for external API integrations and database access.
- The frontend should only talk to the backend API, not third-party services directly.

## Notes
- See each app directory for environment variables and setup details.
