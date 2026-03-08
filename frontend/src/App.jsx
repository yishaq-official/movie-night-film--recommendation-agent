// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark text-white font-sans selection:bg-netflix selection:text-white">
        
        <nav className="p-6">
          <h1 className="text-3xl font-bold text-netflix tracking-wider">
            MOVIE NIGHT AGENT
          </h1>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
            <Route path="/results/:roomId" element={<Results />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;