import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";

export default function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Fetch quizzes from backend
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user) {
          setError("Silakan login untuk mengakses daftar kuis.");
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:3000/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Quizzes fetched:", response.data);
        const quizData = response.data.quizzes || response.data;
        if (!Array.isArray(quizData)) {
          throw new Error("Data kuis tidak valid.");
        }
        setQuizzes(quizData);
      } catch (err) {
        console.error("Error fetching quizzes:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Gagal memuat daftar kuis dari server.");
      }
    };

    fetchQuizzes();
  }, [navigate, user]);

  const handleQuizClick = (id) => {
    if (!id) {
      console.error("Invalid quiz ID:", id);
      setError("ID kuis tidak valid.");
      return;
    }
    navigate(`/quiz/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="relative bg-gradient-to-r from-[#071952] to-[#088395] text-white py-20 px-6 flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            Daftar Kuis
          </h1>
          <p className="text-lg md:text-xl opacity-90 animate-slide-up">
            Pilih kuis di bawah ini untuk memulai.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {quizzes.length === 0 && !error ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">
              Belum ada kuis yang tersedia. Tambahkan kuis baru di dashboard!
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-6 py-2 bg-[#088395] text-white rounded-lg hover:bg-[#071952] transition"
            >
              Ke Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                <h3 className="text-xl font-semibold text-[#071952] mb-2">
                  {quiz.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  {quiz.question_count || 0} Pertanyaan | Sisa Percobaan: {user.role === "student" ? (quiz.remaining_retries || 0) : (quiz.retry_limit || 0)}
                </p>
                {quiz.highest_score !== null && user.role === "student" && (
                  <p className="text-gray-600 mb-4">
                    Skor Tertinggi: {quiz.highest_score}
                  </p>
                )}
                <button
                  onClick={() => handleQuizClick(quiz.id)}
                  className="w-full bg-[#088395] text-white px-4 py-2 rounded-lg hover:bg-[#071952] transition"
                >
                  Mulai Kuis
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        .animate-slide-up {
          animation: slideUp 1s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}