import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, CarFront, MapPinned, Clock3 } from "lucide-react";
import { getVehicles } from "../../services/vehicleServices";
import VehicleCard from "../../components/VehicleCard/VehicleCard";

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const navigate = useNavigate();

  // Reset and refetch page 1 whenever the search term changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchVehicles(1, search, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchVehicles = async (pageToLoad, searchTerm, replace) => {
    setLoadingMore(true);
    try {
      const { data } = await getVehicles(pageToLoad, 9, searchTerm);
      setVehicles((prev) =>
        replace ? data.vehicles : [...prev, ...data.vehicles],
      );
      setHasMore(data.pagination.hasMore);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // IntersectionObserver — loads the next page when the sentinel div scrolls into view
  const sentinelRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((p) => {
            const next = p + 1;
            fetchVehicles(next, search, false);
            return next;
          });
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, search],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero — noticeably smaller on mobile */}
      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 lg:py-14">
          <div className="flex justify-end mb-4 sm:mb-6">
            <button
              onClick={() => navigate("/addVehicle")}
              className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-100 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg transition"
            >
              <Plus size={16} />
              Add Vehicle
            </button>
          </div>

          <div className="max-w-3xl">
            <h1 className="mt-2 sm:mt-6 text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Book Your Perfect Ride
              <br />
              Anytime, Anywhere
            </h1>
            <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-blue-100">
              Find passenger cars and goods vehicles instantly at affordable
              prices.
            </p>

            <div className="relative mt-4 sm:mt-6 max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by vehicle name, brand, model, or city..."
                className="w-full rounded-xl bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none shadow-lg focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats — unchanged */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex items-center gap-4">
            <CarFront className="text-blue-600" size={32} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">{total}</h2>
              <p className="text-gray-500 text-sm">Vehicles Listed</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex items-center gap-4">
            <MapPinned className="text-green-600" size={32} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">50+</h2>
              <p className="text-gray-500 text-sm">Cities Covered</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex items-center gap-4">
            <Clock3 className="text-orange-500" size={32} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">24/7</h2>
              <p className="text-gray-500 text-sm">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold">
              Available Vehicles
            </h2>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
              Browse from our growing collection of vehicles.
            </p>
          </div>
          <span className="bg-blue-100 text-blue-700 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-sm sm:text-base font-semibold">
            {total} Vehicles
          </span>
        </div>

        {vehicles.length === 0 && !loadingMore ? (
          <div className="bg-white rounded-2xl shadow-md p-10 sm:p-16 text-center">
            <CarFront className="mx-auto text-gray-300" size={64} />
            <h2 className="text-xl sm:text-2xl font-bold mt-6">
              {search ? "No vehicles match your search" : "No Vehicles Yet"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              {search
                ? "Try a different search term."
                : "Be the first driver to list your vehicle."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-8 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            <div ref={sentinelRef} className="mt-8 flex justify-center">
              {loadingMore && (
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              )}
              {!hasMore && vehicles.length > 0 && (
                <p className="text-sm text-slate-400">
                  You've reached the end of the list.
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
