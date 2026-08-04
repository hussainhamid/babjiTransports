import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Car,
  ClipboardList,
  CreditCard,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/owners", label: "Owners", icon: UserCog },
  { to: "/admin/drivers", label: "Drivers", icon: UserCog },
  { to: "/admin/vehicles", label: "Vehicles", icon: Car },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
];

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
        <div className="flex h-20 items-center px-6">
          <span className="text-xl font-bold text-blue-600">
            G9 Travels Admin
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
