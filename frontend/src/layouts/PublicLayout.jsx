import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

export default PublicLayout;
