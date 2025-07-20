import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import pnj from "../assets/pnj.png";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    agree: true,
    role: 'student',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'agree') {
      setFormData({ ...formData, agree: checked });
    } else if (type === 'radio') {
      setFormData({ ...formData, role: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agree) {
      alert('You must accept the terms and conditions.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
      
      // Simpan data user di localStorage
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
      localStorage.setItem('user', JSON.stringify(data.user));
      // Navigasi berdasarkan role
      if (data.user.role === 'student') {
        navigate('/student');
      } else if (data.user.role === 'teacher') {
        navigate('/dashboard');
      }      
        navigate('/login');
      } else {
        alert('Registration failed: ' + data.message);
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded shadow-md w-full max-w-md border"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <label className="block mb-2 text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />

        <label className="block mb-2 text-sm font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />

        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            className="mr-2 mt-1"
          />
          <div className="text-sm">
            <label>
              Accept & Agree <br />
              <span className="text-gray-500">
                Before you create an account, you can read our
              </span>{' '}
              <a href="#" className="text-blue-600 underline">Terms & Condition</a>
            </label>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <label className="flex items-center text-sm">
            <input
              type="radio"
              name="role"
              value="student"
              checked={formData.role === 'student'}
              onChange={handleChange}
              className="mr-2"
            />
            As Student
          </label>

          <label className="flex items-center text-sm">
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={formData.role === 'teacher'}
              onChange={handleChange}
              className="mr-2"
            />
            As Teacher
          </label>

          <label className="flex items-center text-sm">
    <input
      type="radio"
      name="role"
      value="admin"
      checked={formData.role === 'admin'}
      onChange={handleChange}
      className="mr-2"
    />
    As Admin
  </label>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
        >
          Register
        </button>
      </form>
    </div>
  );
}
