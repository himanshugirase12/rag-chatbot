import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const fetchDocuments = async (query = '') => {
    try {
      const res = await api.get('/documents', { params: query ? { search: query } : {} });
      setDocuments(res.data.documents);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDocuments(search);
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  const handleUpload = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchDocuments(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments(search);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const statusStyles = {
    ready: 'bg-green-950 text-green-400',
    processing: 'bg-yellow-950 text-yellow-400',
    failed: 'bg-red-950 text-red-400',
  };

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <div className="flex-1 text-white p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Documents</h1>
            <p className="text-muted text-sm mt-1">Upload and manage your documents.</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-accent hover:bg-accent-hover text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files[0])}
          />
        </div>

        {error && (
          <div className="bg-red-950 border border-red-900 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-10 text-center mb-6 cursor-pointer hover:border-accent transition-colors"
        >
          <div className="text-sm">Drag and drop your files here</div>
          <div className="text-xs text-subtle mt-1">or click to browse · PDF, DOCX, TXT</div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full bg-panel border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent mb-4"
        />

        {loading ? (
          <p className="text-sm text-subtle">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-subtle">No documents found.</p>
        ) : (
          <div className="bg-panel border border-border rounded-2xl divide-y divide-border">
            {documents.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm">{doc.originalName}</div>
                  <div className="text-xs text-subtle">{doc.chunkCount} chunks</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-md capitalize ${statusStyles[doc.status]}`}>
                    {doc.status}
                  </span>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="text-subtle hover:text-red-400 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;