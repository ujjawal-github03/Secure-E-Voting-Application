import React, { useState } from 'react';
import { User, Vote, UserPlus, LogIn, Users, KeyRound } from 'lucide-react';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import OTPVerification from './OTPVerification';
import ForgotPassword from './ForgotPassword';
import { OTPService } from './firebase';
import { auth } from './firebase';

const API_URL = process.env.REACT_APP_API_URL;

const HomePage = () => {
  const [currentView, setCurrentView] = useState('home');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState(null);
  const [pendingLoginData, setPendingLoginData] = useState(null);

  // Fetch candidates list
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/candidate`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      } else {
        alert('Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      alert('Error fetching candidates');
    } finally {
      setLoading(false);
    }
  };

  // Handle candidate list view
  const handleViewCandidates = () => {
    setCurrentView('candidates');
    fetchCandidates();
  };

  // Signup form component with OTP
  const SignupForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      age: '',
      address: '',
      mobile: '',
      email: '',
      aadharCardNumber: '',
      password: '',
      role: 'voter'
    });

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSignupSubmit = async () => {
      // Validate form data
      if (!formData.name || !formData.age || !formData.address || !formData.mobile || 
          !formData.email || !formData.aadharCardNumber || !formData.password) {
        alert('Please fill in all required fields');
        return;
      }

      if (formData.aadharCardNumber.length !== 12) {
        alert('Aadhar card number must be 12 digits');
        return;
      }

      if (formData.mobile.length !== 10) {
        alert('Mobile number must be 10 digits');
        return;
      }

      if (parseInt(formData.age) < 18) {
        alert('Age must be 18 or above');
        return;
      }

      setLoading(true);
      try {
        // Send OTP to mobile number
        const otpResult = await OTPService.sendOTP(formData.mobile);
        
        if (otpResult.success) {
          setPendingSignupData(formData);
          setCurrentView('signupOTP');
        } else {
          alert(otpResult.message || 'Failed to send OTP');
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Failed to send OTP. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign Up</h2>
        
        {/* Add reCAPTCHA container here */}
        <div id="recaptcha-container"></div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="18"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, mobile: value });
              }}
              placeholder="10-digit mobile number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Card Number</label>
            <input
              type="text"
              name="aadharCardNumber"
              value={formData.aadharCardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                setFormData({ ...formData, aadharCardNumber: value });
              }}
              placeholder="12-digit Aadhar number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="voter">Voter</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleSignupSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
        
        <button
          onClick={() => setCurrentView('home')}
          className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
        >
          Back to Home
        </button>
      </div>
    );
  };

  // Signup OTP Verification
  const SignupOTPVerification = () => {
    const handleSignupOTPVerification = async (otp) => {
      try {
        const otpResult = await OTPService.verifyOTP(otp);
        
        if (otpResult.success) {
          // OTP verified, now create the user account
          const response = await fetch(`${API_URL}/user/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pendingSignupData)
          });

          const data = await response.json();
          
          if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Signup successful!');
            // Navigate to appropriate dashboard
            if (data.response.role === 'admin') {
              setCurrentView('adminDashboard');
            } else {
              setCurrentView('userDashboard');
            }
            setPendingSignupData(null);
            return { success: true };
          } else {
            alert(data.error || 'Signup failed');
            return { success: false, message: data.error || 'Signup failed' };
          }
        } else {
          return { success: false, message: otpResult.message };
        }
      } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Network error. Please try again.' };
      }
    };

    const handleSignupOTPResend = async () => {
      const result = await OTPService.sendOTP(pendingSignupData.mobile);
      if (!result.success) {
        throw new Error(result.message);
      }
    };

    return (
      <OTPVerification
        phoneNumber={pendingSignupData?.mobile}
        onVerificationSuccess={handleSignupOTPVerification}
        onCancel={() => {
          setCurrentView('signup');
          setPendingSignupData(null);
          OTPService.reset();
        }}
        onResendOTP={handleSignupOTPResend}
        title="Verify Your Mobile Number"
        subtitle="Complete your signup by verifying your mobile number"
      />
    );
  };

  // Login form component with OTP
  const LoginForm = () => {
    const [formData, setFormData] = useState({
      aadharCardNumber: '',
      password: ''
    });

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleLoginSubmit = async () => {
      if (!formData.aadharCardNumber || !formData.password) {
        alert('Please enter both Aadhar number and password');
        return;
      }

      if (formData.aadharCardNumber.length !== 12) {
        alert('Aadhar card number must be 12 digits');
        return;
      }

      setLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
          // Credentials verified, now get user mobile for OTP
          const profileResponse = await fetch(`${API_URL}/user/profile`, {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            
            // Send OTP to user's mobile
            const otpResult = await OTPService.sendOTP(profileData.user.mobile);
            
            if (otpResult.success) {
              setPendingLoginData({
                token: data.token,
                user: profileData.user
              });
              setCurrentView('loginOTP');
            } else {
              alert(otpResult.message || 'Failed to send OTP');
            }
          } else {
            alert('Failed to get user profile');
          }
        } else {
          alert(data.error || 'Invalid credentials');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Card Number</label>
            <input
              type="text"
              name="aadharCardNumber"
              value={formData.aadharCardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                setFormData({ ...formData, aadharCardNumber: value });
              }}
              placeholder="12-digit Aadhar number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleLoginSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>

          <button
            onClick={() => setCurrentView('forgotPassword')}
            className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center"
          >
            <KeyRound className="h-4 w-4 mr-1" />
            Forgot Password?
          </button>
        </div>
        
        <button
          onClick={() => setCurrentView('home')}
          className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
        >
          Back to Home
        </button>
      </div>
    );
  };

  // Login OTP Verification
  const LoginOTPVerification = () => {
    const handleLoginOTPVerification = async (otp) => {
      try {
        const otpResult = await OTPService.verifyOTP(otp);
        
        if (otpResult.success) {
          // OTP verified, complete login
          localStorage.setItem('token', pendingLoginData.token);
          alert('Login successful!');
          
          if (pendingLoginData.user.role === 'admin') {
            setCurrentView('adminDashboard');
          } else {
            setCurrentView('userDashboard');
          }
          
          setPendingLoginData(null);
          return { success: true };
        } else {
          return { success: false, message: otpResult.message };
        }
      } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'OTP verification failed' };
      }
    };

    const handleLoginOTPResend = async () => {
      const result = await OTPService.sendOTP(pendingLoginData.user.mobile);
      if (!result.success) {
        throw new Error(result.message);
      }
    };

    return (
      <OTPVerification
        phoneNumber={pendingLoginData?.user.mobile}
        onVerificationSuccess={handleLoginOTPVerification}
        onCancel={() => {
          setCurrentView('login');
          setPendingLoginData(null);
          OTPService.reset();
        }}
        onResendOTP={handleLoginOTPResend}
        title="Complete Login"
        subtitle="Enter the OTP sent to your registered mobile number"
      />
    );
  };

  // Forgot Password Handler
  const ForgotPasswordView = () => {
    return (
      <ForgotPassword
        onCancel={() => setCurrentView('login')}
        onSuccess={(message) => {
          alert(message);
          setCurrentView('login');
        }}
      />
    );
  };

  // Candidates list component (unchanged)
  const CandidatesList = () => {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Candidates List</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading candidates...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
                <p className="text-gray-600">{candidate.party}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && candidates.length === 0 && (
          <p className="text-center text-gray-600 py-8">No candidates found.</p>
        )}
        
        <button
          onClick={() => setCurrentView('home')}
          className="w-full mt-6 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
        >
          Back to Home
        </button>
      </div>
    );
  };

  // Main home view (unchanged)
  const HomeView = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Vote className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-800">Voting System</span>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('signup')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </button>
                
                <button
                  onClick={() => setCurrentView('login')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </button>
                
                <button
                  onClick={handleViewCandidates}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Candidates
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Digital Voting System
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Secure, transparent, and efficient online voting platform with OTP verification
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <UserPlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Account</h3>
                <p className="text-gray-600">Register with OTP verification to participate in the voting process</p>
                <button
                  onClick={() => setCurrentView('signup')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <LogIn className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Login</h3>
                <p className="text-gray-600">Access your account with dual authentication - password + OTP</p>
                <button
                  onClick={() => setCurrentView('login')}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Login Now
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">View Candidates</h3>
                <p className="text-gray-600">Browse the list of candidates participating in the election</p>
                <button
                  onClick={handleViewCandidates}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  View List
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025 Digital Voting System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  };

  // Main render logic
  const renderCurrentView = () => {
    switch (currentView) {
      case 'signup':
        return <SignupForm />;
      case 'signupOTP':
        return <SignupOTPVerification />;
      case 'login':
        return <LoginForm />;
      case 'loginOTP':
        return <LoginOTPVerification />;
      case 'forgotPassword':
        return <ForgotPasswordView />;
      case 'candidates':
        return <CandidatesList />;
      case 'userDashboard':
        return <UserDashboard />;
      case 'adminDashboard':
        return <AdminDashboard />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {renderCurrentView()}
    </div>
  );
};

export default HomePage;