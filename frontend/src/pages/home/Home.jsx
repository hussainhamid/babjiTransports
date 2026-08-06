import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, CarFront, MapPinned, Clock3 } from "lucide-react";
import { getVehicles } from "../../services/vehicleServices";
import VehicleCard from "../../components/VehicleCard/VehicleCard";
import { Link } from "react-router-dom";

const Home = () => {
  const [vehicles, setVehicles] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data } = await getVehicles();
      setVehicles(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}

      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-14">
          <div className="max-w-3xl">
            <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">
              Book Your Perfect Ride
              <br />
              Anytime, Anywhere
            </h1>

            <p className="mt-4 text-lg text-blue-100">
              Find passenger cars and goods vehicles instantly at affordable
              prices.
            </p>

            {/* Keep your search bar below */}
          </div>
        </div>
      </section>

      {/* Stats */}

      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
            <CarFront className="text-blue-600" size={40} />

            <div>
              <h2 className="text-3xl font-bold">{vehicles.length}</h2>

              <p className="text-gray-500">Vehicles Listed</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
            <MapPinned className="text-green-600" size={40} />

            <div>
              <h2 className="text-3xl font-bold">50+</h2>

              <p className="text-gray-500">Cities Covered</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
            <Clock3 className="text-orange-500" size={40} />

            <div>
              <h2 className="text-3xl font-bold">24/7</h2>

              <p className="text-gray-500">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles */}

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold">Available Vehicles</h2>

            <p className="text-gray-500 mt-2">
              Browse from our growing collection of vehicles.
            </p>
          </div>

          <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-semibold">
            {vehicles.length} Vehicles
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-16 text-center">
            <CarFront className="mx-auto text-gray-300" size={80} />

            <h2 className="text-2xl font-bold mt-6">No Vehicles Yet</h2>

            <p className="text-gray-500 mt-2">
              Be the first driver to list your vehicle.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>
      <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-14">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/addVehicle")}
            className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-100 px-5 py-3 rounded-xl font-semibold shadow-lg transition"
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
