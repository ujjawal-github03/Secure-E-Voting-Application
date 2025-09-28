import React, { useState } from 'react';
import { User, Vote, UserPlus, LogIn, Users, KeyRound, Home, Github, Linkedin, Phone, Mail, MapPin, Facebook, Twitter, Instagram, ArrowLeft } from 'lucide-react';
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

  // Back to Home Button Component
  const BackToHome = ({ className = "" }) => (
    <button
      onClick={() => setCurrentView('home')}
      className={`flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium ${className}`}
    >
      <Home className="h-5 w-5 mr-2" />
      Back to Home
    </button>
  );

  // Header Component
  const Header = ({ title = "E-Voting System" }) => (
    <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
              <Vote className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
/*
  // Footer Component
  const Footer = () => (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © 2025 E-Voting System - Secure Digital Democracy
          </p>
        </div>
      </div>
    </footer>
  );
  */



const Footer = () => (
  <footer className="bg-white backdrop-blur-sm mt-auto shadow-md ">
    <div className="max-w-7xl mx-auto px-6 lg:px-4 py-2">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Branding */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            E-Voting System
          </h2>
          <p className="text-black/80 text-sm">
            © 2025 Secure Digital Democracy
          </p>
        </div>
      </div>
    </div>
  </footer>
);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-200 to-blue-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-600">
            <div className="text-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-white-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600 text-sm">Join our secure voting platform</p>
            </div>
            
            {/* Add reCAPTCHA container here */}
            <div id="recaptcha-container"></div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="18+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, mobile: value });
                    }}
                    placeholder="10 digits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your residential address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a strong password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="voter">Voter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                onClick={handleSignupSubmit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
            
            <div className="mt-6">
              <BackToHome className="justify-center w-full" />
            </div>
          </div>
        </div>
        <Footer />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-200 to-blue-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <BackToHome className="w-full text-black hover:text-blue-900"/>
            </div>
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
          </div>
        </div>
        <Footer />
      </div>
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

    const handleSignupSubmit = async () => {
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
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-200 to-green-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-600">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <LogIn className="h-8 w-8 text-white-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600 text-sm">Sign in to your voting account</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card Number</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="aadharCardNumber"
                    value={formData.aadharCardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setFormData({ ...formData, aadharCardNumber: value });
                    }}
                    placeholder="12-digit Aadhar number"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength="12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSignupSubmit}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Login'
                )}
              </button>

              <button
                onClick={() => setCurrentView('forgotPassword')}
                className="w-full text-green-600 hover:text-green-700 text-sm font-medium flex items-center justify-center py-2 hover:bg-green-50 rounded-lg transition-colors"
              >
                <KeyRound className="h-4 w-4 mr-1" />
                Forgot Password?
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <BackToHome className="justify-center w-full text-green-600 hover:text-green-700" />
            </div>
          </div>
        </div>
        <Footer />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-200 to-blue-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <BackToHome className='text-black hover:text-blue-900'/>
            </div>
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
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  // Forgot Password Handler
  const ForgotPasswordView = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-200 to-blue-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <BackToHome className='text-black hover:text-blue-900'/>
            </div>
            <ForgotPassword
              onCancel={() => setCurrentView('login')}
              onSuccess={(message) => {
                alert(message);
                setCurrentView('login');
              }}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  // Candidates list component
  const CandidatesList = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-300 flex flex-col">
        <div className="flex-1 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <BackToHome className='text-black hover:text-purple-900' />
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-600 p-8">
              <div className="text-center mb-8">
                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Election Candidates</h2>
                <p className="text-gray-600">Meet the candidates participating in this election</p>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading candidates...</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {candidates.map((candidate, index) => (
                    <div key={index} className="bg-purple-100 border border-gray-400 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="text-center">
                        <div className="bg-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <User className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{candidate.name}</h3>
                        <div className="flex items-center justify-center mb-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                          <p className="text-gray-600 font-medium">{candidate.party}</p>
                        </div>
                        {candidate.age && (
                          <p className="text-sm text-gray-500">Age: {candidate.age} years</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && candidates.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500 mb-2">No candidates found</p>
                  <p className="text-gray-400">Candidates will appear here once they are registered for the election.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  // Main home view
  const HomeView = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-white backdrop-blur-sm mt-auto shadow-md rounded-t-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Vote className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-800">E-Voting System</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentView('signup')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </button>
                
                <button
                  onClick={() => setCurrentView('login')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </button>
                
                <button
                  onClick={handleViewCandidates}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Candidates
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 flex flex-col">
          <div className="text-center mb-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-24 h-24 mx-auto mb-8 mt-6 flex items-center justify-center shadow-xl">
              <Vote className="h-12 w-12 text-white" />
            </div>
            <div className="relative mb-8">
              <h1 className="text-6xl md:text-7xl font-bold text-center relative">
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                  E-Voting System
                </span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Secure, transparent, and efficient online voting platform with advanced OTP verification and Aadhar-based authentication
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => setCurrentView('signup')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Get Started
              </button>
              
              <button
                onClick={() => setCurrentView('login')}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Login Now
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16">
             <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-600 hover:border-blue-900 group hover:-translate-y-2">
                <div className="bg-blue-200 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-blue-300 transition-colors">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Create Account</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Register with OTP verification to participate in the democratic voting process</p>
                <button
                  onClick={() => setCurrentView('signup')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Register Now
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-600 hover:border-green-900 group hover:-translate-y-2">
                <div className="bg-green-200 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-green-300 transition-colors">
                  <LogIn className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Secure Login</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Access your account with dual authentication - password plus OTP verification</p>
                <button
                  onClick={() => setCurrentView('login')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-600 hover:border-purple-900 group hover:-translate-y-2">
                <div className="bg-purple-200 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-purple-300 transition-colors">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">View Candidates</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Browse the complete list of candidates participating in the election</p>
                <button
                  onClick={handleViewCandidates}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Browse List
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
              <p className="text-xl text-gray-600 mb-12">Built with security, accessibility, and transparency at its core</p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-600 hover:border-blue-900 group hover:-translate-y-2">
                  <div className="bg-blue-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-300">
                    <Vote className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
                  <p className="text-gray-600">
                    Advanced encryption and Aadhar-based authentication ensure your vote remains secure and anonymous.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-600 hover:border-green-900 group hover:-translate-y-2">
                  <div className="bg-green-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-green-300">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy to Use</h3>
                  <p className="text-gray-600">
                    Intuitive interface designed for all age groups. Vote with just a few clicks from anywhere.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-600 hover:border-purple-900 group hover:-translate-y-2">
                  <div className="bg-purple-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-purple-300">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparent Results</h3>
                  <p className="text-gray-600">
                    Real-time vote counting and transparent result display for complete electoral transparency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
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

  return renderCurrentView();
};

export default HomePage;