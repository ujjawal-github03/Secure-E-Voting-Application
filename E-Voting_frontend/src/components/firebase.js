// firebase.js - Improved version with better error handling and rate limiting
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  connectAuthEmulator,
} from "firebase/auth";

// Your Firebase configuration
// firebase.js
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// For development/testing
//if (location.hostname === 'localhost') {
  // Uncomment this line if using Firebase emulator
  // connectAuthEmulator(auth, 'http://localhost:9099');
//}

export class OTPService {
  static recaptchaVerifier = null;
  static confirmationResult = null;
  static lastRequestTime = 0;
  static requestCooldown = 60000; // 1 minute cooldown between requests

  // Check if we can make a new request (rate limiting)
  static canMakeRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    return timeSinceLastRequest >= this.requestCooldown;
  }

  // Get remaining cooldown time
  static getRemainingCooldown() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const remaining = Math.max(0, this.requestCooldown - timeSinceLastRequest);
    return Math.ceil(remaining / 1000); // Return seconds
  }

  // Wait for auth to be ready
  static async waitForAuth() {
    return new Promise((resolve) => {
      if (auth.currentUser !== undefined) {
        resolve();
        return;
      }

      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });

      // Fallback timeout
      setTimeout(resolve, 3000);
    });
  }

  // Initialize reCAPTCHA with better error handling
  static async initializeRecaptcha(containerId = "recaptcha-container") {
    try {
      console.log("Initializing reCAPTCHA...");

      // Wait for auth to be ready
      await this.waitForAuth();

      // Clean up existing verifier
      await this.cleanup(false);

      // Ensure container exists and is properly set up
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        // Make container invisible but accessible
        container.style.cssText = `
          position: fixed !important;
          top: -9999px !important;
          left: -9999px !important;
          width: 1px !important;
          height: 1px !important;
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: -1 !important;
        `;
        document.body.appendChild(container);
      }

      // Clear container content
      container.innerHTML = "";

      // Create verifier with improved configuration
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved:", !!response);
        },
        "expired-callback": () => {
          console.warn("reCAPTCHA expired");
          this.cleanup(false);
        },
        "error-callback": (error) => {
          console.error("reCAPTCHA error:", error);
          this.cleanup(false);
        },
      });

      // Render the widget with timeout
      const renderPromise = this.recaptchaVerifier.render();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("reCAPTCHA render timeout")), 10000);
      });

      await Promise.race([renderPromise, timeoutPromise]);
      console.log("reCAPTCHA initialized successfully");

      return this.recaptchaVerifier;
    } catch (error) {
      console.error("reCAPTCHA initialization failed:", error);
      await this.cleanup(false);
      throw new Error(`reCAPTCHA setup failed: ${error.message}`);
    }
  }

  // Send OTP with improved error handling
  static async sendOTP(phoneNumber) {
    try {
      console.log("Starting OTP send process...");

      // Validate phone number
      if (!phoneNumber || !/^\d{10}$/.test(phoneNumber.toString())) {
        return {
          success: false,
          message: "Please enter a valid 10-digit mobile number",
          error: "INVALID_PHONE",
        };
      }

      // Check rate limiting
      if (!this.canMakeRequest()) {
        const remainingSeconds = this.getRemainingCooldown();
        return {
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another OTP`,
          error: "RATE_LIMITED",
          remainingSeconds,
        };
      }

      const formattedNumber = `+91${phoneNumber}`;
      console.log("Sending OTP to:", formattedNumber);

      // Initialize reCAPTCHA
      const recaptcha = await this.initializeRecaptcha();
      if (!recaptcha) {
        return {
          success: false,
          message: "Security verification setup failed. Please refresh and try again.",
          error: "RECAPTCHA_FAILED",
        };
      }

      // Update request timestamp
      this.lastRequestTime = Date.now();

      // Send OTP
      console.log("Sending OTP via Firebase...");
      this.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedNumber,
        recaptcha
      );

      console.log("OTP sent successfully");
      return {
        success: true,
        message: "OTP sent successfully to your mobile number",
        verificationId: this.confirmationResult.verificationId,
        nextRequestIn: Math.ceil(this.requestCooldown / 1000),
      };

    } catch (error) {
      console.error("OTP send error:", error);
      await this.cleanup(false);

      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = "Failed to send OTP. Please try again.";
      let errorCode = error.code || "UNKNOWN_ERROR";

      switch (error.code) {
        case "auth/invalid-phone-number":
          errorMessage = "Invalid phone number format. Please check and try again.";
          break;
        case "auth/missing-phone-number":
          errorMessage = "Phone number is required";
          break;
        case "auth/quota-exceeded":
          errorMessage = "Daily SMS limit reached. Please try again tomorrow.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Please wait a few hours before trying again.";
          // Reset cooldown to a longer period for this error
          this.lastRequestTime = Date.now();
          this.requestCooldown = 3600000; // 1 hour
          break;
        case "auth/user-disabled":
          errorMessage = "This phone number has been temporarily disabled";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Phone verification is currently not available";
          break;
        case "auth/captcha-check-failed":
          errorMessage = "Security verification failed. Please refresh the page and try again.";
          break;
        case "auth/web-storage-unsupported":
          errorMessage = "Please enable cookies and try again";
          break;
        default:
          // Check for network errors
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            errorMessage = "Network error. Please check your connection and try again.";
            errorCode = "NETWORK_ERROR";
          } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
          }
      }

      return {
        success: false,
        message: errorMessage,
        error: errorCode,
        canRetryIn: error.code === "auth/too-many-requests" ? 3600 : 60, // seconds
      };
    }
  }

  // Verify OTP with better validation
  static async verifyOTP(otp) {
    try {
      console.log("Verifying OTP...");

      if (!this.confirmationResult) {
        return {
          success: false,
          message: "No OTP verification in progress. Please request a new OTP.",
          error: "NO_CONFIRMATION",
        };
      }

      // Validate OTP format
      const cleanOtp = otp.toString().trim();
      if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
        return {
          success: false,
          message: "Please enter a valid 6-digit OTP",
          error: "INVALID_OTP_FORMAT",
        };
      }

      const result = await this.confirmationResult.confirm(cleanOtp);
      console.log("OTP verified successfully");

      // Clean up after successful verification
      await this.cleanup(true);

      return {
        success: true,
        message: "Phone number verified successfully!",
        user: result.user,
        phoneNumber: result.user.phoneNumber,
      };

    } catch (error) {
      console.error("OTP verification error:", error);

      let errorMessage = "OTP verification failed. Please try again.";
      let canRetry = true;

      switch (error.code) {
        case "auth/invalid-verification-code":
          errorMessage = "Invalid OTP. Please check the code and try again.";
          break;
        case "auth/code-expired":
          errorMessage = "OTP has expired. Please request a new one.";
          canRetry = false;
          await this.cleanup(true);
          break;
        case "auth/session-expired":
          errorMessage = "Verification session expired. Please request a new OTP.";
          canRetry = false;
          await this.cleanup(true);
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please request a new OTP.";
          canRetry = false;
          await this.cleanup(true);
          break;
      }

      return {
        success: false,
        message: errorMessage,
        error: error.code || "VERIFICATION_FAILED",
        canRetry,
      };
    }
  }

  // Improved cleanup method
  static async cleanup(resetCooldown = true) {
    try {
      console.log("Cleaning up OTP service...");

      // Clear confirmation result
      this.confirmationResult = null;

      // Clear recaptcha verifier
      if (this.recaptchaVerifier) {
        try {
          await this.recaptchaVerifier.clear();
        } catch (e) {
          console.warn("Error clearing recaptcha verifier:", e);
        }
        this.recaptchaVerifier = null;
      }

      // Clean up DOM container
      const container = document.getElementById("recaptcha-container");
      if (container) {
        container.innerHTML = "";
        // Remove the container if it was created dynamically
        if (container.style.position === "fixed") {
          container.remove();
        }
      }

      // Reset cooldown if requested
      if (resetCooldown) {
        this.lastRequestTime = 0;
        this.requestCooldown = 60000; // Reset to 1 minute
      }

      console.log("OTP service cleaned up successfully");
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }

  // Reset everything
  static async reset() {
    await this.cleanup(true);
  }

  // Get service status
  static getStatus() {
    return {
      hasActiveVerification: !!this.confirmationResult,
      hasRecaptcha: !!this.recaptchaVerifier,
      canMakeRequest: this.canMakeRequest(),
      remainingCooldown: this.getRemainingCooldown(),
    };
  }

  // Check Firebase configuration
  static checkConfiguration() {
    try {
      if (!auth) {
        throw new Error("Firebase Auth not initialized");
      }

      if (!auth.app) {
        throw new Error("Firebase App not found");
      }

      console.log("Firebase configuration validated");
      return { success: true, message: "Configuration valid" };
    } catch (error) {
      console.error("Firebase configuration error:", error);
      return { success: false, message: error.message };
    }
  }
}

export { auth };
export default { OTPService, auth };