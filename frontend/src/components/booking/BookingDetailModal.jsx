import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getBookingDetail,
  updateBooking,
  assignDriver,
  payAdvance,
  completeBooking,
  payFinalAmount,
  updateInvoice,
  updateTripEvent,
  cancelBooking,
} from "../../services/bookingServices";
import {
  getOwnerDrivers,
  addDriver,
  browseVerifiedDrivers,
  linkDriver,
} from "../../services/ownerServices";

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
  const [driverSearch, setDriverSearch] = useState("");
  const [completeError, setCompleteError] = useState("");

  const filteredDrivers = drivers.filter(
    (rel) =>
      rel.driver.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      rel.driver.phone.includes(driverSearch),
  );

  const [actionLoading, setActionLoading] = useState(""); // e.g. "save" | "advance" | "complete" | "final" | "assign"

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

  const runAction = async (key, fn) => {
    setActionLoading(key);
    try {
      await fn();
      await fetchDetail();
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setActionLoading("");
    }
  };

  const handleSave = () =>
    runAction("save", async () => {
      await updateBooking(bookingId, form);
      setEditMode(false);
    });

  const handleAssignDriver = (driverId) =>
    runAction("assign", () => assignDriver(bookingId, driverId));

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.phone) return;
    runAction("addDriver", async () => {
      const { data: driver } = await addDriver(user.id, newDriver);
      await assignDriver(bookingId, driver.id);
      setNewDriver({ name: "", phone: "" });
    });
  };

  const handlePayAdvance = () =>
    runAction("advance", () => payAdvance(bookingId));

  const handleComplete = () => {
    const missing = Object.entries(costs).filter(
      ([, v]) => v === "" || v === null,
    );
    if (missing.length > 0) {
      setCompleteError(
        "Please fill in every cost field (enter 0 if there was none).",
      );
      return;
    }
    setCompleteError("");
    runAction("complete", async () => {
      await completeBooking(bookingId, costs);
      setShowCompleteForm(false);
    });
  };

  const handlePayFinal = () =>
    runAction("final", () => payFinalAmount(bookingId));

  const handleTripEvent = (event) =>
    runAction("tripEvent", () => updateTripEvent(bookingId, event));

  const canCancel =
    ["CUSTOMER", "OWNER", "ADMIN"].includes(booking?.viewerRole) &&
    !["ONGOING", "PAYMENT_PENDING", "COMPLETED", "CANCELLED"].includes(
      booking?.status,
    );

  const handleCancel = () => {
    if (!window.confirm("Cancel this booking? This can't be undone.")) return;
    runAction("cancel", () => cancelBooking(bookingId));
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
                  ? `₹${booking.advancePaid}`
                  : "Not set"}{" "}
                {booking.payment?.status && `(${booking.payment.status})`}
              </p>
              <p>
                <span className="text-slate-400">Paid so far:</span> ₹
                {booking.payment?.amountPaid ?? 0}
              </p>
            </div>

            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={!!actionLoading}
                className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                {actionLoading === "cancel"
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            )}

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
                      disabled={!!actionLoading}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!!actionLoading}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {actionLoading === "save" ? "Saving..." : "Save"}
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
              booking.payment?.status !== "ADVANCE_PAID" &&
              booking.payment?.status !== "COMPLETED" && (
                <button
                  onClick={handlePayAdvance}
                  disabled={!!actionLoading}
                  className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading === "advance"
                    ? "Processing..."
                    : `Pay Advance (₹${booking.advancePaid})`}
                </button>
              )}

            {booking.viewerRole === "OWNER" && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                {["PENDING", "DRIVER_ASSIGNED", "CONFIRMED"].includes(
                  booking.status,
                ) &&
                  (editMode ? (
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
                          disabled={!!actionLoading}
                          className="rounded-lg bg-slate-100 px-4 py-2 text-sm disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!!actionLoading}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {actionLoading === "save" ? "Saving..." : "Save"}
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
                  ))}

                {["PENDING", "DRIVER_ASSIGNED", "CONFIRMED"].includes(
                  booking.status,
                ) && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Assign Driver
                    </label>
                    <input
                      placeholder="Filter your linked drivers..."
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                    <select
                      onChange={(e) =>
                        e.target.value && handleAssignDriver(e.target.value)
                      }
                      disabled={!!actionLoading}
                      defaultValue=""
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm disabled:opacity-50"
                    >
                      <option value="">
                        {actionLoading === "assign"
                          ? "Assigning..."
                          : "Select a driver..."}
                      </option>
                      <option value={user.id}>Drive it myself</option>
                      {filteredDrivers.map((rel) => (
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
                        disabled={!!actionLoading}
                        className="flex-1 rounded-lg border border-slate-200 p-2 text-xs disabled:opacity-50"
                      />
                      <input
                        placeholder="Phone"
                        value={newDriver.phone}
                        onChange={(e) =>
                          setNewDriver({ ...newDriver, phone: e.target.value })
                        }
                        disabled={!!actionLoading}
                        className="flex-1 rounded-lg border border-slate-200 p-2 text-xs disabled:opacity-50"
                      />
                      <button
                        onClick={handleAddDriver}
                        disabled={!!actionLoading}
                        className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {actionLoading === "addDriver"
                          ? "Adding..."
                          : "Add & Assign"}
                      </button>
                    </div>
                    <VerifiedDriverBrowser
                      ownerId={user.id}
                      onLinked={fetchDetail}
                    />
                  </div>
                )}
              </div>
            )}

            {(booking.viewerRole === "OWNER" ||
              booking.viewerRole === "DRIVER") &&
              booking.status !== "COMPLETED" && (
                <div className="flex flex-col gap-2">
                  {!booking.driverArrivedPickupAt && (
                    <button
                      onClick={() => handleTripEvent("ARRIVED_PICKUP")}
                      disabled={!!actionLoading}
                      className="rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {actionLoading === "tripEvent"
                        ? "Updating..."
                        : "I've Arrived at Pickup"}
                    </button>
                  )}
                  {booking.driverArrivedPickupAt &&
                    !booking.driverArrivedDestinationAt && (
                      <button
                        onClick={() => handleTripEvent("ARRIVED_DESTINATION")}
                        disabled={!!actionLoading}
                        className="rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {actionLoading === "tripEvent"
                          ? "Updating..."
                          : "I've Arrived at Destination"}
                      </button>
                    )}
                </div>
              )}

            {(booking.viewerRole === "OWNER" ||
              booking.viewerRole === "DRIVER") &&
              !booking.invoice &&
              booking.estimatedFare != null &&
              (!booking.driverArrivedDestinationAt ? (
                <div className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-700">
                  Mark "Arrived at Destination" (above) before you can complete
                  this trip.
                </div>
              ) : showCompleteForm ? (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700">
                    Trip Costs{" "}
                    <span className="font-normal text-slate-400">
                      (required — enter 0 if none)
                    </span>
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
                        disabled={!!actionLoading}
                        className="rounded-xl border border-slate-200 p-2.5 text-sm disabled:opacity-50"
                      />
                    ))}
                  </div>
                  {completeError && (
                    <p className="text-sm text-red-500">{completeError}</p>
                  )}
                  <button
                    onClick={handleComplete}
                    disabled={!!actionLoading}
                    className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === "complete"
                      ? "Completing..."
                      : "Confirm Completion & Generate Invoice"}
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

            {booking.status === "PAYMENT_PENDING" && (
              <p className="rounded-xl bg-amber-50 p-3 text-center text-sm font-medium text-amber-700">
                Trip finished — awaiting customer payment to fully close this
                booking.
              </p>
            )}
            {booking.invoice && (
              <InvoiceView
                booking={booking}
                onUpdated={fetchDetail}
                onPay={handlePayFinal}
                payLoading={actionLoading === "final"}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const VerifiedDriverBrowser = ({ ownerId, onLinked }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [linking, setLinking] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      if (search.length < 2) return setResults([]);
      const { data } = await browseVerifiedDrivers(ownerId, search);
      setResults(data);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleLink = async (driverId) => {
    setLinking(driverId);
    try {
      await linkDriver(ownerId, driverId);
      onLinked();
      setSearch("");
      setResults([]);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to link driver.");
    } finally {
      setLinking("");
    }
  };

  return (
    <div className="mt-3">
      <input
        placeholder="Search verified drivers by name/phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-slate-200 p-2 text-xs"
      />
      {results.length > 0 && (
        <div className="mt-2 space-y-1">
          {results.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs"
            >
              <span>
                {d.name} — {d.phone} {d.city && `(${d.city})`}
              </span>
              <button
                onClick={() => handleLink(d.id)}
                disabled={linking === d.id}
                className="rounded bg-blue-600 px-2 py-1 font-semibold text-white disabled:opacity-50"
              >
                {linking === d.id ? "..." : "Link"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const InvoiceView = ({ booking, onUpdated, onPay, payLoading }) => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fuelCost: booking.invoice.fuelCost,
    tollCost: booking.invoice.tollCost,
    parkingCost: booking.invoice.parkingCost,
    fineCost: booking.invoice.fineCost,
    otherCost: booking.invoice.otherCost,
  });
  const canEdit =
    booking.viewerRole === "OWNER" || booking.viewerRole === "DRIVER";
  const amountDue =
    booking.invoice.totalAmount - (booking.payment?.amountPaid || 0);
  const isFullyPaid = booking.payment?.status === "COMPLETED";

  const save = async () => {
    setSaving(true);
    try {
      await updateInvoice(booking.id, form);
      setEdit(false);
      onUpdated();
    } catch (err) {
      alert("Unable to update invoice.");
    } finally {
      setSaving(false);
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
              <div key={k} className="flex items-center justify-between">
                <span className="capitalize text-slate-500">
                  {k.replace("Cost", "")}
                </span>
                {edit ? (
                  <input
                    type="number"
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    disabled={saving}
                    className="w-24 rounded border border-slate-200 p-1 text-right text-xs disabled:opacity-50"
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
            <span>Paid So Far</span>
            <span>− ₹{booking.payment?.amountPaid ?? 0}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-red-600">
            <span>Amount Due</span>
            <span>₹{amountDue}</span>
          </div>

          {canEdit &&
            (edit ? (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEdit(false)}
                  disabled={saving}
                  className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
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

          {booking.viewerRole === "CUSTOMER" &&
            !isFullyPaid &&
            amountDue > 0 && (
              <button
                onClick={onPay}
                disabled={payLoading}
                className="mt-2 w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {payLoading ? "Processing Payment..." : `Pay ₹${amountDue}`}
              </button>
            )}
          {isFullyPaid && (
            <p className="mt-2 text-center text-sm font-semibold text-green-700">
              Fully Paid
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingDetailModal;
