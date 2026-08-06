import { useEffect, useState } from "react";
import { Plus, X, RotateCcw, Ban } from "lucide-react";
import {
  getAdminPayments,
  getAdminPaymentById,
  createAdminPayment,
  updateAdminPayment,
  refundAdminPayment,
  voidAdminPayment,
  restoreAdminPayment,
  getAdminBookings,
} from "../../services/adminServices";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Input, { Select } from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";

const emptyForm = {
  bookingId: "",
  advanceAmount: "",
  companyCommission: "",
  driverAmount: "",
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showVoided, setShowVoided] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [finalAmount, setFinalAmount] = useState("");

  useEffect(() => {
    getAdminBookings(1, 200)
      .then(({ data }) => setBookings(data.bookings))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [page, showVoided]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminPayments(page, 10, showVoided);
      setPayments(data.payments);
      setTotalPages(data.pagination.totalPages || 1);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await createAdminPayment({
        ...form,
        advanceAmount: Number(form.advanceAmount),
        companyCommission: Number(form.companyCommission),
        driverAmount: Number(form.driverAmount),
      });
      setCreateOpen(false);
      setForm(emptyForm);
      fetchPayments();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (id) => {
    setSelected({ id });
    setEditMode(false);
    setDetailLoading(true);
    try {
      const { data } = await getAdminPaymentById(id);
      setSelected(data);
      setFinalAmount(data.finalAmount ?? "");
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveFinalAmount = async (e) => {
    e.preventDefault();
    try {
      await updateAdminPayment(selected.id, {
        finalAmount: Number(finalAmount),
      });
      await openDetail(selected.id);
      setEditMode(false);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Unable to update payment.");
    }
  };

  const handleRefund = async () => {
    if (!window.confirm("Mark this payment as refunded?")) return;
    try {
      await refundAdminPayment(selected.id);
      await openDetail(selected.id);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Unable to refund payment.");
    }
  };

  const handleVoid = async () => {
    if (!window.confirm("Remove this payment from the active list?")) return;
    try {
      await voidAdminPayment(selected.id);
      setSelected(null);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Unable to void payment.");
    }
  };

  const handleRestore = async () => {
    try {
      await restoreAdminPayment(selected.id);
      setSelected(null);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Unable to restore payment.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Payments</h1>
          <p className="mt-1 text-slate-500">Track and manage payments.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={showVoided ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              setShowVoided((v) => !v);
              setPage(1);
            }}
          >
            {showVoided ? "Showing Voided" : "Show Voided"}
          </Button>
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            Add Payment
          </Button>
        </div>
      </div>

      <Card className="mt-6" padding="p-0">
        {loading ? (
          <Loader label="Loading payments..." />
        ) : error ? (
          <p className="p-6 text-center text-red-600">{error}</p>
        ) : payments.length === 0 ? (
          <p className="p-6 text-center text-slate-400">No payments found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Booking</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Advance</th>
                <th className="px-6 py-3 font-medium">Final</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => openDetail(p.id)}
                  className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-slate-50"
                >
                  <td className="px-6 py-3.5 font-medium text-slate-800">
                    {p.booking?.pickupLocation} → {p.booking?.destination}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {p.booking?.customer?.name}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    ₹{p.advanceAmount}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {p.finalAmount ? `₹${p.finalAmount}` : "—"}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge status={p.status}>{p.status}</Badge>
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
        title="Add Payment"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Booking"
            required
            options={[
              { value: "", label: "Select booking..." },
              ...bookings
                .filter((b) => !b.payment)
                .map((b) => ({
                  value: b.id,
                  label: `${b.pickupLocation} → ${b.destination} (${b.customer?.name})`,
                })),
            ]}
            value={form.bookingId}
            onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
          />
          <p className="-mt-2 text-xs text-slate-400">
            Only bookings without an existing payment are shown.
          </p>
          <Input
            label="Advance Amount"
            type="number"
            required
            value={form.advanceAmount}
            onChange={(e) =>
              setForm({ ...form, advanceAmount: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company Commission"
              type="number"
              required
              value={form.companyCommission}
              onChange={(e) =>
                setForm({ ...form, companyCommission: e.target.value })
              }
            />
            <Input
              label="Driver Amount"
              type="number"
              required
              value={form.driverAmount}
              onChange={(e) =>
                setForm({ ...form, driverAmount: e.target.value })
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
              Create Payment
            </Button>
          </div>
        </form>
      </Modal>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Payment Details
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
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-800">
                      {selected.booking?.pickupLocation} →{" "}
                      {selected.booking?.destination}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selected.booking?.customer?.name} (
                      {selected.booking?.customer?.phone})
                    </p>
                  </div>
                  <Badge status={selected.status}>{selected.status}</Badge>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-slate-800">
                      ₹{selected.advanceAmount}
                    </p>
                    <p className="text-xs text-slate-500">Advance Paid</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-slate-800">
                      {selected.finalAmount ? `₹${selected.finalAmount}` : "—"}
                    </p>
                    <p className="text-xs text-slate-500">Final Amount</p>
                  </div>
                </div>

                {editMode ? (
                  <form
                    onSubmit={handleSaveFinalAmount}
                    className="mt-5 space-y-3"
                  >
                    <Input
                      label="Final Amount"
                      type="number"
                      value={finalAmount}
                      onChange={(e) => setFinalAmount(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Set final amount
                  </button>
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  {selected.isVoided ? (
                    <Button
                      variant="secondary"
                      icon={RotateCcw}
                      onClick={handleRestore}
                    >
                      Restore
                    </Button>
                  ) : (
                    <>
                      <Button variant="danger" icon={Ban} onClick={handleVoid}>
                        Void
                      </Button>
                      {selected.status !== "REFUNDED" && (
                        <Button variant="secondary" onClick={handleRefund}>
                          Mark Refunded
                        </Button>
                      )}
                    </>
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

export default AdminPayments;
