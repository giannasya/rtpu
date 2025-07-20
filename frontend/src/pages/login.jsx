import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../utils/axiosconfig";
import pnj from "../assets/pnj.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.role) {
          throw new Error("Invalid user data");
        }
        console.log("User found in localStorage on mount:", user);
        if (user.role === "student") {
          navigate("/student");
        } else if (user.role === "teacher") {
          navigate("/dashboard");
        } else if (user.role === "admin") {
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Data pengguna tidak valid. Silakan login kembali.");
        navigate("/login");
      }
    } else {
      console.log("No token found in localStorage on mount");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Sending login request:", { email });
      const response = await axios.post("/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);
      if (!response.data.token || !response.data.user?.role) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      console.log("Token saved to localStorage:", response.data.token);
      console.log("User saved to localStorage:", response.data.user);

      setTimeout(() => {
        console.log("Session expired, clearing localStorage");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("user-updated"));
        toast.error("Sesi telah berakhir. Silakan login kembali.");
        navigate("/login");
      }, 3600 * 1000);

      window.dispatchEvent(new Event("user-updated"));

      if (response.data.user.role === "student") {
        navigate("/student");
      } else if (response.data.user.role === "teacher") {
        navigate("/dashboard");
      } else if (response.data.user.role === "admin") {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response?.data?.message || "Gagal login. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToastContainer />
      <main className="flex-grow flex justify-center items-center">
        <div className="w-full max-w-sm border border-gray-200 p-6 rounded-md shadow">
          <h2 className="text-lg font-medium mb-4">Sign In</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 text-sm"
            >
              Sign In
            </button>
          </form>

          <div className="mt-4 space-y-2 text-sm text-center">
            <a href="#" className="text-blue-700 hover:underline">
              Forgot password?
            </a>
            <div>
              <a href="/register" className="text-blue-700 hover:underline">
                Create Account Student
              </a>
            </div>
            <div>
              <a href="/register" className="text-blue-700 hover:underline">
                Create Account Teacher
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}