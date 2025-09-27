import React, { useState } from 'react';
import { KeyRound, User, Lock, ArrowLeft } from 'lucide-react';
import OTPVerification from './OTPVerification';
import { OTPService } from './firebase';

const API_URL = process.env.REACT_APP_API_URL;

const ForgotPassword = ({ onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState('aadhar'); // 'aadhar', 'otp', 'newPassword'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [newPasswordData, setNewPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Step 1: Verify Aadhar Number and get mobile number
  const handleAadharVerification = async (e) => {
    e.preventDefault();
    
    if (!aadharNumber || aadharNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhar number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/user/forgot-password/verify-aadhar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aadharCardNumber: aadharNumber })
      });

      const data = await response.json();
      
      if (response.ok) {
        setUserMobile(data.mobile);
        
        // Send OTP to mobile
        const otpResult = await OTPService.sendOTP(data.mobile);
        
        if (otpResult.success) {
          setCurrentStep('otp');
        } else {
          setError(otpResult.message);
        }
      } else {
        setError(data.error || 'Aadhar number not found');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP Verification
  const handleOTPVerification = async (otp) => {
    try {
      const result = await OTPService.verifyOTP(otp);
      
      if (result.success) {
        setCurrentStep('newPassword');
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'OTP verification failed' };
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    const result = await OTPService.sendOTP(userMobile);
    if (!result.success) {
      throw new Error(result.message);
    }
  };

  // Step 3: Reset Password
  const handlePasswordReset = async () => {
    if (newPasswordData.newPassword !== newPasswordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPasswordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/user/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadharCardNumber: aadharNumber,
          newPassword: newPasswordData.newPassword
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onSuccess('Password reset successfully! You can now login with your new password.');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setNewPasswordData({
      ...newPasswordData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  // Handle Enter key press
  const handleEnterKey = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  // Step 1: Aadhar Number Input
  if (currentStep === 'aadhar') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <KeyRound className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h2>
          <p className="text-gray-600">Enter your Aadhar number to reset your password</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar Card Number
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={aadharNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setAadharNumber(value);
                  setError('');
                }}
                onKeyPress={(e) => handleEnterKey(e, handleAadharVerification)}
                placeholder="Enter 12-digit Aadhar number"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="12"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              We'll send an OTP to your registered mobile number
            </p>
          </div>

          <button
            onClick={handleAadharVerification}
            disabled={loading || aadharNumber.length !== 12}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Send OTP'
            )}
          </button>

          <button
            onClick={onCancel}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (currentStep === 'otp') {
    return (
      <OTPVerification
        phoneNumber={userMobile}
        onVerificationSuccess={handleOTPVerification}
        onCancel={() => setCurrentStep('aadhar')}
        onResendOTP={handleResendOTP}
        title="Verify Your Identity"
        subtitle="Enter the OTP sent to your registered mobile number"
      />
    );
  }

  // Step 3: New Password
  if (currentStep === 'newPassword') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <Lock className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h2>
          <p className="text-gray-600">Create a strong password for your account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={newPasswordData.newPassword}
              onChange={handlePasswordChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newPasswordData.newPassword && newPasswordData.confirmPassword) {
                  handlePasswordReset();
                }
              }}
              placeholder="Enter new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={newPasswordData.confirmPassword}
              onChange={handlePasswordChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newPasswordData.newPassword && newPasswordData.confirmPassword) {
                  handlePasswordReset();
                }
              }}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              Password requirements:
            </p>
            <ul className="text-xs text-blue-600 mt-1 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Use a combination of letters and numbers</li>
            </ul>
          </div>

          <button
            onClick={handlePasswordReset}
            disabled={loading || !newPasswordData.newPassword || !newPasswordData.confirmPassword}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Password...
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ForgotPassword;