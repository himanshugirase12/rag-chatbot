import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setSavingProfile(true);
    try {
      await api.put('/auth/me', { name, email });
      await refreshUser();
      setProfileMsg('Profile updated successfully');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    setSavingPassword(true);
    try {
      await api.put('/auth/me/password', { currentPassword, newPassword });
      setPasswordMsg('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Password change failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Type DELETE to confirm');
      return;
    }
    try {
      await api.delete('/auth/me');
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="h-screen bg-bg flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 text-white p-8 flex justify-center overflow-y-auto scrollbar-hide">
  <div className="w-full max-w-4xl">
    <h1 className="text-xl font-semibold mb-1">Profile & Settings</h1>
    <p className="text-muted text-sm mb-8">Manage your account information and preferences.</p>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-panel border border-border rounded-2xl p-6">
        <h2 className="text-sm font-medium mb-4">Profile information</h2>
        {profileMsg && <div className="text-green-400 text-sm mb-3">{profileMsg}</div>}
        {profileError && <div className="text-red-400 text-sm mb-3">{profileError}</div>}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="bg-accent hover:bg-accent-hover text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-50"
          >
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="bg-panel border border-border rounded-2xl p-6">
        <h2 className="text-sm font-medium mb-4">Change password</h2>
        {passwordMsg && <div className="text-green-400 text-sm mb-3">{passwordMsg}</div>}
        {passwordError && <div className="text-red-400 text-sm mb-3">{passwordError}</div>}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="bg-accent hover:bg-accent-hover text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-50"
          >
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>

    <div className="flex justify-center">
      <div className="bg-panel border border-red-950 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-sm font-medium mb-2 text-red-400">Delete account</h2>
        <p className="text-xs text-subtle mb-4">
          This permanently deletes your account, documents, and conversations. This cannot be undone.
        </p>
        {deleteError && <div className="text-red-400 text-sm mb-3">{deleteError}</div>}
        <div className="flex gap-2">
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500"
          />
          <button
            onClick={handleDeleteAccount}
            className="bg-red-950 hover:bg-red-900 text-red-400 text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
  );
}

export default Profile;