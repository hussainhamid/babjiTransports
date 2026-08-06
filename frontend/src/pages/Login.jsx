import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { requestOtp, confirmOtp, confirmAdminKey } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("phone"); // "phone" | "otp" | "adminKey"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await requestOtp(phone);
      setDevOtp(data.devOtp || "");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await confirmOtp(phone, otp);
      if (data.requiresSecretKey) {
        setStep("adminKey");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAdminKey = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await confirmAdminKey(phone, secretKey);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid secret key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-slate-800">
          {step === "phone" && "Log In / Sign Up"}
          {step === "otp" && "Verify OTP"}
          {step === "adminKey" && "Admin Verification"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {step === "phone" &&
            "Enter your phone number — we'll create an account if you're new."}
          {step === "otp" && `Enter the code sent to ${phone}.`}
          {step === "adminKey" && "Enter your admin secret key to continue."}
        </p>

        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <input
              type="text"
              required
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {devOtp && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Dev mode — OTP is <strong>{devOtp}</strong> (no SMS provider
                connected yet)
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-sm text-slate-500 hover:underline"
            >
              Use a different number
            </button>
          </form>
        )}

        {step === "adminKey" && (
          <form onSubmit={handleVerifyAdminKey} className="mt-6 space-y-4">
            <input
              type="password"
              required
              autoFocus
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Admin secret key"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Enter Admin Panel"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
