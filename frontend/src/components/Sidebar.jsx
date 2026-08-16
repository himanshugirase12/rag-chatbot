import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    await api.post('/auth/upgrade');
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItem = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ${
      isActive ? 'bg-accent text-white' : 'text-muted hover:bg-panel'
    }`;

  const questionsRemaining = user?.plan === 'pro' ? '∞' : 10 - (user?.questionsToday ?? 0);

  return (
    <div className="w-56 bg-sidebar border-r border-border flex flex-col p-4 min-h-screen">
      <div className="flex items-center gap-2 text-white font-semibold text-base mb-8 px-1">
        <span className="text-accent">✦</span> RAG AI
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink to="/" end className={navItem}>Dashboard</NavLink>
        <NavLink to="/chat" className={navItem}>Chat</NavLink>
        <NavLink to="/documents" className={navItem}>Documents</NavLink>
        <NavLink to="/profile" className={navItem}>Profile</NavLink>
      </nav>

      <div className="mt-auto">
        <div className="bg-panel rounded-xl p-3.5 mb-3">
          <div className="text-xs text-muted mb-2 capitalize">{user?.plan} plan</div>
          {user?.plan !== 'pro' && (
            <>
              <div className="text-lg font-semibold text-white mb-2">
                {questionsRemaining} <span className="text-xs text-subtle font-normal">/ 10</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${((10 - (user?.questionsToday ?? 0)) / 10) * 100}%` }}
                />
              </div>
              <button
                onClick={handleUpgrade}
                className="w-full bg-accent hover:bg-accent-hover text-white text-xs font-medium py-2 rounded-lg"
              >
                Upgrade to Pro
              </button>
            </>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-muted hover:text-white text-sm text-left px-3 py-2"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;