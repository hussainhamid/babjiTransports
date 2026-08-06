import { useEffect, useState } from "react";
import {
  getMyProfile,
  getMyDashboard,
  getMyBookings,
} from "../../services/customerServices";
import BookingDetailModal from "../../components/booking/BookingDetailModal";

const statusGroups = [
  { key: "PENDING", label: "Pending Requests" },
  { key: "DRIVER_ASSIGNED", label: "Driver Assigned" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "ONGOING", label: "Ongoing" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const CustomerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [p, s, b] = await Promise.all([
        getMyProfile(),
        getMyDashboard(),
        getMyBookings(1, 100),
      ]);
      setProfile(p.data);
      setStats(s.data);
      setBookings(b.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-800">
          Hi, {profile?.name}
        </h1>
        <p className="text-slate-500">{profile?.phone}</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              {stats?.totalBookings ?? 0}
            </p>
            <p className="text-sm text-slate-500">Total Bookings</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              {stats?.activeBookings ?? 0}
            </p>
            <p className="text-sm text-slate-500">Active</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-2xl font-bold text-slate-800">
              ₹{stats?.totalSpent ?? 0}
            </p>
            <p className="text-sm text-slate-500">Total Spent</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <p className="mt-10 text-slate-400">No bookings yet.</p>
        ) : (
          statusGroups.map((group) => {
            const groupBookings = bookings.filter(
              (b) => b.status === group.key,
            );
            if (groupBookings.length === 0) return null;
            return (
              <div key={group.key} className="mt-10">
                <h2 className="text-xl font-bold text-slate-800">
                  {group.label}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    ({groupBookings.length})
                  </span>
                </h2>
                <div className="mt-4 space-y-3">
                  {groupBookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      className="cursor-pointer rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <p className="font-semibold text-slate-800">
                        {b.pickupLocation} → {b.destination}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(b.bookingDate).toLocaleDateString()}
                        {b.estimatedFare
                          ? ` • ₹${b.estimatedFare}`
                          : " • Fare pending owner confirmation"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
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

export default CustomerDashboard;
