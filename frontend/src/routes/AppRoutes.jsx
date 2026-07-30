import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";
import AddVehicle from "../pages/AddVehicle";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/addVehicle" element={<AddVehicle />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
