import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  getAdminCustomers,
  getAdminCustomerById,
  createAdminCustomer,
  updateAdminCustomer,
  deactivateAdminCustomer,
  activateAdminCustomer,
} from "../../services/adminServices";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import PersonDetailModal from "../../components/admin/PersonDetailModal";

const emptyForm = { name: "", phone: "", email: "" };

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCustomers();
    }, 400); // debounce — don't hit the API on every keystroke
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminCustomers(page, 10, search);
      setCustomers(data.customers);
      setTotalPages(data.pagination.totalPages || 1);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await createAdminCustomer(form);
      setCreateOpen(false);
      setForm(emptyForm);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Customers</h1>
          <p className="mt-1 text-slate-500">Manage registered customers.</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>
          Add Customer
        </Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card className="mt-6" padding="p-0">
        {loading ? (
          <Loader label="Loading customers..." />
        ) : error ? (
          <p className="p-6 text-center text-red-600">{error}</p>
        ) : customers.length === 0 ? (
          <p className="p-6 text-center text-slate-400">
            {search ? "No customers match your search." : "No customers yet."}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Trips</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-slate-50"
                >
                  <td className="px-6 py-3.5 font-medium text-slate-800">
                    {c.name}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{c.phone}</td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {c.email || "—"}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {c._count?.customerTrips ?? 0}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge status={c.isActive ? "ACTIVE" : "INACTIVE"}>
                      {c.isActive ? "Active" : "Inactive"}
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
        title="Add Customer"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Phone"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91XXXXXXXXXX"
          />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
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
              Create Customer
            </Button>
          </div>
        </form>
      </Modal>

      <PersonDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        personId={selectedId}
        title="Customer Details"
        fetchById={getAdminCustomerById}
        onUpdate={updateAdminCustomer}
        onDeactivate={deactivateAdminCustomer}
        onActivate={activateAdminCustomer}
        onSaved={fetchCustomers}
        renderStats={(c) => (
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-2xl font-bold text-slate-800">
              {c._count?.customerTrips ?? 0}
            </p>
            <p className="text-xs text-slate-500">Total Trips</p>
          </div>
        )}
      />
    </div>
  );
};

export default AdminCustomers;
