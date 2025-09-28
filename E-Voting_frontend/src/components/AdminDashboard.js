import React, { useState, useEffect } from 'react';
import { User, Users, Vote, Lock, LogOut, Plus, Edit, Trash2, BarChart3, Trophy, Eye } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voteResults, setVoteResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Cache tracking
  const [candidatesLoaded, setCandidatesLoaded] = useState(false);
  const [voteResultsLoaded, setVoteResultsLoaded] = useState(false);

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (userProfile) return; // Don't fetch if already loaded
    
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
  const fetchCandidates = async (forceRefresh = false) => {
    if (candidatesLoaded && candidates.length > 0 && !forceRefresh) {
      return; // Don't fetch if already loaded unless forced
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

  // Fetch vote results (cached version)
  const fetchVoteResults = async (forceRefresh = false) => {
    if (voteResultsLoaded && voteResults.length > 0 && !forceRefresh) {
      return; // Don't fetch if already loaded unless forced
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/candidate/vote/count`);
      if (response.ok) {
        const data = await response.json();
        setVoteResults(data);
        setVoteResultsLoaded(true);
      } else {
        setError('Failed to fetch vote results');
      }
    } catch (error) {
      console.error('Error fetching vote results:', error);
      setError('Error fetching vote results');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchCandidates(); // Load candidates once on mount
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Optimized view change handler
  const handleViewChange = (view) => {
    setCurrentView(view);
    
    // Only fetch data if we're going to a view that needs it and it's not already loaded
    if (view === 'candidates' && !candidatesLoaded) {
      fetchCandidates();
    } else if (view === 'voteResults' && !voteResultsLoaded) {
      fetchVoteResults();
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
          Admin Profile
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {userProfile.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // View Candidates Component (optimized)
  const ViewCandidatesView = () => {
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Manage Candidates
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchCandidates(true)} // Force refresh
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setCurrentView('addCandidate')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </button>
          </div>
        </div>
        
        {candidates.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No candidates available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate, index) => (
                  <tr key={candidate._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {candidate.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.party}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setCurrentView('editCandidate');
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded hover:bg-blue-50"
                        title="Edit Candidate"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(candidate._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete Candidate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Delete candidate function
  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/candidate/${candidateId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (response.ok) {
          alert('Candidate deleted successfully!');
          fetchCandidates(true); // Force refresh after delete
        } else {
          const data = await response.json();
          alert(data.error || data.message || 'Failed to delete candidate');
        }
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Add Candidate Component
  const AddCandidateView = () => {
    const [candidateData, setCandidateData] = useState({
      name: '',
      party: '',
      age: ''
    });

    const handleCandidateChange = (e) => {
      setCandidateData({
        ...candidateData,
        [e.target.name]: e.target.value
      });
    };

    const handleAddCandidate = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/candidate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(candidateData)
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Candidate added successfully!');
          setCandidateData({ name: '', party: '', age: '' });
          setCurrentView('candidates');
          fetchCandidates(true); // Force refresh after adding
        } else {
          alert(data.error || 'Failed to add candidate');
        }
      } catch (error) {
        console.error('Error adding candidate:', error);
        alert('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Plus className="h-6 w-6 mr-2" />
          Add New Candidate
        </h2>
        
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
            <input
              type="text"
              name="name"
              value={candidateData.name}
              onChange={handleCandidateChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
            <input
              type="text"
              name="party"
              value={candidateData.party}
              onChange={handleCandidateChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={candidateData.age}
              onChange={handleCandidateChange}
              required
              min="25"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handleAddCandidate}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Candidate'}
          </button>
          
          <button
            onClick={() => setCurrentView('candidates')}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Edit Candidate Component
  const EditCandidateView = () => {
    const [editData, setEditData] = useState({
      name: selectedCandidate?.name || '',
      party: selectedCandidate?.party || '',
      age: selectedCandidate?.age || ''
    });

    const handleEditChange = (e) => {
      setEditData({
        ...editData,
        [e.target.name]: e.target.value
      });
    };

    const handleUpdateCandidate = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/candidate/${selectedCandidate._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editData)
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Candidate updated successfully!');
          setCurrentView('candidates');
          fetchCandidates(true); // Force refresh after update
        } else {
          alert(data.error || 'Failed to update candidate');
        }
      } catch (error) {
        console.error('Error updating candidate:', error);
        alert('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Edit className="h-6 w-6 mr-2" />
          Edit Candidate
        </h2>
        
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleEditChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
            <input
              type="text"
              name="party"
              value={editData.party}
              onChange={handleEditChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={editData.age}
              onChange={handleEditChange}
              required
              min="25"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handleUpdateCandidate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Candidate'}
          </button>
          
          <button
            onClick={() => setCurrentView('candidates')}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Vote Results Component (optimized)
  const VoteResultsView = () => {
    // Only show loading if vote results aren't loaded yet
    if (loading && !voteResultsLoaded) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const winner = voteResults.length > 0 ? voteResults[0] : null;
    const totalVotes = voteResults.reduce((sum, result) => sum + result.count, 0);

    return (
      <div className="space-y-6">
        {/* Winner Card */}
        {winner && winner.count > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 mr-4" />
              <div>
                <h2 className="text-2xl font-bold">Current Winner!</h2>
                <p className="text-lg">{`${winner.name} (${winner.party})`}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{winner.count} votes</p>
              <p className="text-sm opacity-90">
                {totalVotes > 0 ? `${((winner.count / totalVotes) * 100).toFixed(1)}%` : '0%'} of total votes
              </p>
            </div>
          </div>
        )}

        {/* Vote Results Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              Vote Results
            </h2>
            <button
              onClick={() => fetchVoteResults(true)} // Force refresh
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Refresh Results
            </button>
          </div>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Votes Cast: {totalVotes}</h3>
          </div>

          {voteResults.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No votes recorded yet</p>
          ) : (
            <div className="space-y-4">
              {voteResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">{`${result.name} (${result.party})`}</h4>
                      <p className="text-sm text-gray-600">
                        {index === 0 ? '🥇 Leading' : `#${index + 1}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{result.count}</p>
                      <p className="text-sm text-gray-600">
                        {totalVotes > 0 ? `${((result.count / totalVotes) * 100).toFixed(1)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: totalVotes > 0 ? `${(result.count / totalVotes) * 100}%` : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
      { id: 'candidates', label: 'Manage Candidates', icon: Users },
      { id: 'addCandidate', label: 'Add Candidate', icon: Plus },
      { id: 'voteResults', label: 'Vote Results', icon: BarChart3 },
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
                    ? 'bg-red-600 text-white'
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
        return <ViewCandidatesView />;
      case 'addCandidate':
        return <AddCandidateView />;
      case 'editCandidate':
        return <EditCandidateView />;
      case 'voteResults':
        return <VoteResultsView />;
      case 'changePassword':
        return <ChangePasswordView />;
      default:
        return <ProfileView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Vote className="h-8 w-8 text-red-600 mr-2" />
              <span className="text-xl font-bold text-gray-800">Admin Panel</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-gray-700">Welcome, {userProfile.name}</span>
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">ADMIN</span>
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

export default AdminDashboard;