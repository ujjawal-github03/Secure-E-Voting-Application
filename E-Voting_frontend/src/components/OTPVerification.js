import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const OTPVerification = ({ 
  phoneNumber, 
  onVerificationSuccess, 
  onCancel, 
  onResendOTP,
  isLoading = false,
  title = "Enter Verification Code",
  subtitle = "We've sent a 6-digit code to your mobile number"
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const inputRefs = useRef([]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user starts typing
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && value !== '') {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pasteData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    
    // Focus the next empty field or last field
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
    
    // Auto-submit if complete
    if (pasteData.length === 6) {
      handleVerifyOtp(pasteData);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (otpCode) => {
    const otpString = otpCode || otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }
    
    setVerifying(true);
    setError('');
    
    try {
      const result = await onVerificationSuccess(otpString);
      if (result?.success) {
        setSuccess(true);
        // Success will be handled by parent component
      } else {
        setError(result?.message || 'Invalid OTP. Please try again.');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setTimeLeft(60);
    setError('');
    setOtp(['', '', '', '', '', '']);
    
    try {
      await onResendOTP();
      inputRefs.current[0]?.focus();
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
      setCanResend(true);
      setTimeLeft(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Successful!</h2>
        <p className="text-gray-600">Your phone number has been verified successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-2">{subtitle}</p>
        <p className="text-sm text-gray-500">
          Sent to: +91 {phoneNumber?.replace(/(\d{5})(\d{5})/, '$1 $2')}
        </p>
      </div>

      {/* OTP Input */}
      <div className="mb-6">
        <div className="flex justify-center space-x-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/, ''))}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-lg focus:outline-none transition-colors ${
                error 
                  ? 'border-red-500 focus:border-red-600' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              disabled={verifying || isLoading}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center text-red-600 text-sm mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {/* Timer and Resend */}
        <div className="text-center">
          {!canResend ? (
            <p className="text-sm text-gray-600">
              Resend OTP in {formatTime(timeLeft)}
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center mx-auto disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Resend OTP
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleVerifyOtp()}
          disabled={verifying || isLoading || otp.join('').length !== 6}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {verifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>
        
        <button
          onClick={onCancel}
          disabled={verifying || isLoading}
          className="w-full bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default OTPVerification;