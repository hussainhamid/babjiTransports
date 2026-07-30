import {
  Fuel,
  MapPin,
  Users,
  Truck,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";

const VehicleCard = ({ vehicle }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300">
      <div className="relative overflow-hidden">
        <img
          src={vehicle.image}
          alt={vehicle.vehicleName}
          className="h-64 w-full object-cover group-hover:scale-105 transition duration-500"
        />

        <div className="absolute top-4 left-4 bg-green-600 text-white flex items-center gap-1 px-3 py-1 rounded-full text-sm">
          <BadgeCheck size={16} />
          Available
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{vehicle.vehicleName}</h2>

            <p className="text-gray-500">
              {vehicle.brand} • {vehicle.model}
            </p>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-bold text-blue-600">
              ₹{vehicle.pricePerKm}
            </h2>

            <p className="text-gray-500 text-sm">per km</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-slate-100 rounded-xl p-3 flex items-center gap-2">
            <MapPin size={18} />

            <span>{vehicle.city}</span>
          </div>

          <div className="bg-slate-100 rounded-xl p-3 flex items-center gap-2">
            <Fuel size={18} />

            <span>{vehicle.fuelType}</span>
          </div>

          {vehicle.category === "PASSENGER" ? (
            <div className="bg-slate-100 rounded-xl p-3 flex items-center gap-2">
              <Users size={18} />

              <span>{vehicle.seats} Seats</span>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-xl p-3 flex items-center gap-2">
              <Truck size={18} />

              <span>{vehicle.loadCapacity}</span>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-sm text-gray-500">Minimum Fare</p>

            <p className="font-bold text-blue-600">₹{vehicle.minimumFare}</p>
          </div>
        </div>

        <button className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          Book Vehicle
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
