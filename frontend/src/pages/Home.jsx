import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/api';

export default function Home() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Handle creating a new room and instantly joining it as the host
  const handleCreateRoom = async () => {
    if (!name.trim()) return setError('Please enter your name first.');
    
    setLoading(true);
    setError('');
    
    try {
      // 1. Create the room
      const roomRes = await sessionService.createRoom();
      const newRoomId = roomRes.data.id;
      
      // 2. Join the room to create the User record
      const joinRes = await sessionService.joinRoom(newRoomId, name);
      
      // 3. Save the user ID to localStorage so the next page knows who we are
      localStorage.setItem('userId', joinRes.data.id);
      localStorage.setItem('isHost', joinRes.data.is_host);
      
      // 4. Navigate to the waiting room
      navigate(`/room/${newRoomId}`);
    } catch (err) {
      setError('Failed to create room. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle joining an existing room
  const handleJoinRoom = async () => {
    if (!name.trim()) return setError('Please enter your name.');
    if (!roomCode.trim()) return setError('Please enter a room code.');
    
    setLoading(true);
    setError('');
    
    try {
      const code = roomCode.toUpperCase().trim();
      const joinRes = await sessionService.joinRoom(code, name);
      
      localStorage.setItem('userId', joinRes.data.id);
      localStorage.setItem('isHost', joinRes.data.is_host);
      
      navigate(`/room/${code}`);
    } catch (err) {
      // Catch specific 404 error from our FastAPI backend
      setError(err.response?.data?.detail || 'Failed to join. Check your code.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-[#181818] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center">Join Movie Night</h2>
        
        {error && (
          <div className="bg-netflix/20 border border-netflix text-red-200 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Universal Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Yishaq"
              className="w-full bg-[#222] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-netflix transition-colors"
              disabled={loading}
            />
          </div>

          <hr className="border-gray-800" />

          {/* Option 1: Create Room */}
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full bg-netflix hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create New Room'}
          </button>

          <div className="text-center text-gray-500 text-sm">OR</div>

          {/* Option 2: Join Room */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="6-DIGIT CODE"
              maxLength={6}
              className="w-2/3 bg-[#222] border border-gray-700 rounded px-4 py-3 text-white text-center tracking-widest uppercase focus:outline-none focus:border-gray-500 transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}