// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import Results from './pages/Results';
import logo from './assets/logo.png';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark text-white font-sans selection:bg-netflix selection:text-white">
        <nav className="px-4 pt-6 md:px-6">
          <div className="container mx-auto">
            <Link
              to="/"
              className="group inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:border-netflix/50 hover:bg-white/[0.08]"
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-netflix via-red-700 to-orange-500 p-[2px] shadow-[0_0_28px_rgba(229,9,20,0.35)]">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[#171717]">
                  <img
                    src={logo}
                    alt="Movie Night Agent logo"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </span>
              </span>
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.26em] text-gray-300">
                  Movie Night
                </p>
                <p className="text-xl font-bold tracking-[0.2em] text-netflix transition-colors duration-300 group-hover:text-red-400 md:text-2xl">
                  Agent
                </p>
              </div>
            </Link>
          </div>
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
