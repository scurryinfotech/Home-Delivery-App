import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Signup = ({ onSwitchToLogin, onSignup }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // OTP Countdown Timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Handle input fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Only allow digits
      const num = value.replace(/\D/g, "");
      if (num.length <= 10) {
        setFormData({ ...formData, phone: num });

        // Reset OTP if number changes
        if (otpSent && num !== formData.phone) {
          setOtpSent(false);
          setOtp("");
          setIsVerified(false);
          setSessionId("");
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // OTP input handler
  const handleOtpChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    if (v.length <= 6) setOtp(v);
  };

  // ---------------------------
  // SEND OTP
  // ---------------------------
  const sendOtp = async () => {
    if (formData.phone.length !== 10) {
      setErrors({ phone: "Enter a valid 10-digit phone number" });
      return;
    }

    setSendingOtp(true);

    try {
      const res = await fetch("https://yyadavrrohit-001-site4.rtempurl.com/api/Otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "+91" + formData.phone,
        }),
      });
      toast.success("OTP sent successfully!");
      const data = await res.json();

      if (res.ok && data.session_id) {
        setSessionId(data.session_id); // 
        setOtpSent(true);
        setOtpTimer(60);

      } else {
        setErrors({ phone: data.message || "Failed to send OTP" });
      }
    } catch (err) {
      setErrors({ phone: "Error sending OTP" });
    }

    setSendingOtp(false);
  };

  // ---------------------------
  // VERIFY OTP
  // ---------------------------
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Enter a valid 6-digit OTP" });
      return;
    }

    if (!sessionId) {
      setErrors({ otp: "Session expired. Resend OTP." });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("https://yyadavrrohit-001-site4.rtempurl.com/api/Otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          otp,
        }),
      });
      toast.success("Phone number verified!");
      const data = await res.json();

      if (res.ok && data.success) {
        setIsVerified(true);

      } else {
        setErrors({ otp: "Incorrect OTP" });
      }
    } catch (err) {
      setErrors({ otp: "Error verifying OTP" });
    }

    setIsLoading(false);
  };

  // Resend OTP
  const resendOtp = () => {
    setOtp("");
    sendOtp();
  };

  // ---------------------------
  // VALIDATE FORM
  // ---------------------------
  const validateForm = () => {
    const err = {};

    if (!formData.name.trim()) err.name = "Enter your name";
    if (formData.phone.length !== 10) err.phone = "Enter valid phone";
    if (!isVerified) err.phone = "Verify your phone number first";
    if (formData.password.length < 6) {
      err.password = "Password must be at least 6 characters";
    } else {
      const p = formData.password;
      const missing = [];

      if (!/[A-Z]/.test(p)) missing.push("uppercase letter");
      if (!/[a-z]/.test(p)) missing.push("lowercase letter");
      if (!/[0-9]/.test(p)) missing.push("number");
      if (!/[!@#$%^&*]/.test(p)) missing.push("special character (!@#$%^&*)");

      if (missing.length > 0) {
        if (missing.length === 1) {
          err.password = `Password must contain at least one ${missing[0]}`;
        } else {
          const lastItem = missing.pop();
          err.password = `Password must contain at least one ${missing.join(", ")} and ${lastItem}`;
        }
      }
    }
    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = "Passwords do not match";

    // if (!agreedToTerms) err.terms = "You must agree to Terms";

    return err;
  };

  // ---------------------------
  // SUBMIT FORM
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validateForm();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setIsLoading(true);

    try {
      const result = await onSignup({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
      });

      // If backend says phone exists
      if (result.success === false && result.message === "Phone already exists") {
        setErrors({ submit: "This phone number is already registered." });
        setIsLoading(false);
        return;
      }

    } catch (err) {
      setErrors({ submit: "The number is already in our system" });
    }

    setIsLoading(false);
  };

  // Format phone number
  const formatPhoneDisplay = (p) =>
    p.length <= 5 ? p : `${p.slice(0, 5)} ${p.slice(5)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-center text-teal-700 mb-2">
          Welcome to Grill N Shakes
        </h2>
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Create Account
        </h1>

        {/* PHONE NUMBER */}
        <div className="mb-6">
          <label className="block mb-2">Phone Number</label>
          <div className="flex gap-2">
            <input
              type="tel"
              name="phone"
              value={formatPhoneDisplay(formData.phone)}
              onChange={handleChange}
              disabled={isVerified}
              className="flex-1 px-4 py-3 border rounded-lg"
              placeholder="Enter your Phone Number"
            />

            {!isVerified && (
              <button
                type="button"
                onClick={sendOtp}
                disabled={sendingOtp}
                className="px-4 py-3 bg-teal-600 text-white rounded-lg"
              >
                {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
              </button>
            )}
          </div>
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* OTP FIELD */}
        {otpSent && !isVerified && (
          <div className="mb-6">
            <label className="block mb-2">Enter OTP</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                className="flex-1 px-4 py-3 border rounded-lg"
                placeholder="6-digit OTP"
              />

              <button
                type="button"
                onClick={verifyOtp}
                disabled={otp.length !== 6 || isLoading}
                className="px-4 py-3 bg-pink-600 text-white rounded-lg"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </div>

            {errors.otp && (
              <p className="text-red-600 text-sm mt-1">{errors.otp}</p>
            )}

            <div className="text-sm mt-2">
              {otpTimer > 0 ? (
                <p>Resend OTP in {otpTimer}s</p>
              ) : (
                <button className="text-teal-600" onClick={resendOtp}>
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* AFTER OTP VERIFIED */}
        {isVerified && (
          <>
            {/* Name */}
            <div className="mb-4">
              <label className="block mb-2">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}

            {/* Terms */}
            <div className="mb-4">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span className="ml-2">I agree to the Terms</span>
              {errors.terms && (
                <p className="text-red-600 text-sm">{errors.terms}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg mb-3">
                {errors.submit}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </>
        )}

        {/* Login Link */}
        <div className="text-center mt-8">
          <p>
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-pink-600 font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
