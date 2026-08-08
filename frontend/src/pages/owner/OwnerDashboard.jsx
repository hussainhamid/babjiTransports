import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getOwnerDashboard,
  getOwnerDrivers,
  getOwnerBookings,
  quoteBookingFare,
} from "../../services/ownerServices";
import BookingDetailModal from "../../components/booking/BookingDetailModal";

const statusGroups = [
  { key: "PENDING", label: "Pending Requests" },
  { key: "DRIVER_ASSIGNED", label: "Driver Assigned" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "ONGOING", label: "Ongoing" },
  { key: "PAYMENT_PENDING", label: "Awaiting Payment" }, // ← added
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteForms, setQuoteForms] = useState({});
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, b, d] = await Promise.all([
        getOwnerDashboard(user.id),
        getOwnerBookings(user.id, 1, 100), // no status filter — get everything
        getOwnerDrivers(user.id),
      ]);
      setStats(s.data);
      setBookings(b.data.bookings);
      setDrivers(d.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (bookingId, field, value) =>
    setQuoteForms((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], [field]: value },
    }));

  const [quotingId, setQuotingId] = useState(null);

  const handleQuote = async (bookingId) => {
    const form = quoteForms[bookingId];
    if (!form?.estimatedFare) return alert("Enter a fare before confirming.");
    setQuotingId(bookingId);
    try {
      await quoteBookingFare(user.id, bookingId, form);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Unable to update booking.");
    } finally {
      setQuotingId(null);
    }
  };

  if (loading)
    return <div className="p-10 text-center text-slate-400">Loading...</div>;

  const grouped = statusGroups
    .map((g) => ({
      ...g,
      bookings: bookings.filter((b) => b.status === g.key),
    }))
    .filter((g) => g.bookings.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-800">Owner Dashboard</h1>
        <p className="text-slate-500">
          {user?.name} • {user?.phone}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              {stats?.totalVehicles ?? 0}
            </p>
            <p className="text-sm text-slate-500">Vehicles</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              {stats?.totalDrivers ?? 0}
            </p>
            <p className="text-sm text-slate-500">Drivers</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              {stats?.totalBookings ?? 0}
            </p>
            <p className="text-sm text-slate-500">Bookings</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              ₹{stats?.totalRevenue ?? 0}
            </p>
            <p className="text-sm text-slate-500">Revenue</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <p className="mt-10 text-slate-400">No bookings yet.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.key} className="mt-10">
              <h2 className="text-xl font-bold text-slate-800">
                {group.label}{" "}
                <span className="text-sm font-normal text-slate-400">
                  ({group.bookings.length})
                </span>
              </h2>
              <div className="mt-4 space-y-4">
                {group.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl bg-white p-5 shadow-md"
                  >
                    <p className="font-semibold text-slate-800">
                      {b.pickupLocation} → {b.destination}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(b.bookingDate).toLocaleString()} •{" "}
                      {b.customer?.name} ({b.customer?.phone}) •{" "}
                      {b.vehicle?.vehicleName}
                      {b.estimatedFare != null && ` • ₹${b.estimatedFare}`}
                    </p>

                    {group.key === "PENDING" ? (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <input
                          type="number"
                          placeholder="Fare (₹)"
                          value={quoteForms[b.id]?.estimatedFare || ""}
                          onChange={(e) =>
                            updateForm(b.id, "estimatedFare", e.target.value)
                          }
                          className="rounded-xl border border-slate-200 p-2.5 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Advance (₹)"
                          value={quoteForms[b.id]?.advancePaid || ""}
                          onChange={(e) =>
                            updateForm(b.id, "advancePaid", e.target.value)
                          }
                          className="rounded-xl border border-slate-200 p-2.5 text-sm"
                        />
                        <select
                          value={quoteForms[b.id]?.driverId || ""}
                          onChange={(e) =>
                            updateForm(b.id, "driverId", e.target.value)
                          }
                          className="rounded-xl border border-slate-200 p-2.5 text-sm"
                        >
                          <option value="">Assign driver later</option>
                          <option value={user.id}>Drive it myself</option>
                          {drivers.map((rel) => (
                            <option key={rel.driver.id} value={rel.driver.id}>
                              {rel.driver.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between">
                      {group.key === "PENDING" ? (
                        <button
                          onClick={() => handleQuote(b.id)}
                          disabled={quotingId === b.id}
                          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {quotingId === b.id
                            ? "Sending..."
                            : "Confirm & Send Quote"}
                        </button>
                      ) : (
                        <span />
                      )}
                      <button
                        onClick={() => setSelectedBookingId(b.id)}
                        className="text-sm font-medium text-slate-500 hover:underline"
                      >
                        View Full Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BookingDetailModal
        bookingId={selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
        onChanged={fetchAll}
      />
    </div>
  );
};

export default OwnerDashboard;
