import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVehicleById } from "../services/vehicleServices";
import { createBooking } from "../services/bookingServices";
import { useAuth } from "../context/AuthContext";

const Booking = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user, setSession } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    pickupLocation: "",
    destination: "",
    bookingDate: "",
    customerName: "",
    customerPhone: "",
  });

  useEffect(() => {
    getVehicleById(vehicleId)
      .then(({ data }) => setVehicle(data))
      .catch(() => setError("Unable to load vehicle."))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await createBooking({ vehicleId, ...form });

      if (data.token) {
        setSession(data.token, {
          id: data.booking.customerId,
          name: form.customerName,
          phone: form.customerPhone,
          role: "CUSTOMER",
        });
      }

      navigate("/customer");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create booking.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center text-slate-400">Loading...</div>;
  if (!vehicle)
    return (
      <div className="p-10 text-center text-red-500">
        {error || "Vehicle not found."}
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-4">
            <img
              src={vehicle.image}
              alt={vehicle.vehicleName}
              className="h-24 w-32 rounded-xl object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {vehicle.vehicleName}
              </h1>
              <p className="text-slate-500">
                {vehicle.brand} • {vehicle.model} • ₹{vehicle.pricePerKm}/km
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              name="pickupLocation"
              required
              placeholder="Pickup Location"
              value={form.pickupLocation}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 p-3"
            />
            <input
              name="destination"
              required
              placeholder="Destination"
              value={form.destination}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 p-3"
            />
            <input
              name="bookingDate"
              type="datetime-local"
              required
              value={form.bookingDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 p-3"
            />
            <div className="grid grid-cols-2 gap-4">
              <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                The vehicle owner will review your request and confirm the fare
                shortly.
              </p>
            </div>

            {(!user || user.role !== "CUSTOMER") && (
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <input
                  name="customerName"
                  required
                  placeholder="Your Name"
                  value={form.customerName}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 p-3"
                />
                <input
                  name="customerPhone"
                  required
                  placeholder="Your Phone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 p-3"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Booking..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
