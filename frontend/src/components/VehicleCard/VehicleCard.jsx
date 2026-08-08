import {
  Fuel,
  MapPin,
  Users,
  Truck,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300">
      <div className="relative overflow-hidden">
        <img
          src={vehicle.image}
          alt={vehicle.vehicleName}
          className="h-28 sm:h-64 w-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-green-600 text-white flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm">
          <BadgeCheck size={12} className="sm:hidden" />
          <BadgeCheck size={16} className="hidden sm:block" />
          Available
        </div>
      </div>

      <div className="p-3 sm:p-6">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-2xl font-bold truncate">
              {vehicle.vehicleName}
            </h2>
            <p className="text-gray-500 text-xs sm:text-base truncate">
              {vehicle.brand} • {vehicle.model}
            </p>
          </div>
          <div className="text-right shrink-0">
            <h2 className="text-base sm:text-3xl font-bold text-blue-600">
              ₹{vehicle.pricePerKm}
            </h2>
            <p className="text-gray-500 text-[10px] sm:text-sm">per km</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-8">
          <div className="bg-slate-100 rounded-lg sm:rounded-xl p-1.5 sm:p-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{vehicle.city}</span>
          </div>
          <div className="bg-slate-100 rounded-lg sm:rounded-xl p-1.5 sm:p-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
            <Fuel size={14} className="shrink-0" />
            <span className="truncate">{vehicle.fuelType}</span>
          </div>

          {vehicle.category === "PASSENGER" ? (
            <div className="bg-slate-100 rounded-lg sm:rounded-xl p-1.5 sm:p-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
              <Users size={14} className="shrink-0" />
              <span className="truncate">{vehicle.seats} Seats</span>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-lg sm:rounded-xl p-1.5 sm:p-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
              <Truck size={14} className="shrink-0" />
              <span className="truncate">{vehicle.loadCapacity}</span>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg sm:rounded-xl p-1.5 sm:p-3 text-center">
            <p className="text-[10px] sm:text-sm text-gray-500">Min Fare</p>
            <p className="font-bold text-blue-600 text-xs sm:text-base">
              ₹{vehicle.minimumFare}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/book/${vehicle.id}`)}
          className="mt-3 sm:mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold flex items-center justify-center gap-1 sm:gap-2"
        >
          Book Vehicle
          <ArrowRight size={14} className="sm:hidden" />
          <ArrowRight size={18} className="hidden sm:block" />
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
