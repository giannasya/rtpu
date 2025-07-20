import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosconfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Initialize as null instead of hardcoded data

  const loadUser = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Load user data on mount
    loadUser();

    // Listen for user-updated events (from LoginPage.jsx and Navbar.jsx)
    const handleUserUpdate = () => {
      loadUser();
    };

    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, [navigate]);

  const updateUser = async (newData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) {
        throw new Error("No user or token found");
      }

      // Update backend
      const response = await axios.put(`/users/${user.id}`, newData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update localStorage and state
      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("user-updated"));
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update profile: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <AuthContext.Provider value={{ user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};