import { useState } from "react";
import { applyAsDriver } from "../services/driverServices";

const BecomeDriver = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    licenseNumber: "",
    experienceYears: "",
  });
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [feeAgreed, setFeeAgreed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await applyAsDriver(form);
      setStatus("success");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit application.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-800">
          Become a Driver
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500">
          Apply below — our team will verify your details before you can be
          assigned trips.
        </p>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-md sm:p-6">
          {status === "success" ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">
                Application submitted!
              </p>
              <p className="mt-2 text-sm text-slate-500">
                We'll notify you once your account is verified.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
              <input
                required
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
              <input
                required
                placeholder="Driving License Number"
                value={form.licenseNumber}
                onChange={(e) =>
                  setForm({ ...form, licenseNumber: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
              <input
                type="number"
                placeholder="Years of Experience"
                value={form.experienceYears}
                onChange={(e) =>
                  setForm({ ...form, experienceYears: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  ₹100 one-time driver registration fee applies.
                </p>
                <label className="mt-2 flex items-center gap-2 text-sm text-amber-700">
                  <input
                    type="checkbox"
                    required
                    checked={feeAgreed}
                    onChange={(e) => setFeeAgreed(e.target.checked)}
                  />
                  I agree to pay the ₹100 registration fee.
                </label>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeDriver;
