import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // Used both by real login AND by "first booking/vehicle" flows that get a token back.
  const setSession = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (phone, secretKey) => {
    const { data } = await api.post("/auth/login", { phone, secretKey });
    setSession(data.token, data.user);
    return data.user;
  };

  const requestOtp = async (phone) => {
    const { data } = await api.post("/auth/send-otp", { phone });
    return data; // { message, devOtp }
  };

  const confirmOtp = async (phone, otp) => {
    const { data } = await api.post("/auth/verify-otp", { phone, otp });
    if (data.token) setSession(data.token, data.user);
    return data; // may instead be { requiresSecretKey: true, phone }
  };

  const confirmAdminKey = async (phone, secretKey) => {
    const { data } = await api.post("/auth/verify-admin-key", {
      phone,
      secretKey,
    });
    setSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setSession,
        requestOtp,
        confirmOtp,
        confirmAdminKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
