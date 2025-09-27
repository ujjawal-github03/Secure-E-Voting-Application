import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render appropriate component based on user state
  if (!currentUser) {
    return <HomePage onUserLogin={setCurrentUser} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={() => setCurrentUser(null)} />;
  }

  return <UserDashboard user={currentUser} onLogout={() => setCurrentUser(null)} />;
}

export default App;