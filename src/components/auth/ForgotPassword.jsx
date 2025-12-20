import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const i = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(i);
    }
    if (timer === 0 && step === 2) setCanResend(true);
  }, [timer, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" || name === "otp") {
      const onlyNum = value.replace(/\D/g, "");
      if (name === "phone" && onlyNum.length <= 10)
        setFormData({ ...formData, phone: onlyNum });
      if (name === "otp" && onlyNum.length <= 6)
        setFormData({ ...formData, otp: onlyNum });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // Password rules
  const validatePassword = (p) => {
    const list = [];
    if (p.length < 6) list.push("min 6 chars");
    if (!/[A-Z]/.test(p)) list.push("uppercase");
    if (!/[a-z]/.test(p)) list.push("lowercase");
    if (!/[0-9]/.test(p)) list.push("number");
    if (!/[!@#$%^&*]/.test(p)) list.push("special");
    return list;
  };

  const checkPhoneExists = async (phone) => {
    try {
      const res = await fetch(
        `https://grillnshakesapi.scurryinfotechllp.com/api/Order/CheckPhoneExists?phone=${phone}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();
      return { exists: data.exists, success: res.ok };
    } catch (err) {
      return { exists: false, success: false, error: "Network error" };
    }
  };

  const handleSendOTP = async () => {
    if (formData.phone.length !== 10) {
      setErrors({ phone: "Enter valid 10-digit phone" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Step 1: Check if phone exists in system
      const checkResult = await checkPhoneExists(formData.phone);

      if (!checkResult.success) {
        setErrors({
          phone: checkResult.error || "Failed to verify phone number",
        });
        setIsLoading(false);
        return;
      }

      if (!checkResult.exists) {
        setErrors({ phone: "Phone number not registered!" });
        setIsLoading(false);
        return;
      }

      const res = await fetch(
        "https://localhost:7104/api/Otp/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: formData.phone,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.session_id) {
        toast.success("OTP sent to your phone!");
        localStorage.setItem("fp_session_id", data.session_id);

        setStep(2);
        setTimer(60);
        setCanResend(false);
      } else {
        setErrors({ submit: data.message || "Failed to send OTP" });
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setErrors({ submit: "Network error" });
      toast.error("Network error. Please try again.");
    }

    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setTimer(60);
    await handleSendOTP();
  };

  const handleVerifyOTP = async () => {
    if (formData.otp.length !== 6) {
      setErrors({ otp: "Enter valid OTP" });
      return;
    }

    const sessionId = localStorage.getItem("fp_session_id");

    if (!sessionId) {
      setErrors({ otp: "Session expired. Resend OTP." });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        "https://grillnshakesapi.scurryinfotechllp.com/api/Otp/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId,
            otp: formData.otp,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("OTP verified!");
        setStep(3);
        setErrors({});
      } else {
        setErrors({ otp: "Incorrect OTP" });
        toast.error("Incorrect OTP");
      }
    } catch (err) {
      setErrors({ otp: "Network error" });
      toast.error("Network error");
    }

    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    const err = {};

    const pwErrors = validatePassword(formData.newPassword);
    if (pwErrors.length > 0)
      err.newPassword = "Must include: " + pwErrors.join(", ");

    if (formData.confirmPassword !== formData.newPassword)
      err.confirmPassword = "Passwords do not match";

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        "https://grillnshakesapi.scurryinfotechllp.com/api/Order/ResetPassword",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formData.phone,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("fp_session_id");
        alert("Password reset successful!");
        onBackToLogin();
      } else {
        setErrors({ submit: data.message || "Reset failed" });
        toast.error(data.message || "Reset failed");
      }
    } catch (err) {
      setErrors({ submit: "Network error" });
      toast.error("Network error");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-6 bg-teal-400">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">
          {step === 1 && "Forgot Password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Create New Password"}
        </h1>

        {/* -------- Step 1: PHONE -------- */}
        {step === 1 && (
          <>
            <input
              type="tel"
              name="phone"
              className="w-full p-3 border rounded-lg"
              placeholder="Enter your phone"
              onChange={handleChange}
              value={formData.phone}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}

            <button
              onClick={handleSendOTP}
              className="w-full mt-5 p-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Send OTP"}
            </button>
          </>
        )}

        {/* -------- Step 2: OTP -------- */}
        {step === 2 && (
          <>
            <p className="text-sm text-gray-600 mb-3 text-center">
              OTP sent to +91 {formData.phone}
            </p>
            <input
              type="text"
              name="otp"
              className="w-full p-3 border rounded-lg text-center text-xl tracking-widest"
              placeholder="Enter OTP"
              onChange={handleChange}
              value={formData.otp}
              disabled={isLoading}
            />
            {errors.otp && (
              <p className="text-red-600 text-sm mt-1 text-center">
                {errors.otp}
              </p>
            )}

            <div className="text-center mt-2">
              {timer > 0 ? (
                <p className="text-gray-600">Resend OTP in {timer}s</p>
              ) : (
                <button
                  className="text-teal-600 hover:text-teal-700 font-medium"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={handleVerifyOTP}
              className="w-full mt-5 p-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* -------- Step 3: RESET PASSWORD -------- */}
        {step === 3 && (
          <>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                className="w-full p-3 pr-12 border rounded-lg"
                placeholder="New Password"
                onChange={handleChange}
                value={formData.newPassword}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
            )}

            <div className="relative mt-3">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="w-full p-3 pr-12 border rounded-lg"
                placeholder="Confirm Password"
                onChange={handleChange}
                value={formData.confirmPassword}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}

            {errors.submit && (
              <p className="text-red-600 text-sm mt-2 text-center">
                {errors.submit}
              </p>
            )}

            <button
              onClick={handleResetPassword}
              className="w-full mt-5 p-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <button
          className="w-full mt-5 text-teal-600 hover:text-teal-700 font-medium"
          onClick={onBackToLogin}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
