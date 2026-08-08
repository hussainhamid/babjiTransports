import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const profilePath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "OWNER"
        ? "/owner"
        : user?.role === "DRIVER"
          ? "/driver-dashboard"
          : "/customer";

  const links = [
    { to: "/", label: "Home" },
    { to: "/tracking", label: "Track Booking" },
    { to: "/driver", label: "Become Driver" },
    { to: "/contact", label: "Contact" },
  ];

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold text-blue-600"
          onClick={() => setMobileOpen(false)}
        >
          G9 Travels Co{" "}
        </Link>

        <div className="hidden gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={profilePath}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-5 py-2 font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4">
          <div className="flex flex-col gap-1 pt-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-2 border-t border-slate-100 pt-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to={profilePath}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-blue-50 px-4 py-2.5 text-center text-sm font-semibold text-blue-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
