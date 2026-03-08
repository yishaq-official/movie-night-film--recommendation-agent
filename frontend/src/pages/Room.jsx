import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionService, userService } from '../services/api';

// Standard TMDb Genre Mapping
const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' }
];

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [roomData, setRoomData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [error, setError] = useState('');
  
  const userId = localStorage.getItem('userId');
  const isHost = localStorage.getItem('isHost') === '1';

  // Poll the server every 3 seconds to get live user updates
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await sessionService.getRoom(roomId);
        setRoomData(res.data);
        
        // If the host clicked start, redirect everyone to results
        if (res.data.status === 'voting') {
          navigate(`/results/${roomId}`);
        }
      } catch (err) {
        setError('Lost connection to the room.', err);
      }
    };

    fetchRoom(); // Initial fetch
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [roomId, navigate]);

  const toggleGenre = (genreId, type) => {
    if (type === 'favorite') {
      if (dislikes.includes(genreId)) return; // Prevent liking and disliking same genre
      setFavorites(prev => 
        prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
      );
    } else {
      if (favorites.includes(genreId)) return;
      setDislikes(prev => 
        prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
      );
    }
  };

  const handleSavePreferences = async () => {
    setIsSubmitting(true);
    try {
      await userService.submitPreferences(userId, {
        favorite_genres: favorites,
        disliked_genres: dislikes,
        min_rating: 6.0 // Setting a default baseline quality
      });
      alert("Preferences saved! Waiting for others...");
    } catch (err) {
      setError("Failed to save preferences:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerAgent = async () => {
    setAgentLoading(true);
    try {
      // This might take a few seconds as it hits TMDb and YouTube
      await sessionService.getRecommendations(roomId);
      // We don't need to navigate here; the polling useEffect will see the status change to 'voting' and navigate automatically
    } catch (err) {
      setError("Agent failed to generate recommendations:", err);
      setAgentLoading(false);
    }
  };

  if (!roomData) return <div className="text-center mt-20 text-xl">Loading room...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-[#181818] p-6 rounded-lg border border-gray-800">
        <div>
          <h2 className="text-gray-400 text-sm tracking-widest uppercase">Room Code</h2>
          <p className="text-4xl font-bold text-netflix tracking-widest">{roomId}</p>
        </div>
        
        <div className="mt-4 md:mt-0 text-right">
          <h3 className="text-gray-400 text-sm tracking-widest uppercase mb-2">People in Room</h3>
          <div className="flex flex-wrap gap-2">
            {roomData.users.map(u => (
              <span key={u.id} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                {u.name} {u.is_host === 1 && '👑'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="bg-red-500/20 text-red-200 p-4 rounded mb-6">{error}</div>}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Favorites Section */}
        <div className="bg-[#181818] p-6 rounded-lg border border-gray-800">
          <h3 className="text-xl font-bold mb-4 text-green-500">I want to watch...</h3>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button
                key={`fav-${g.id}`}
                onClick={() => toggleGenre(g.id, 'favorite')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  favorites.includes(g.id) 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                } ${dislikes.includes(g.id) ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dislikes Section */}
        <div className="bg-[#181818] p-6 rounded-lg border border-gray-800">
          <h3 className="text-xl font-bold mb-4 text-red-500">Absolutely NO...</h3>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button
                key={`dis-${g.id}`}
                onClick={() => toggleGenre(g.id, 'dislike')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dislikes.includes(g.id) 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                } ${favorites.includes(g.id) ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center space-y-4">
        <button
          onClick={handleSavePreferences}
          disabled={isSubmitting}
          className="w-full max-w-md bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          {isSubmitting ? 'Saving...' : '1. Save My Preferences'}
        </button>

        {isHost && (
          <button
            onClick={handleTriggerAgent}
            disabled={agentLoading}
            className="w-full max-w-md bg-netflix hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-netflix/30 transition-all text-lg"
          >
            {agentLoading ? 'Agent is calculating...' : '2. Find Our Movie'}
          </button>
        )}
      </div>
    </div>
  );
}