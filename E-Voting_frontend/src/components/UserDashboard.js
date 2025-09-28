import React, { useState, useEffect } from 'react';
import { User, Users, Vote, Lock, LogOut, Eye, CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const UserDashboard = () => {
  const [currentView, setCurrentView] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidatesLoaded, setCandidatesLoaded] = useState(false); // Track if candidates are loaded

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Fetch user profile
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      } else {
        setError('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidates (cached version)
  const fetchCandidates = async () => {
    if (candidatesLoaded && candidates.length > 0) {
      return; // Don't fetch if already loaded
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/candidate`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        setCandidatesLoaded(true);
      } else {
        setError('Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Error fetching candidates');
    } finally {
      setLoading(false);
    }
  };

  // Load user profile and candidates on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchCandidates(); // Load candidates once on mount
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Handle view change with optimized loading
  const handleViewChange = (view) => {
    setCurrentView(view);
    // Only fetch candidates if we're going to a candidate-related view and haven't loaded them yet
    if ((view === 'candidates' || view === 'vote') && !candidatesLoaded) {
      fetchCandidates();
    }
  };

  // Profile View Component
  const ProfileView = () => {
    if (loading && !userProfile) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!userProfile) {
      return <div className="text-center py-8 text-red-600">Failed to load profile</div>;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <User className="h-6 w-6 mr-2" />
          My Profile
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-lg text-gray-900">{userProfile.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <p className="mt-1 text-lg text-gray-900">{userProfile.age} years</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile</label>
              <p className="mt-1 text-lg text-gray-900">{userProfile.mobile}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-lg text-gray-900">{userProfile.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhar Card Number</label>
              <p className="mt-1 text-lg text-gray-900">{userProfile.aadharCardNumber}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {userProfile.role}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-3 ${userProfile.isVoted ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              Voting Status: {userProfile.isVoted ? 'Voted' : 'Not Voted'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Candidates List View Component (optimized)
  const CandidatesListView = () => {
    // Only show loading if candidates aren't loaded yet
    if (loading && !candidatesLoaded) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Candidates List
        </h2>
        
        {candidates.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No candidates available</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate, index) => (
              <div key={candidate._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{candidate.name}</h3>
                <p className="text-gray-600 flex items-center">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  {candidate.party}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Vote Component (Fixed to use candidate._id instead of array index)
  const VoteView = () => {
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [votingLoading, setVotingLoading] = useState(false);

    const handleVote = async () => {
      if (!selectedCandidate) {
        alert('Please select a candidate to vote for');
        return;
      }

      setVotingLoading(true);
      try {
        const response = await fetch(`${API_URL}/candidate/vote/${selectedCandidate}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Vote recorded successfully!');
          // Update user profile to reflect voting status
          fetchUserProfile();
          setCurrentView('profile');
        } else {
          alert(data.message || 'Failed to record vote');
        }
      } catch (error) {
        console.error('Error voting:', error);
        alert('Network error. Please try again.');
      } finally {
        setVotingLoading(false);
      }
    };

    if (userProfile && userProfile.isVoted) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
            Vote Status
          </h2>
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">You have already voted!</h3>
            <p className="text-gray-600">Thank you for participating in the election.</p>
          </div>
        </div>
      );
    }

    // Only show loading if candidates aren't loaded yet
    if (loading && !candidatesLoaded) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Vote className="h-6 w-6 mr-2" />
            Cast Your Vote
          </h2>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Vote className="h-6 w-6 mr-2" />
          Cast Your Vote
        </h2>
        
        <div>
          <p className="text-gray-600 mb-6">Select a candidate to vote for:</p>
          
          <div className="space-y-3 mb-6">
            {candidates.map((candidate, index) => (
              <label key={candidate._id || index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="candidate"
                  value={candidate._id} // Fixed: Use candidate._id instead of index
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  className="mr-4 h-4 w-4 text-blue-600"
                />
                <div>
                  <h4 className="text-lg font-medium text-gray-800">{candidate.name}</h4>
                  <p className="text-sm text-gray-600">{candidate.party}</p>
                </div>
              </label>
            ))}
          </div>
          
          <button
            onClick={handleVote}
            disabled={votingLoading || !selectedCandidate}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {votingLoading ? 'Recording Vote...' : 'Cast Vote'}
          </button>
          
          <p className="text-sm text-gray-500 mt-4 text-center">
            Note: You can only vote once. Please choose carefully.
          </p>
        </div>
      </div>
    );
  };

  // Change Password Component
  const ChangePasswordView = () => {
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handlePasswordChange = (e) => {
      setPasswordData({
        ...passwordData,
        [e.target.name]: e.target.value
      });
    };

    const handlePasswordSubmit = async () => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return;
      }

      if (passwordData.newPassword === passwordData.currentPassword) {
        alert('New password cannot be the same as the current password');
        return;
      }

      setPasswordLoading(true);
      try {
        const response = await fetch(`${API_URL}/user/profile/password`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Password updated successfully!');
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          alert(data.error || 'Failed to update password');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        alert('Network error. Please try again.');
      } finally {
        setPasswordLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Lock className="h-6 w-6 mr-2" />
          Change Password
        </h2>
        
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handlePasswordSubmit}
            disabled={passwordLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    );
  };

  // Sidebar Component with optimized navigation
  const Sidebar = () => {
    const menuItems = [
      { id: 'profile', label: 'My Profile', icon: User },
      { id: 'candidates', label: 'View Candidates', icon: Users },
      { id: 'vote', label: 'Cast Vote', icon: Vote },
      { id: 'changePassword', label: 'Change Password', icon: Lock }
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleViewChange(item.id)} // Use optimized view change
                className={`w-full flex items-center px-4 py-3 text-left rounded-md transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>
        
        <hr className="my-4" />
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-left rounded-md text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    );
  };

  // Main content renderer
  const renderMainContent = () => {
    switch (currentView) {
      case 'profile':
        return <ProfileView />;
      case 'candidates':
        return <CandidatesListView />;
      case 'vote':
        return <VoteView />;
      case 'changePassword':
        return <ChangePasswordView />;
      default:
        return <ProfileView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Vote className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-800">Voting System</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-gray-700">Welcome, {userProfile.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
                <button 
                  onClick={() => setError('')}
                  className="float-right font-bold"
                >
                  ×
                </button>
              </div>
            )}
            
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;