import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionService } from '../services/api';
import { Play, Star, Percent } from 'lucide-react';

export default function Results() {
  const { roomId } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch the agent's calculated list from the backend
        const res = await sessionService.getRecommendations(roomId);
        setMovies(res.data);
      } catch (err) {
        setError('Failed to load the agent results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [roomId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-netflix mb-4"></div>
        <h2 className="text-xl font-bold animate-pulse text-gray-300">
          Agent is finalizing the group score...
        </h2>
      </div>
    );
  }

  if (error || movies.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl text-red-500 mb-4">{error || "No matching movies found!"}</h2>
        <Link to="/" className="bg-netflix px-6 py-2 rounded font-bold">Start Over</Link>
      </div>
    );
  }

  const topPick = movies[0];
  const runnerUps = movies.slice(1);

  return (
    <div className="pb-20">
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-gray-400 uppercase tracking-widest text-sm mb-1">Room {roomId}</h2>
          <h1 className="text-3xl font-bold">Group Recommendations</h1>
        </div>
      </div>

      {/* HERO SECTION: The #1 Match */}
      <div className="relative w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden mb-12 shadow-2xl group">
        {/* Background Poster */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${topPick.poster_url})` }}
        ></div>
        
        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/50 to-transparent"></div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3">
          <div className="flex items-center space-x-4 mb-4">
            <span className="bg-green-600 text-white font-bold px-3 py-1 rounded text-sm flex items-center shadow-lg shadow-green-900/50">
              <Percent className="w-4 h-4 mr-1" /> {topPick.match_score} Match
            </span>
            <span className="flex items-center text-yellow-500 font-bold bg-black/50 px-3 py-1 rounded text-sm backdrop-blur-sm">
              <Star className="w-4 h-4 mr-1" fill="currentColor" /> {topPick.rating.toFixed(1)}
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">{topPick.title}</h2>
          <p className="text-gray-300 text-lg mb-8 line-clamp-3 max-w-2xl drop-shadow-md">
            The Agent has determined this is the absolute best movie for everyone in your group based on your combined preferences.
          </p>

          <div className="flex space-x-4">
            {/* The streaming link for your class presentation */}
            <a 
              href={`https://t4tsa.cc/movie/${topPick.tmdb_id}`} 
              target="_blank" 
              rel="noreferrer"
              className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-8 rounded flex items-center transition-colors text-lg"
            >
              <Play className="w-6 h-6 mr-2 fill-current" /> Play Now
            </a>
            
            {topPick.trailer_url && (
              <a 
                href={topPick.trailer_url} 
                target="_blank" 
                rel="noreferrer"
                className="bg-gray-500/50 hover:bg-gray-500/70 text-white font-bold py-3 px-8 rounded flex items-center backdrop-blur-sm transition-colors text-lg border border-gray-400/30"
              >
                Watch Trailer
              </a>
            )}
          </div>
        </div>
      </div>

      {/* RUNNER UPS ROW (Horizontal Scroll) */}
      <h3 className="text-2xl font-bold mb-4 text-gray-200">More Great Matches</h3>
      
      {/* Scrollable Container */}
      <div className="flex overflow-x-auto space-x-4 pb-8 snap-x hide-scrollbar">
        {runnerUps.map((movie) => (
          <MovieCard key={movie.tmdb_id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

// Sub-component for the individual Netflix-style cards
function MovieCard({ movie }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex-none w-48 md:w-64 snap-start transition-all duration-300 transform hover:scale-105 hover:z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-[#222] rounded-lg overflow-hidden shadow-xl border border-gray-800 h-full flex flex-col cursor-pointer">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] w-full bg-gray-900">
          <img 
            src={movie.poster_url} 
            alt={movie.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Top Right Match Badge */}
          <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs font-bold px-2 py-1 rounded shadow-lg backdrop-blur-sm border border-green-500/50">
            {movie.match_score}
          </div>
        </div>

        {/* Info Area (Visible on Hover) */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/90 p-4 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h4 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{movie.title}</h4>
              <div className="flex items-center text-xs text-gray-400 mb-3 space-x-2">
                <span className="flex items-center text-yellow-500">
                  <Star className="w-3 h-3 mr-1" /> {movie.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span>TMDb</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <a 
                href={`https://t4tsa.cc/movie/${movie.tmdb_id}`} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full text-center bg-netflix hover:bg-red-700 text-white text-sm font-bold py-2 rounded transition-colors"
              >
                Play Movie
              </a>
              {movie.trailer_url && (
                <a 
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noreferrer" 
                  className="block w-full text-center border border-gray-500 hover:bg-gray-800 text-white text-sm py-2 rounded transition-colors"
                >
                  Trailer
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}