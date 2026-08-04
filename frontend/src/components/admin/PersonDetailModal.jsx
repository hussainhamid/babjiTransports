import { useEffect, useState } from "react";
import { Pencil, UserX, X, UserCheck } from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import Input from "../common/Input";
import Loader from "../common/Loader";

// Generic view/edit/deactivate modal shared by Customer, Owner, and Driver
// admin pages — they all share the same underlying shape (name/phone/email).
const PersonDetailModal = ({
  open,
  onClose,
  personId,
  title,
  fetchById,
  onUpdate,
  onDeactivate,
  onActivate,
  renderStats,
  onSaved,
}) => {
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && personId) {
      setMode("view");
      setError("");
      fetchDetail();
    }
  }, [open, personId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const { data } = await fetchById(personId);
      setPerson(data);
      setForm({ name: data.name, email: data.email || "" });
    } catch (err) {
      console.error(err);
      setError("Unable to load details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onUpdate(personId, form);
      await fetchDetail();
      setMode("view");
      onSaved?.();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (
      !window.confirm(`Deactivate ${person.name}? This can be reversed later.`)
    )
      return;
    try {
      await onDeactivate(personId);
      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to deactivate.");
    }
  };

  const handleActivate = async () => {
    try {
      await onActivate(personId);
      await fetchDetail();
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert("Unable to activate.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <Loader label="Loading details..." />
        ) : !person ? (
          <p className="text-center text-red-500">{error || "Not found."}</p>
        ) : mode === "view" ? (
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {person.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{person.phone}</p>
                {person.email && (
                  <p className="text-sm text-slate-500">{person.email}</p>
                )}
              </div>
              <Badge status={person.isActive ? "ACTIVE" : "INACTIVE"}>
                {person.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {renderStats && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {renderStats(person)}
              </div>
            )}

            <p className="mt-5 text-xs text-slate-400">
              Joined {new Date(person.createdAt).toLocaleDateString()}
            </p>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              {person.isActive ? (
                <Button
                  variant="danger"
                  icon={UserX}
                  onClick={handleDeactivate}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  icon={UserCheck}
                  onClick={handleActivate}
                >
                  Activate
                </Button>
              )}
              <Button icon={Pencil} onClick={() => setMode("edit")}>
                Edit
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input label="Phone" value={person.phone} disabled />
            <p className="-mt-2 text-xs text-slate-400">
              Phone can't be changed here.
            </p>
            <Input
              label="Email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMode("view")}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PersonDetailModal;
