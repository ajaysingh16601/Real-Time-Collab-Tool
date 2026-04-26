import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Plus, LogIn } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Home: React.FC = () => {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!username) return setError('Please enter a username');
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/sessions/create`);
      const { sessionId: newId } = res.data;
      navigate(`/room/${newId}`, { state: { username } });
    } catch (err) {
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!username || !sessionId) return setError('Please enter username and session ID');
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/sessions/join`, { sessionId });
      navigate(`/room/${res.data.sessionId}`, { state: { username } });
    } catch (err) {
      setError('Session not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md p-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Users className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CollabFlow</h1>
          <p className="text-slate-400">Real-time collaborative workspace</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-dark-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Enter your name"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Create New Session
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-dark-900 px-2 text-slate-500">Or join existing</span>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full bg-dark-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Session ID"
              />
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 border border-slate-600 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                Join Session
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Home;
