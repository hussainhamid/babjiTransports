import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import BookingDetailModal from "../components/booking/BookingDetailModal";
import { listMyBookings } from "../services/bookingServices";

const trackingSteps = [
  { key: "assigned", label: "Driver Assigned" },
  { key: "advance", label: "Paid Advance" },
  { key: "started", label: "Journey Started" },
  { key: "destination", label: "Reached Destination" },
  { key: "completed", label: "Completed" },
];

function getStepState(booking) {
  return {
    assigned: !!booking.driverId,
    advance:
      booking.payment?.status === "ADVANCE_PAID" ||
      booking.payment?.status === "COMPLETED",
    started:
      ["ONGOING", "PAYMENT_PENDING", "COMPLETED"].includes(booking.status) ||
      !!booking.driverArrivedPickupAt,
    destination: !!booking.driverArrivedDestinationAt,
    completed: booking.status === "COMPLETED", // only true once the customer has paid the final invoice
  };
}

const TrackingBar = ({ booking }) => {
  const state = getStepState(booking);
  return (
    <div className="mt-4 flex items-center">
      {trackingSteps.map((step, i) => {
        const done = state[step.key];
        const isLast = i === trackingSteps.length - 1;
        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`h-4 w-4 shrink-0 rounded-full border-2 ${done ? "border-green-500 bg-green-500" : "border-slate-300 bg-white"}`}
              />
              <p
                className={`mt-1 w-14 sm:w-16 text-center text-[9px] sm:text-xs ${done ? "font-semibold text-green-600" : "text-slate-400"}`}
              >
                {step.label}
              </p>
            </div>
            {!isLast && (
              <div
                className={`h-1 flex-1 ${done ? "bg-green-500" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Tracking = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    if (user) fetchBookings();
    else setLoading(false);
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await listMyBookings();
      setBookings(data.bookings.filter((b) => b.status !== "CANCELLED"));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 text-center">
        <p className="text-slate-500">Please log in to track your bookings.</p>
      </div>
    );
  }

  if (loading)
    return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-800">
          Track Your Bookings
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500">
          Live status of all your trips.
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {bookings.length === 0 ? (
          <p className="mt-10 text-slate-400">No bookings to track yet.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBookingId(b.id)}
                className="cursor-pointer rounded-2xl bg-white p-5 shadow-md transition hover:shadow-lg"
              >
                <p className="font-semibold text-slate-800">
                  {b.pickupLocation} → {b.destination}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(b.bookingDate).toLocaleString()}
                  {b.driver && ` • Driver: ${b.driver.name}`}
                </p>
                <TrackingBar booking={b} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BookingDetailModal
        bookingId={selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
        onChanged={fetchBookings}
      />
    </div>
  );
};

export default Tracking;
