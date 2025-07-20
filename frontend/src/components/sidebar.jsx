import React, { useState } from "react";
import { FaClipboardList, FaBars } from "react-icons/fa";
import { MdSubscriptions } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const baseNavItems = [
    { name: "Quiz", icon: <FaClipboardList />, path: "/quizlist" },
    { name: "Pricing", icon: <MdSubscriptions />, path: "/pricing" },
  ];

  const teacherNavItems = [
    // { name: "Course", icon: <MdSubscriptions />, path: "/admin" },
    { name: "Hasil Quiz", icon: <FaClipboardList />, path: "/hasilquiz" },
  ];

  // Combine navItems based on role
  const navItems = user.role === "teacher"
    ? [...baseNavItems, ...teacherNavItems]
    : baseNavItems;

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-white h-screen shadow-lg fixed top-16 left-0 transition-all duration-300 z-30`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-blue-800">Learning</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-blue-600"
        >
          <FaBars />
        </button>
      </div>

      <nav className="mt-4 space-y-2 px-2">
        {navItems.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-all ${
              location.pathname === item.path
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
