import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (check cookie/session)
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/me', {
        credentials: 'include'
      });
      if (res.ok) {
        setAuthed(true);
      }
    } catch (err) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setAuthed(false);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return authed ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onSuccess={() => setAuthed(true)} />
  );
}