import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profilePath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "OWNER"
        ? "/owner"
        : user?.role === "DRIVER"
          ? "/driver-dashboard"
          : "/customer";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          G9 travels Co{" "}
        </Link>

        <div className="hidden gap-8 md:flex">
          <Link to="/">Home</Link>
          <Link to="/tracking/demo">Track Booking</Link>
          <Link to="/driver">Become Driver</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <Link
              to={profilePath}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Dashboard
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="rounded-lg bg-slate-100 px-5 py-2 font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
