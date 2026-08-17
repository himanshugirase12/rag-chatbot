import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Chat() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [selectedSources, setSelectedSources] = useState(null);
  const bottomRef = useRef(null);
  const { refreshUser } = useAuth();

  const fetchConversations = async () => {
    const res = await api.get('/chat/conversations');
    setConversations(res.data.conversations);
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
  
    try {
      await api.delete(`/chat/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (id === conversationId) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const fetchMessages = async (id) => {
    const res = await api.get(`/chat/conversations/${id}/messages`);
    setMessages(res.data.messages);
    const lastAssistant = [...res.data.messages].reverse().find((m) => m.role === 'assistant');
    setSelectedSources(lastAssistant?.sources || null);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
      setSelectedSources(null);
    }
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
  
    setError('');
    const userMessage = { role: 'user', content: question, _id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    const sentQuestion = question;
    setQuestion('');
    setSending(true);
  
    try {
      const res = await api.post('/chat/ask', {
        question: sentQuestion,
        ...(conversationId && { conversationId }),
      });
  
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.answer, sources: res.data.sources, _id: Date.now() + 1 },
      ]);
      setSelectedSources(res.data.sources);
      refreshUser();
  
      if (!conversationId) {
        navigate(`/chat/${res.data.conversationId}`);
        fetchConversations();
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="h-screen bg-bg flex overflow-hidden">   
      <Sidebar />

      <div className="w-56 border-r border-border p-4 flex flex-col h-screen overflow-hidden">
        <button
          onClick={() => navigate('/chat')}
          className="w-full bg-accent hover:bg-accent-hover text-sm font-medium py-2.5 rounded-lg mb-4"
        >
          + New Chat
        </button>
        <div className="text-xs text-subtle mb-2 px-1">Recent conversations</div>
        <div className="flex flex-col gap-1 overflow-y-auto flex-1 scrollbar-hide">
        {conversations.map((c) => (
  <div
    key={c._id}
    onClick={() => navigate(`/chat/${c._id}`)}
    className={`group flex items-center justify-between text-sm px-3 py-2 rounded-lg cursor-pointer ${
      c._id === conversationId ? 'bg-panel text-white' : 'text-muted hover:bg-panel'
    }`}
  >
    <span className="truncate">{c.title}</span>
    <button
      onClick={(e) => handleDeleteConversation(e, c._id)}
      className="opacity-0 group-hover:opacity-100 text-subtle hover:text-red-400 ml-2 shrink-0"
    >
      ✕
    </button>
  </div>
))}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-hide">
          {messages.length === 0 && (
            <div className="text-subtle text-sm text-center mt-20">
              Ask a question about your documents to get started.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m._id}
              className={
                m.role === 'user'
                  ? 'self-end bg-accent text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[65%] text-sm'
                  : 'self-start bg-panel border border-border rounded-2xl rounded-bl-sm px-4 py-3.5 max-w-[75%] text-sm'
              }
            >
              {m.content}
              {m.sources?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {m.sources.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSources(m.sources)}
                      className="text-xs bg-bg border border-border rounded-md px-2.5 py-1 text-muted hover:border-accent"
                    >
                      Source {i + 1} · {Math.round(s.score * 100)}%
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-6 mb-2 bg-red-950 border border-red-900 text-red-400 text-sm rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 flex gap-2 border-t border-border">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about your documents..."
            disabled={sending}
            className="flex-1 bg-panel border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-accent hover:bg-accent-hover rounded-lg w-11 disabled:opacity-50"
          >
            →
          </button>
        </form>
      </div>

      <div className="w-64 border-l border-border p-4 h-screen overflow-y-auto scrollbar-hide">
        <h3 className="text-sm font-medium mb-3">Sources</h3>
        {!selectedSources || selectedSources.length === 0 ? (
          <p className="text-xs text-subtle">Ask a question to see cited sources here.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {selectedSources.map((s, i) => (
              <div key={i} className="bg-panel border border-border rounded-lg p-3">
                <div className="text-xs text-muted mb-1.5 line-clamp-3">{s.text}</div>
                <div className="text-xs text-green-400">{Math.round(s.score * 100)}% match</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;