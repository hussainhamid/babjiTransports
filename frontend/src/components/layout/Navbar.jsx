import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Babji Transports
        </Link>

        <div className="hidden gap-8 md:flex">
          <Link to="/">Home</Link>

          <Link to="/tracking/demo">Track Booking</Link>

          <Link to="/driver">Become Driver</Link>

          <Link to="/contact">Contact</Link>
        </div>

        <button className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700">
          Login
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
