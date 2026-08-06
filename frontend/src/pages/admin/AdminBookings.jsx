import { useEffect, useState } from "react";
import { Plus, Search, X, Archive, RotateCcw } from "lucide-react";
import {
  getAdminBookings,
  getAdminBookingById,
  createAdminBooking,
  updateAdminBooking,
  archiveAdminBooking,
  restoreAdminBooking,
  getAdminCustomers,
  getAdminVehicles,
  getAdminDrivers,
} from "../../services/adminServices";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Input, { Select } from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";

const statusOptions = [
  "PENDING",
  "DRIVER_ASSIGNED",
  "CONFIRMED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

const emptyForm = {
  customerId: "",
  vehicleId: "",
  driverId: "",
  pickupLocation: "",
  destination: "",
  bookingDate: "",
  estimatedFare: "",
  advancePaid: "",
  remainingAmount: "",
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getAdminCustomers(1, 200)
      .then(({ data }) => setCustomers(data.customers))
      .catch(console.error);
    getAdminVehicles(1, 200)
      .then(({ data }) => setVehicles(data.vehicles))
      .catch(console.error);
    getAdminDrivers(1, 200)
      .then(({ data }) => setDrivers(data.drivers))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchBookings();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter, showArchived]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminBookings(
        page,
        10,
        statusFilter,
        showArchived,
        search,
      );
      setBookings(data.bookings);
      setTotalPages(data.pagination.totalPages || 1);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await createAdminBooking({
        ...form,
        driverId: form.driverId || undefined,
        estimatedFare: Number(form.estimatedFare),
        advancePaid: Number(form.advancePaid),
        remainingAmount: Number(form.remainingAmount),
      });
      setCreateOpen(false);
      setForm(emptyForm);
      fetchBookings();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (id) => {
    setSelected({ id });
    setDetailLoading(true);
    try {
      const { data } = await getAdminBookingById(id);
      setSelected(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateAdminBooking(selected.id, { status });
      await openDetail(selected.id);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Unable to update status.");
    }
  };

  const handleArchive = async () => {
    if (!window.confirm("Remove this booking from the active list?")) return;
    try {
      await archiveAdminBooking(selected.id);
      setSelected(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Unable to archive booking.");
    }
  };

  const handleRestore = async () => {
    try {
      await restoreAdminBooking(selected.id);
      setSelected(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Unable to restore booking.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bookings</h1>
          <p className="mt-1 text-slate-500">Manage all bookings.</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>
          Add Booking
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pickup, destination, or customer..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button
          variant={showArchived ? "primary" : "secondary"}
          size="sm"
          icon={Archive}
          onClick={() => setShowArchived((v) => !v)}
        >
          {showArchived ? "Showing Archived" : "Show Archived"}
        </Button>
      </div>

      <Card className="mt-6" padding="p-0">
        {loading ? (
          <Loader label="Loading bookings..." />
        ) : error ? (
          <p className="p-6 text-center text-red-600">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="p-6 text-center text-slate-400">No bookings found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Route</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => openDetail(b.id)}
                  className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-slate-50"
                >
                  <td className="px-6 py-3.5 font-medium text-slate-800">
                    {b.pickupLocation} → {b.destination}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {b.customer?.name}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {b.vehicle?.vehicleName}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {new Date(b.bookingDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge status={b.status}>
                      {b.status.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Booking"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Customer"
            required
            options={[
              { value: "", label: "Select customer..." },
              ...customers.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.phone})`,
              })),
            ]}
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          />
          <Select
            label="Vehicle"
            required
            options={[
              { value: "", label: "Select vehicle..." },
              ...vehicles.map((v) => ({ value: v.id, label: v.vehicleName })),
            ]}
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
          />
          <Select
            label="Driver (optional)"
            options={[
              { value: "", label: "Unassigned" },
              ...drivers.map((d) => ({ value: d.id, label: d.name })),
            ]}
            value={form.driverId}
            onChange={(e) => setForm({ ...form, driverId: e.target.value })}
          />
          <Input
            label="Pickup Location"
            required
            value={form.pickupLocation}
            onChange={(e) =>
              setForm({ ...form, pickupLocation: e.target.value })
            }
          />
          <Input
            label="Destination"
            required
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
          <Input
            label="Booking Date"
            type="datetime-local"
            required
            value={form.bookingDate}
            onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Est. Fare"
              type="number"
              required
              value={form.estimatedFare}
              onChange={(e) =>
                setForm({ ...form, estimatedFare: e.target.value })
              }
            />
            <Input
              label="Advance"
              type="number"
              required
              value={form.advancePaid}
              onChange={(e) =>
                setForm({ ...form, advancePaid: e.target.value })
              }
            />
            <Input
              label="Remaining"
              type="number"
              required
              value={form.remainingAmount}
              onChange={(e) =>
                setForm({ ...form, remainingAmount: e.target.value })
              }
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Booking
            </Button>
          </div>
        </form>
      </Modal>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Booking Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            {detailLoading ? (
              <Loader label="Loading..." />
            ) : (
              <div>
                <p className="text-lg font-bold text-slate-800">
                  {selected.pickupLocation} → {selected.destination}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(selected.bookingDate).toLocaleString()}
                </p>

                <div className="mt-4 space-y-1 text-sm">
                  <p>
                    <span className="text-slate-400">Customer:</span>{" "}
                    {selected.customer?.name} ({selected.customer?.phone})
                  </p>
                  <p>
                    <span className="text-slate-400">Vehicle:</span>{" "}
                    {selected.vehicle?.vehicleName}
                  </p>
                  <p>
                    <span className="text-slate-400">Driver:</span>{" "}
                    {selected.driver?.name || "Unassigned"}
                  </p>
                  <p>
                    <span className="text-slate-400">Fare:</span> ₹
                    {selected.estimatedFare} (Advance ₹{selected.advancePaid} /
                    Remaining ₹{selected.remainingAmount})
                  </p>
                  <p>
                    <span className="text-slate-400">Payment:</span>{" "}
                    {selected.payment
                      ? `${selected.payment.status}${selected.payment.isVoided ? " (voided)" : ""}`
                      : "None"}
                  </p>
                </div>

                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={selected.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  {selected.isArchived ? (
                    <Button
                      variant="secondary"
                      icon={RotateCcw}
                      onClick={handleRestore}
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      icon={Archive}
                      onClick={handleArchive}
                    >
                      Remove from List
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
