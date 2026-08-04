import { useEffect, useState } from "react";
import { Users, UserCog, Car, ClipboardList, CreditCard } from "lucide-react";
import { getAdminDashboard } from "../../services/adminServices";
import { StatCard } from "../../components/common/Card";
import Loader from "../../components/common/Loader";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminDashboard();
      setStats(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader label="Loading dashboard..." />;

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
      <p className="mt-1 text-slate-500">Overview of the whole platform.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          label="Customers"
          value={stats.totalCustomers}
          tone="blue"
        />
        <StatCard
          icon={UserCog}
          label="Owners"
          value={stats.totalOwners}
          tone="purple"
        />
        <StatCard
          icon={UserCog}
          label="Drivers"
          value={stats.totalDrivers}
          tone="green"
        />
        <StatCard
          icon={Car}
          label="Vehicles"
          value={stats.totalVehicles}
          tone="orange"
        />
        <StatCard
          icon={ClipboardList}
          label="Bookings"
          value={stats.totalBookings}
          tone="blue"
        />
        <StatCard
          icon={CreditCard}
          label="Payments"
          value={stats.totalPayments}
          tone="green"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
