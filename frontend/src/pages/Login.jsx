import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      await login(res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-bg flex">
      <div className="hidden md:flex w-1/2 flex-col justify-center px-16 border-r border-border">
        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-10">
          <span className="text-accent">✦</span> RAG AI
        </div>
        <h1 className="text-3xl font-bold text-white leading-tight mb-4">
          Chat with your documents using AI
        </h1>
        <p className="text-muted text-sm mb-8 max-w-sm">
          Upload your documents and get intelligent answers backed by real sources.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-gray-300">
            <span className="text-green-400">✓</span> Upload PDFs, DOCX, TXT & more
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-300">
            <span className="text-green-400">✓</span> Ask questions and get accurate answers
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-300">
            <span className="text-green-400">✓</span> Get source citations for every answer
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-300">
            <span className="text-green-400">✓</span> Organize and revisit your conversations
          </div>
        </div>
      </div>
  
      <div className="w-full md:w-1/2 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
        
        <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
        <p className="text-muted text-sm mb-8">Sign in to continue to RAG AI</p>

        {error && (
          <div className="bg-red-950 border border-red-900 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-panel border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              className="w-full bg-panel border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;