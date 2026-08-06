import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";
import AddVehicle from "../pages/AddVehicle";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminOwners from "../pages/admin/AdminOwners";
import AdminDrivers from "../pages/admin/AdminDrivers";
import AdminVehicles from "../pages/admin/AdminVehicles";
import AdminBookings from "../pages/admin/AdminBookings";
import AdminPayments from "../pages/admin/AdminPayments";
import Login from "../pages/Login";
import Booking from "../pages/Booking";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import PublicLayout from "../layouts/PublicLayout";
import DriverDashboard from "../pages/driver/DriverDashboard";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/addVehicle" element={<AddVehicle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book/:vehicleId" element={<Booking />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="owners" element={<AdminOwners />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver-dashboard"
          element={
            <ProtectedRoute allowedRoles={["DRIVER"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/book/:vehicleId" element={<Booking />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
