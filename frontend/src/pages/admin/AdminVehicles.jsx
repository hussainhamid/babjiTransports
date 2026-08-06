import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import {
  getAdminVehicles,
  getAdminVehicleById,
  createAdminVehicle,
  updateAdminVehicle,
  deleteAdminVehicle,
  reactivateAdminVehicle,
  getAdminOwners,
} from "../../services/adminServices";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Input, { Select } from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";

const categoryOptions = [
  { value: "PASSENGER", label: "Passenger" },
  { value: "GOODS", label: "Goods" },
];
const fuelOptions = ["PETROL", "DIESEL", "CNG", "ELECTRIC", "HYBRID"].map(
  (v) => ({ value: v, label: v }),
);
const transmissionOptions = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
];

const emptyForm = {
  ownerId: "",
  vehicleName: "",
  brand: "",
  model: "",
  category: "PASSENGER",
  fuelType: "PETROL",
  transmission: "MANUAL",
  seats: "",
  loadCapacity: "",
  city: "",
  pricePerKm: "",
  minimumFare: "",
};

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    getAdminOwners(1, 100)
      .then(({ data }) => setOwners(data.owners))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchVehicles();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchVehicles();
  }, [page]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminVehicles(page, 10, search);
      setVehicles(data.vehicles);
      setTotalPages(data.pagination.totalPages || 1);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    if (!imageFile) {
      setFormError("Please attach a vehicle image.");
      setSaving(false);
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "seats" && form.category !== "PASSENGER") return;
        if (key === "loadCapacity" && form.category !== "GOODS") return;
        fd.append(key, value);
      });
      fd.append("image", imageFile);

      await createAdminVehicle(fd);
      setCreateOpen(false);
      setForm(emptyForm);
      setImageFile(null);
      fetchVehicles();
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
      const { data } = await getAdminVehicleById(id);
      setSelected(data);
      setEditForm({
        vehicleName: data.vehicleName,
        brand: data.brand,
        model: data.model,
        city: data.city,
        pricePerKm: data.pricePerKm,
        minimumFare: data.minimumFare,
      });
      setEditImageFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([key, value]) => fd.append(key, value));
      if (editImageFile) {
        fd.append("image", editImageFile);
      }

      await updateAdminVehicle(selected.id, fd);
      await openDetail(selected.id);
      setEditMode(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert("Unable to update vehicle.");
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Remove ${selected.vehicleName} from listings?`))
      return;
    try {
      await deleteAdminVehicle(selected.id);
      await openDetail(selected.id);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert("Unable to remove vehicle.");
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateAdminVehicle(selected.id);
      await openDetail(selected.id);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert("Unable to reactivate vehicle.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Vehicles</h1>
          <p className="mt-1 text-slate-500">Manage the vehicle fleet.</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>
          Add Vehicle
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
          placeholder="Search by name, brand, model, or city..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card className="mt-6" padding="p-0">
        {loading ? (
          <Loader label="Loading vehicles..." />
        ) : error ? (
          <p className="p-6 text-center text-red-600">{error}</p>
        ) : vehicles.length === 0 ? (
          <p className="p-6 text-center text-slate-400">
            {search ? "No vehicles match your search." : "No vehicles yet."}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">City</th>
                <th className="px-6 py-3 font-medium">Price/km</th>
                <th className="px-6 py-3 font-medium">Bookings</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => openDetail(v.id)}
                  className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-slate-50"
                >
                  <td className="px-6 py-3.5 font-medium text-slate-800">
                    {v.vehicleName}{" "}
                    <span className="text-slate-400">
                      ({v.brand} {v.model})
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {v.owner?.name}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{v.city}</td>
                  <td className="px-6 py-3.5 text-slate-500">
                    ₹{v.pricePerKm}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {v._count?.bookings ?? 0}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge status={v.isAvailable ? "ACTIVE" : "INACTIVE"}>
                      {v.isAvailable ? "Available" : "Unavailable"}
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
        title="Add Vehicle"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Owner"
            required
            options={[
              { value: "", label: "Select owner..." },
              ...owners.map((o) => ({
                value: o.id,
                label: `${o.name} (${o.phone})`,
              })),
            ]}
            value={form.ownerId}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
          />
          <Input
            label="Vehicle Name"
            required
            value={form.vehicleName}
            onChange={(e) => setForm({ ...form, vehicleName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Brand"
              required
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
            <Input
              label="Model"
              required
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>
          <Select
            label="Category"
            options={categoryOptions}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          {form.category === "PASSENGER" ? (
            <Input
              label="Seats"
              type="number"
              required
              value={form.seats}
              onChange={(e) => setForm({ ...form, seats: e.target.value })}
            />
          ) : (
            <Input
              label="Load Capacity"
              required
              value={form.loadCapacity}
              onChange={(e) =>
                setForm({ ...form, loadCapacity: e.target.value })
              }
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Fuel Type"
              options={fuelOptions}
              value={form.fuelType}
              onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
            />
            <Select
              label="Transmission"
              options={transmissionOptions}
              value={form.transmission}
              onChange={(e) =>
                setForm({ ...form, transmission: e.target.value })
              }
            />
          </div>
          <Input
            label="City"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Vehicle Image
          </label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price per KM"
              type="number"
              required
              value={form.pricePerKm}
              onChange={(e) => setForm({ ...form, pricePerKm: e.target.value })}
            />
            <Input
              label="Minimum Fare"
              type="number"
              required
              value={form.minimumFare}
              onChange={(e) =>
                setForm({ ...form, minimumFare: e.target.value })
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
              Create Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Vehicle Details
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
            ) : editMode ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Vehicle Name"
                  value={editForm.vehicleName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, vehicleName: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Brand"
                    value={editForm.brand}
                    onChange={(e) =>
                      setEditForm({ ...editForm, brand: e.target.value })
                    }
                  />
                  <Input
                    label="Model"
                    value={editForm.model}
                    onChange={(e) =>
                      setEditForm({ ...editForm, model: e.target.value })
                    }
                  />
                </div>
                <Input
                  label="City"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm({ ...editForm, city: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price per KM"
                    type="number"
                    value={editForm.pricePerKm}
                    onChange={(e) =>
                      setEditForm({ ...editForm, pricePerKm: e.target.value })
                    }
                  />
                  <Input
                    label="Minimum Fare"
                    type="number"
                    value={editForm.minimumFare}
                    onChange={(e) =>
                      setEditForm({ ...editForm, minimumFare: e.target.value })
                    }
                  />
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Replace Image{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImageFile(e.target.files[0])}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
                  />
                  {selected.image && !editImageFile && (
                    <p className="mt-2 text-xs text-slate-400">
                      Current image will be kept unless you choose a new one.
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {selected.vehicleName}
                    </h3>
                    {selected.image && (
                      <img
                        src={selected.image}
                        alt={selected.vehicleName}
                        className="mt-4 h-40 w-full rounded-xl object-cover"
                      />
                    )}
                    <p className="text-sm text-slate-500">
                      {selected.brand} {selected.model} • {selected.city}
                    </p>
                  </div>
                  <Badge status={selected.isAvailable ? "ACTIVE" : "INACTIVE"}>
                    {selected.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-slate-800">
                      ₹{selected.pricePerKm}
                    </p>
                    <p className="text-xs text-slate-500">Price / km</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-slate-800">
                      {selected.bookings?.length ?? 0}
                    </p>
                    <p className="text-xs text-slate-500">Total Bookings</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Owner:{" "}
                  <span className="font-medium text-slate-700">
                    {selected.owner?.name}
                  </span>{" "}
                  ({selected.owner?.phone})
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  {selected.isAvailable ? (
                    <Button variant="danger" onClick={handleRemove}>
                      Remove Listing
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={handleReactivate}>
                      Mark Available
                    </Button>
                  )}
                  <Button onClick={() => setEditMode(true)}>Edit</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;
