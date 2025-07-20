import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import axios from "axios";
import pnj from "../assets/pnj.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [kelasOpen, setKelasOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]); // Inisialisasi sebagai array kosong
  const [availableCourses, setAvailableCourses] = useState([]);

  const checkUser = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();

    const fetchEnrolledCourses = async () => {
      if (!isLoggedIn) {
        setEnrolledCourses([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/enrolled-courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 10000,
        });
        const courses = res.data.courses || res.data || []; // Ambil courses atau fallback ke array kosong
        setEnrolledCourses(Array.isArray(courses) ? courses : []);
        console.log("Enrolled courses fetched:", courses);
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error.response?.data || error.message);
        setEnrolledCourses([]);
      }
    };

    const fetchAvailableCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/courses/all", {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Cache-Control": "no-cache",
          },
        });
        console.log("Courses fetched:", response.data.courses);
        setAvailableCourses(response.data.courses || []); // Pastikan array
      } catch (err) {
        console.error("Failed to fetch available courses:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
      }
    };

    fetchEnrolledCourses();
    fetchAvailableCourses();

    const handleStorageChange = () => {
      checkUser();
      fetchEnrolledCourses();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-updated", handleStorageChange);
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setEnrolledCourses([]);
    setAvailableCourses([]);
    navigate("/login");
    window.dispatchEvent(new Event("user-updated"));
  };

  const handleHomeClick = () => {
    if (isLoggedIn && user) {
      if (user.role === "student") {
        navigate("/student");
      } else if (user.role === "teacher") {
        navigate("/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
    setOpen(false);
    setKelasOpen(false);
  };

  const isLandingPortal = location.pathname === "/";

  const isCourseEnrolled = (courseId) => {
    return Array.isArray(enrolledCourses) && enrolledCourses.some((enrolled) => enrolled.id === courseId);
  };

  return (
    <nav className="bg-white fixed top-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={pnj} alt="Logo" className="h-10" />
          <span className="text-xl font-bold text-[#071952]">RTPU PNJ</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-base font-medium text-[#071952]">
          <button
            onClick={handleHomeClick}
            className="hover:text-[#088395] transition duration-200"
          >
            Home
          </button>
          <div className="relative">
            <button
              onClick={() => setKelasOpen(!kelasOpen)}
              className="flex items-center hover:text-[#088395] transition duration-200"
            >
              Course
              <ChevronDown
                size={20}
                className={`ml-1 transform transition-transform duration-200 ${
                  kelasOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {kelasOpen && (
              <div className="absolute top-full left-0 mt-2 w-60 bg-white shadow-lg rounded-lg py-2 z-50 max-h-64 overflow-auto">
                {availableCourses.length > 0 ? (
                  availableCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setKelasOpen(false);
                        navigate(`/course/${course.id}`);
                      }}
                      className="block w-full text-left px-4 py-2 text-[#071952] hover:bg-[#088395] hover:text-white transition duration-200"
                    >
                      {course.title}
                      {isCourseEnrolled(course.id) && (
                        <span className="ml-2 text-xs text-green-500">(Enrolled)</span>
                      )}
                    </button>
                  ))
                ) : (
                  <span className="block px-4 py-2 text-sm text-gray-500">
                    Tidak ada kelas tersedia
                  </span>
                )}
              </div>
            )}
          </div>
          {isLoggedIn && user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="hover:text-[#088395] transition duration-200"
            >
            </button>
          )}
          <button
            onClick={() => navigate("/about")}
            className="hover:text-[#088395] transition duration-200"
          >
            About
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="hover:text-[#088395] transition duration-200"
          >
            Contact
          </button>
        </div>

        <div className="hidden md:block">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/profile")}
                className="bg-[#071952] hover:bg-[#314c75] text-white px-5 py-2 rounded-lg shadow transition"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-[#071952] hover:text-red-600 font-medium transition"
              >
                Logout
              </button>
            </div>
          ) : (
            !isLandingPortal && (
              <button
                onClick={() => navigate("/login")}
                className="bg-[#088395] hover:bg-[#056776] text-white px-5 py-2 rounded-lg shadow transition"
              >
                Login
              </button>
            )
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="text-[#071952] focus:outline-none"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white shadow-md px-6 py-4 space-y-3 text-[#071952] font-medium">
          <button
            onClick={handleHomeClick}
            className="block hover:text-[#088395] transition duration-200"
          >
            Home
          </button>
          <div>
            <button
              onClick={() => setKelasOpen(!kelasOpen)}
              className="flex items-center hover:text-[#088395] transition duration-200"
            >
              Kelas
              <ChevronDown
                size={20}
                className={`ml-1 transform transition-transform duration-200 ${
                  kelasOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {kelasOpen && (
              <div className="pl-4 space-y-2 mt-2">
                {availableCourses.length > 0 ? (
                  availableCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setOpen(false);
                        setKelasOpen(false);
                        navigate(`/course/${course.id}`);
                      }}
                      className="block w-full text-left hover:text-[#088395] transition duration-200"
                    >
                      {course.title}
                      {isCourseEnrolled(course.id) && (
                        <span className="ml-2 text-xs text-green-500">(Enrolled)</span>
                      )}
                    </button>
                  ))
                ) : (
                  <span className="block text-sm text-gray-500">
                    Tidak ada kelas tersedia
                  </span>
                )}
              </div>
            )}
          </div>
          {isLoggedIn && user?.role === "admin" && (
            <button
              onClick={() => {
                setOpen(false);
                navigate("/admin");
              }}
              className="block hover:text-[#088395] transition duration-200"
            >
              Admin Panel
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/about");
            }}
            className="block hover:text-[#088395] transition duration-200"
          >
            About
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate("/contact");
            }}
            className="block hover:text-[#088395] transition duration-200"
          >
            Contact
          </button>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="w-full bg-[#071952] hover:bg-[#314c75] text-white px-4 py-2 rounded-lg shadow transition"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="w-full text-left text-[#071952] hover:text-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            !isLandingPortal && (
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/login");
                }}
                className="w-full bg-[#088395] hover:bg-[#056776] text-white px-4 py-2 rounded-lg shadow transition"
              >
                Login
              </button>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;