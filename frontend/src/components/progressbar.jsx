// src/components/ProgressBar.jsx
import React from "react";

const ProgressBar = ({ percent }) => (
  <div className="w-full bg-gray-200 rounded h-3 mb-4">
    <div
      className="bg-green-600 h-3 rounded transition-all duration-300"
      style={{ width: `${percent}%` }}
    />
  </div>
);

export default ProgressBar;
