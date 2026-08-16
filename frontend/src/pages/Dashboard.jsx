import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';  

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docsRes, convosRes] = await Promise.all([
          api.get('/stats'),
          api.get('/documents'),
          api.get('/chat/conversations'),
        ]);
        setStats(statsRes.data);
        setDocuments(docsRes.data.documents.slice(0, 4));
        setConversations(convosRes.data.conversations.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusStyles = {
    ready: 'bg-green-950 text-green-400',
    processing: 'bg-yellow-950 text-yellow-400',
    failed: 'bg-red-950 text-red-400',
  };

  if (loading) {
    return <div className="min-h-screen bg-bg" />;
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <div className="flex-1 text-white p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Good to see you, {user?.name}</h1>
        <p className="text-muted text-sm mt-1">Here's what's happening with your documents today.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-panel border border-border rounded-2xl p-5">
          <div className="text-sm text-muted mb-1">Documents</div>
          <div className="text-2xl font-semibold">{stats?.totalDocuments ?? 0}</div>
          <div className="text-xs text-subtle">Total documents</div>
        </div>
        <div className="bg-panel border border-border rounded-2xl p-5">
          <div className="text-sm text-muted mb-1">Questions</div>
          <div className="text-2xl font-semibold">
            {user?.plan === 'pro' ? '∞' : 10 - (user?.questionsToday ?? 0)}
          </div>
          <div className="text-xs text-subtle">Remaining today</div>
        </div>
        <div className="bg-panel border border-border rounded-2xl p-5">
          <div className="text-sm text-muted mb-1">Plan</div>
          <div className="text-2xl font-semibold capitalize">{user?.plan}</div>
          <div className="text-xs text-subtle">Current plan</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-panel border border-border rounded-2xl p-5">
          <h2 className="text-sm font-medium mb-3">Recent documents</h2>
          {documents.length === 0 && (
            <p className="text-sm text-subtle">No documents yet.</p>
          )}
          {documents.map((doc) => (
            <div key={doc._id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div>
                <div className="text-sm">{doc.originalName}</div>
                <div className="text-xs text-subtle">{doc.chunkCount} chunks</div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-md capitalize ${statusStyles[doc.status]}`}>
                {doc.status}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-panel border border-border rounded-2xl p-5">
          <h2 className="text-sm font-medium mb-3">Recent conversations</h2>
          {conversations.length === 0 && (
            <p className="text-sm text-subtle">No conversations yet.</p>
          )}
          {conversations.map((c) => (
            <div key={c._id} className="py-2.5 border-b border-border last:border-0">
              <div className="text-sm">{c.title}</div>
              <div className="text-xs text-subtle">
                {new Date(c.updatedAt).toLocaleString()}
              </div>
            </div>
           ))}
           </div>
       </div>
     </div>
     </div>
   );
 }
export default Dashboard;