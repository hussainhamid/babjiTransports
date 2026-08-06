import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getBookingDetail,
  updateBooking,
  assignDriver,
  payAdvance,
  completeBooking,
} from "../../services/bookingServices";
import { getOwnerDrivers, addDriver } from "../../services/ownerServices";

const BookingDetailModal = ({ bookingId, onClose, onChanged }) => {
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [newDriver, setNewDriver] = useState({ name: "", phone: "" });
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [costs, setCosts] = useState({
    fuelCost: "",
    tollCost: "",
    parkingCost: "",
    fineCost: "",
    otherCost: "",
  });

  useEffect(() => {
    fetchDetail();
  }, [bookingId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const { data } = await getBookingDetail(bookingId);
      setBooking(data);
      setForm({
        pickupLocation: data.pickupLocation,
        destination: data.destination,
        bookingDate: data.bookingDate?.slice(0, 16),
        estimatedFare: data.estimatedFare ?? "",
        advancePaid: data.advancePaid ?? "",
      });
      if (data.viewerRole === "OWNER") {
        const { data: d } = await getOwnerDrivers(user.id);
        setDrivers(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateBooking(bookingId, form);
      setEditMode(false);
      fetchDetail();
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to save.");
    }
  };

  const handleAssignDriver = async (driverId) => {
    try {
      await assignDriver(bookingId, driverId);
      fetchDetail();
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to assign driver.");
    }
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.phone) return;
    try {
      const { data: driver } = await addDriver(user.id, newDriver);
      await handleAssignDriver(driver.id);
      setNewDriver({ name: "", phone: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Unable to add driver.");
    }
  };

  const handlePayAdvance = async () => {
    try {
      await payAdvance(bookingId);
      fetchDetail();
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to pay advance.");
    }
  };

  const handleComplete = async () => {
    try {
      await completeBooking(bookingId, costs);
      setShowCompleteForm(false);
      fetchDetail();
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to complete trip.");
    }
  };

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Booking Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {loading || !booking ? (
          <p className="text-center text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="font-semibold text-slate-800">
                {booking.pickupLocation} → {booking.destination}
              </p>
              <p className="text-sm text-slate-500">
                {new Date(booking.bookingDate).toLocaleString()} •{" "}
                {booking.status}
              </p>
            </div>

            <div className="space-y-1 text-sm">
              <p>
                <span className="text-slate-400">Customer:</span>{" "}
                {booking.customer?.name} ({booking.customer?.phone})
              </p>
              <p>
                <span className="text-slate-400">Owner:</span>{" "}
                {booking.vehicle?.owner?.name} ({booking.vehicle?.owner?.phone})
              </p>
              <p>
                <span className="text-slate-400">Driver:</span>{" "}
                {booking.driver
                  ? `${booking.driver.name} (${booking.driver.phone})`
                  : "Not assigned yet"}
              </p>
              <p>
                <span className="text-slate-400">Vehicle:</span>{" "}
                {booking.vehicle?.vehicleName} — {booking.vehicle?.brand}{" "}
                {booking.vehicle?.model}
              </p>
              <p>
                <span className="text-slate-400">Fare:</span>{" "}
                {booking.estimatedFare != null
                  ? `₹${booking.estimatedFare}`
                  : "Awaiting owner's quote"}
              </p>
              <p>
                <span className="text-slate-400">Advance:</span>{" "}
                {booking.advancePaid != null
                  ? `₹${booking.advancePaid} (${booking.payment?.status || "not yet paid"})`
                  : "Not set"}
              </p>
            </div>

            {/* CUSTOMER: edit while pending + pay advance */}
            {booking.viewerRole === "CUSTOMER" &&
              booking.status === "PENDING" &&
              (editMode ? (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <input
                    value={form.pickupLocation}
                    onChange={(e) =>
                      setForm({ ...form, pickupLocation: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                    placeholder="Pickup"
                  />
                  <input
                    value={form.destination}
                    onChange={(e) =>
                      setForm({ ...form, destination: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                    placeholder="Destination"
                  />
                  <input
                    type="datetime-local"
                    value={form.bookingDate}
                    onChange={(e) =>
                      setForm({ ...form, bookingDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Edit booking
                </button>
              ))}

            {booking.viewerRole === "CUSTOMER" &&
              booking.advancePaid != null &&
              (!booking.payment || booking.payment.status === "PENDING") && (
                <button
                  onClick={handlePayAdvance}
                  className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Pay Advance (₹{booking.advancePaid})
                </button>
              )}

            {/* OWNER: edit fare/advance + assign driver + mark complete */}
            {booking.viewerRole === "OWNER" && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                {editMode ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Fare (₹)"
                        value={form.estimatedFare}
                        onChange={(e) =>
                          setForm({ ...form, estimatedFare: e.target.value })
                        }
                        className="rounded-xl border border-slate-200 p-2.5 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Advance (₹)"
                        value={form.advancePaid}
                        onChange={(e) =>
                          setForm({ ...form, advancePaid: e.target.value })
                        }
                        className="rounded-xl border border-slate-200 p-2.5 text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditMode(false)}
                        className="rounded-lg bg-slate-100 px-4 py-2 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Edit fare / advance
                  </button>
                )}

                {booking.status !== "COMPLETED" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Assign Driver
                    </label>
                    <select
                      onChange={(e) =>
                        e.target.value && handleAssignDriver(e.target.value)
                      }
                      defaultValue=""
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                    >
                      <option value="">Select a driver...</option>
                      <option value={user.id}>Drive it myself</option>
                      {drivers.map((rel) => (
                        <option key={rel.driver.id} value={rel.driver.id}>
                          {rel.driver.name} ({rel.driver.phone})
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex gap-2">
                      <input
                        placeholder="New driver name"
                        value={newDriver.name}
                        onChange={(e) =>
                          setNewDriver({ ...newDriver, name: e.target.value })
                        }
                        className="flex-1 rounded-lg border border-slate-200 p-2 text-xs"
                      />
                      <input
                        placeholder="Phone"
                        value={newDriver.phone}
                        onChange={(e) =>
                          setNewDriver({ ...newDriver, phone: e.target.value })
                        }
                        className="flex-1 rounded-lg border border-slate-200 p-2 text-xs"
                      />
                      <button
                        onClick={handleAddDriver}
                        className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Add & Assign
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OWNER or DRIVER: mark completed */}
            {(booking.viewerRole === "OWNER" ||
              booking.viewerRole === "DRIVER") &&
              booking.status !== "COMPLETED" &&
              booking.estimatedFare != null &&
              (showCompleteForm ? (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700">
                    Trip Costs
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "fuelCost",
                      "tollCost",
                      "parkingCost",
                      "fineCost",
                      "otherCost",
                    ].map((k) => (
                      <input
                        key={k}
                        type="number"
                        placeholder={k.replace("Cost", "")}
                        value={costs[k]}
                        onChange={(e) =>
                          setCosts({ ...costs, [k]: e.target.value })
                        }
                        className="rounded-xl border border-slate-200 p-2.5 text-sm"
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleComplete}
                    className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Confirm Completion & Generate Invoice
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCompleteForm(true)}
                  className="w-full rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
                >
                  Mark Trip Completed
                </button>
              ))}

            {/* Everyone: invoice, once it exists */}
            {booking.invoice && (
              <InvoiceView booking={booking} onUpdated={fetchDetail} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InvoiceView = ({ booking, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    fuelCost: booking.invoice.fuelCost,
    tollCost: booking.invoice.tollCost,
    parkingCost: booking.invoice.parkingCost,
    fineCost: booking.invoice.fineCost,
    otherCost: booking.invoice.otherCost,
  });
  const canEdit =
    booking.viewerRole === "OWNER" || booking.viewerRole === "DRIVER";

  const save = async () => {
    try {
      const { updateInvoice: updateInvoiceService } =
        await import("../../services/bookingServices");
      await updateInvoiceService(booking.id, form);
      setEdit(false);
      onUpdated();
    } catch (err) {
      alert("Unable to update invoice.");
    }
  };

  return (
    <div className="border-t border-slate-100 pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        {open ? "Hide Invoice" : "View Invoice"}
      </button>
      {open && (
        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Base Fare</span>
            <span>₹{booking.estimatedFare}</span>
          </div>
          {["fuelCost", "tollCost", "parkingCost", "fineCost", "otherCost"].map(
            (k) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-slate-500 capitalize">
                  {k.replace("Cost", "")}
                </span>
                {edit ? (
                  <input
                    type="number"
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="w-24 rounded border border-slate-200 p-1 text-right text-xs"
                  />
                ) : (
                  <span>₹{booking.invoice[k]}</span>
                )}
              </div>
            ),
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Company Commission (20%)</span>
            <span>₹{booking.payment?.companyCommission ?? 0}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
            <span>Total Amount</span>
            <span>₹{booking.invoice.totalAmount}</span>
          </div>
          <div className="flex justify-between text-green-700">
            <span>Advance Paid</span>
            <span>− ₹{booking.advancePaid || 0}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-red-600">
            <span>Amount Due</span>
            <span>
              ₹{booking.invoice.totalAmount - (booking.advancePaid || 0)}
            </span>
          </div>

          {canEdit &&
            (edit ? (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEdit(false)}
                  className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEdit(true)}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Edit costs
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default BookingDetailModal;
