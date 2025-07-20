import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [maxRetries, setMaxRetries] = useState(3);
  const [remainingRetries, setRemainingRetries] = useState(3);
  const [showStartPopup, setShowStartPopup] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const [timeLimit, setTimeLimit] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id || id === "undefined") {
        setError("ID kuis tidak valid.");
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:3000/api/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const quiz = res.data;
        setQuizTitle(quiz.title);
        setMaxRetries(quiz.retry_limit);
        setRemainingRetries(quiz.remainingRetries || quiz.retry_limit);
        setTimeLimit(quiz.time_limit || 10);

        const mapped = quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`),
          correctAnswer: `${String.fromCharCode(65 + q.correctIndex)}. ${q.choices[q.correctIndex]}`,
          correctIndex: q.correctIndex,
        }));

        setQuestions(mapped);
      } catch (err) {
        setError(err.response?.data?.error || "Gagal mengambil kuis.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  useEffect(() => {
    if (!quizStarted || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleFinish();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quizStarted, timeLeft]);

  const startQuiz = () => {
    if (remainingRetries <= 0) {
      setError("Anda telah mencapai batas maksimum percobaan untuk kuis ini.");
      return;
    }

    setQuizStarted(true);
    setTimeLeft(timeLimit * 60);
    setShowStartPopup(false);
    setError(null);
  };

  const handleSelect = (option) => {
    const updated = [...userAnswers];
    updated[currentQuestion] = option;
    setUserAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleFinish();
    }
  };

  
  const handlePrevious = () => {
    if (currentQuestion - 1 < questions.length) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    clearInterval(timerRef.current);

    let totalScore = 0;
    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const correctLabel = String.fromCharCode(65 + q.correctIndex);
      if (selected?.startsWith(`${correctLabel}.`)) totalScore++;
    });

    setScore(totalScore);
    setShowResult(true);
    submitQuiz(totalScore);
  };

  const submitQuiz = async (finalScore) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const percentageScore = Math.round((finalScore / questions.length) * 100);
      
      await axios.post(
        "http://localhost:3000/api/quiz-results",
        {
          quizId: id,
          score: percentageScore,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRemainingRetries((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Gagal menyimpan hasil kuis:", err);
      setError("Anda telah mencapai batas maksimum percobaan untuk kuis ini !!!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const restartQuiz = () => {
    if (remainingRetries <= 0) return;
    
    setUserAnswers([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setShowStartPopup(true);
    setQuizStarted(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Memuat kuis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => navigate("/quizlist")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Kembali ke Daftar Kuis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {showStartPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Mulai Kuis</h2>
            <div className="space-y-3 mb-6">
              <p><span className="font-medium">Judul:</span> {quizTitle}</p>
              <p><span className="font-medium">Batas Waktu:</span> {timeLimit} menit</p>
              <p><span className="font-medium">Sisa Percobaan:</span> {remainingRetries} dari {maxRetries}</p>
            </div>

            {remainingRetries <= 0 && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
                Percobaan habis
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
                {error}
              </div>
            )}

            <div className="flex justify-between gap-4">
              <button
                onClick={() => navigate("/quizlist")}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
              >
                Batal
              </button>
              <button
                onClick={startQuiz}
                disabled={remainingRetries <= 0}
                className={`flex-1 py-2 rounded transition ${
                  remainingRetries <= 0
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Mulai Kuis
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto pt-32">
        {!showResult ? (
          quizStarted && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div className="flex justify-between items-center">
                <br></br>
                <br></br>
                <br></br>
                <h2 className="font-semibold text-lg">
                  Soal {currentQuestion + 1} dari {questions.length}
                </h2>
                <div className={`px-3 py-1 rounded-full flex items-center font-semibold ${
                  timeLeft <= 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-800'
                }`}>
                  <span className="mr-1">⏱</span>
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>

              <h3 className="text-xl font-medium">
                {questions[currentQuestion].text}
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestion].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    className={`p-3 text-left rounded-lg border transition ${
                      userAnswers[currentQuestion] === opt
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handlePrevious}
                  className="bg-[#071952] hover:bg-[#314c75] text-white px-6 py-2 rounded-lg transition"
                >
                  {currentQuestion - 1 === questions.length ? "Selesai" : "Sebelumnya"}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="bg-[#071952] hover:bg-[#314c75] text-white px-6 py-2 rounded-lg transition"
                >
                  {currentQuestion + 1 === questions.length ? "Selesai" : "Berikutnya"}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-center mb-4">Hasil Kuis</h2>
            <div className="text-center mb-6">
              <p className="text-lg">
                Skor: <span className="font-bold">{score}</span> dari{" "}
                <span>{questions.length}</span> (
                {((score / questions.length) * 100).toFixed(2)}%)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Sisa percobaan: {remainingRetries} dari {maxRetries}
              </p>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isCorrect =
                  userAnswers[idx]?.startsWith(
                    String.fromCharCode(65 + q.correctIndex)
                  );
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      isCorrect ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <p className="font-medium">
                      {idx + 1}. {q.text}
                    </p>
                    <p className={`text-sm mt-1 ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}>
                      Jawaban kamu:{" "}
                      <strong>{userAnswers[idx] || "Tidak dijawab"}</strong>{" "}
                      {isCorrect ? "✅" : "❌"}
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      Jawaban benar: {q.correctAnswer}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={restartQuiz}
                disabled={remainingRetries <= 0 || isSubmitting}
                className={`px-6 py-2 rounded-lg transition ${
                  remainingRetries <= 0 || isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {isSubmitting ? "Menyimpan..." : "Coba Lagi"}
              </button>
              <button
                onClick={() => navigate("/quizlist")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Kembali
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;