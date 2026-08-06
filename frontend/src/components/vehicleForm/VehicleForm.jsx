import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { Upload, CarFront, Truck, IndianRupee } from "lucide-react";
import { addVehicle } from "../../services/vehicleServices";

const initialState = {
  category: "PASSENGER",
  brand: "",
  model: "",
  vehicleName: "",
  fuelType: "PETROL",
  transmission: "MANUAL",
  seats: "",
  loadCapacity: "",
  pricePerKm: "",
  minimumFare: "",
  city: "",
  image: null,
  ownerName: "",
  ownerPhone: "",
};

const VehicleForm = () => {
  const { user, setSession } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if ((key === "ownerName" || key === "ownerPhone") && user) return; // skip if already logged in
        data.append(key, value);
      });

      const { data: response } = await addVehicle(data);

      if (response.token) {
        setSession(response.token, {
          id: response.vehicle.ownerId,
          name: formData.ownerName,
          phone: formData.ownerPhone,
          role: "OWNER",
        });
      }

      alert("Vehicle added successfully!");
      setFormData(initialState);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Vehicle Details */}

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Vehicle Details</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-medium mb-2 block">Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="PASSENGER">Passenger</option>
              <option value="GOODS">Goods</option>
            </select>
          </div>

          <div>
            <label className="font-medium mb-2 block">Vehicle Name</label>

            <input
              className="w-full border rounded-xl p-3"
              type="text"
              name="vehicleName"
              value={formData.vehicleName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="font-medium mb-2 block">Brand</label>

            <input
              className="w-full border rounded-xl p-3"
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="font-medium mb-2 block">Model</label>

            <input
              className="w-full border rounded-xl p-3"
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="font-medium mb-2 block">Fuel Type</label>

            <select
              className="w-full border rounded-xl p-3"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
            >
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="font-medium mb-2 block">Transmission</label>

            <select
              className="w-full border rounded-xl p-3"
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
            >
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATIC">Automatic</option>
            </select>
          </div>

          {formData.category === "PASSENGER" ? (
            <div>
              <label className="font-medium mb-2 block">Seats</label>

              <input
                className="w-full border rounded-xl p-3"
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div>
              <label className="font-medium mb-2 block">Load Capacity</label>

              <input
                className="w-full border rounded-xl p-3"
                type="text"
                name="loadCapacity"
                value={formData.loadCapacity}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pricing */}

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Pricing</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <input
            className="border rounded-xl p-3"
            placeholder="Price Per KM"
            type="number"
            name="pricePerKm"
            value={formData.pricePerKm}
            onChange={handleChange}
          />

          <input
            className="border rounded-xl p-3"
            placeholder="Minimum Fare"
            type="number"
            name="minimumFare"
            value={formData.minimumFare}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Location */}

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Location</h2>

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="City"
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />
      </div>

      {/* Image Upload */}

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Vehicle Image</h2>

        <label
          htmlFor="image"
          className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center cursor-pointer hover:border-blue-600 transition"
        >
          <Upload size={40} className="text-blue-600" />

          <p className="mt-4 font-semibold">Click to upload vehicle image</p>

          <p className="text-sm text-gray-500">JPG, PNG up to 5 MB</p>

          <input
            id="image"
            hidden
            type="file"
            accept="image/*"
            name="image"
            onChange={handleChange}
          />
        </label>

        {formData.image && (
          <img
            src={URL.createObjectURL(formData.image)}
            alt="Preview"
            className="mt-6 rounded-xl h-72 w-full object-cover"
          />
        )}
      </div>

      {/* Owner */}
      {!user && (
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Owner Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <input
              className="border rounded-xl p-3"
              placeholder="Owner Name"
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Phone Number"
              type="tel"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      <button
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 text-lg font-semibold transition"
      >
        {loading ? "Uploading..." : "Add Vehicle"}
      </button>
    </form>
  );
};

export default VehicleForm;
