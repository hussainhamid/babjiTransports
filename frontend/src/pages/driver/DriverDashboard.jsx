import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getDriverDashboard,
  getDriverBookings,
  updateTripStatus,
} from "../../services/driverServices";

const nextStatus = {
  DRIVER_ASSIGNED: "ONGOING",
  CONFIRMED: "ONGOING",
  ONGOING: "COMPLETED",
};
const nextLabel = {
  DRIVER_ASSIGNED: "Start Trip",
  CONFIRMED: "Start Trip",
  ONGOING: "Mark Completed",
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([
        getDriverDashboard(),
        getDriverBookings(),
      ]);
      setStats(s.data);
      setBookings(b.data.bookings);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (bookingId, currentStatus) => {
    try {
      await updateTripStatus(bookingId, nextStatus[currentStatus]);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Unable to update trip status.");
    }
  };

  if (loading)
    return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-800">Driver Dashboard</h1>
        <p className="text-slate-500">
          {user?.name} • {user?.phone}
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
        )}

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              {stats?.totalTrips ?? 0}
            </p>
            <p className="text-sm text-slate-500">Total Trips</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              {stats?.activeTrips ?? 0}
            </p>
            <p className="text-sm text-slate-500">Active</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              {stats?.completedTrips ?? 0}
            </p>
            <p className="text-sm text-slate-500">Completed</p>
          </div>
        </div>

        <h2 className="mt-10 text-xl font-bold text-slate-800">Your Trips</h2>
        <div className="mt-4 space-y-3">
          {bookings.length === 0 ? (
            <p className="text-slate-400">No trips assigned yet.</p>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="rounded-2xl bg-white p-5 shadow-md">
                <p className="font-semibold text-slate-800">
                  {b.pickupLocation} → {b.destination}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(b.bookingDate).toLocaleString()} •{" "}
                  {b.customer?.name} ({b.customer?.phone}) •{" "}
                  {b.vehicle?.vehicleName}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {b.status}
                  </span>
                  {nextStatus[b.status] && (
                    <button
                      onClick={() => handleAdvance(b.id, b.status)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      {nextLabel[b.status]}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
