import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Booking from "./pages/Booking/Booking";
import Tracking from "./pages/Tracking/Tracking";
import DriverDashboard from "./pages/DriverDashboard/DriverDashboard";
import AddVehicle from "./pages/AddVehicle/AddVehicle";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
