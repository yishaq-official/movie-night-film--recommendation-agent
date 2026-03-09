import axios from 'axios';

// Use the environment variable if deployed, otherwise fallback to local development
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sessionService = {
  createRoom: () => apiClient.post('/sessions/'),
  getRoom: (roomId) => apiClient.get(`/sessions/${roomId}`),
  joinRoom: (roomId, name) => apiClient.post(`/sessions/${roomId}/join`, { name }),
  getRecommendations: (roomId) => apiClient.get(`/sessions/${roomId}/recommendations`),
};

export const userService = {
  submitPreferences: (userId, preferences) => 
    apiClient.post(`/users/${userId}/preferences`, preferences),
};

export default apiClient;