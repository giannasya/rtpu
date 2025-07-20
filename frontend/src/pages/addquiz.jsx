import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddQuiz({ onCancel }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [retryLimit, setRetryLimit] = useState(3);
  const [timeLimit, setTimeLimit] = useState(10);
  const [questions, setQuestions] = useState([
    { text: "", choices: ["", ""], correctIndex: 0 },
  ]);
  const [error, setError] = useState("");

  /* ---------- Helpers ---------- */
  const handleQuestionText = (idx, value) => {
    const copy = [...questions];
    copy[idx].text = value;
    setQuestions(copy);
  };

  const handleChoiceChange = (qIdx, cIdx, value) => {
    const copy = [...questions];
    copy[qIdx].choices[cIdx] = value;
    setQuestions(copy);
  };

  const handleCorrectIndex = (qIdx, index) => {
    const copy = [...questions];
    copy[qIdx].correctIndex = index;
    setQuestions(copy);
  };

  const addChoice = (qIdx) => {
    const copy = [...questions];
    copy[qIdx].choices.push("");
    setQuestions(copy);
  };

  const removeChoice = (qIdx, cIdx) => {
    const copy = [...questions];
    if (copy[qIdx].choices.length > 2) {
      copy[qIdx].choices.splice(cIdx, 1);
      if (copy[qIdx].correctIndex >= copy[qIdx].choices.length) {
        copy[qIdx].correctIndex = 0;
      }
      setQuestions(copy);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", choices: ["", ""], correctIndex: 0 },
    ]);
  };

  const removeQuestion = (qIdx) => {
    if (questions.length > 1) {
      const copy = [...questions];
      copy.splice(qIdx, 1);
      setQuestions(copy);
    }
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Judul quiz harus diisi.");
    if (retryLimit < 1 || retryLimit > 3) return setError("Retry limit 1-3.");
    if (timeLimit < 1) return setError("Time limit minimal 1 menit.");

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) return setError(`Pertanyaan #${i + 1} kosong.`);
      if (questions[i].choices.some((c) => !c.trim())) return setError(`Pilihan kosong di pertanyaan #${i + 1}.`);
    }

    const token = localStorage.getItem("token");
    if (!token) return setError("Silahkan login terlebih dahulu.");

    try {
      await axios.post("http://localhost:3000/api/quizzes", {
        title,
        retryLimit,
        timeLimit,
        questions,
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan kuis.");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#F5FAFB] flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white p-8 rounded-xl shadow space-y-6">
        <h1 className="text-2xl font-bold text-[#071952]">Tambah Quiz</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

        {/* Judul */}
        <div>
          <label className="block mb-1 font-medium">Judul Quiz</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#088395]"
            placeholder="Contoh: Quiz Materi 1"
            required
          />
        </div>

        {/* Retry */}
        <div>
          <label className="block mb-1 font-medium">Batas Retry (Maksimal 3)</label>
          <input
            type="number"
            value={retryLimit}
            onChange={(e) => setRetryLimit(parseInt(e.target.value))}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#088395]"
            placeholder="Masukkan jumlah retry (1-3)"
            min="1"
            max="3"
            required
          />
        </div>

        {/* Time Limit */}
        <div>
          <label className="block mb-1 font-medium">Waktu Pengerjaan (menit)</label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            className="w-full border p-2 rounded"
            min="1"
            required
          />

        </div>

        {/* Pertanyaan */}
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="border rounded-lg p-4 bg-gray-50 relative">
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Hapus Soal"
                >
                  ×
                </button>
              )}
              <label className="block mb-1 font-medium">Soal #{qIdx + 1}</label>
              <textarea
                value={q.text}
                onChange={(e) => handleQuestionText(qIdx, e.target.value)}
                className="w-full border p-2 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#088395]"
                placeholder="Tulis pertanyaan di sini..."
                required
              />
              <div className="space-y-3">
                {q.choices.map((choice, cIdx) => (
                  <div key={cIdx} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={q.correctIndex === cIdx}
                      onChange={() => handleCorrectIndex(qIdx, cIdx)}
                      className="text-[#088395] focus:ring-[#088395]"
                    />
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => handleChoiceChange(qIdx, cIdx, e.target.value)}
                      className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#088395]"
                      placeholder={`Pilihan ${String.fromCharCode(65 + cIdx)}`}
                      required
                    />
                    {q.choices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(qIdx, cIdx)}
                        className="text-red-500 hover:text-red-700 ml-1"
                        title="Hapus pilihan"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addChoice(qIdx)}
                  className="text-sm text-[#088395] hover:underline"
                >
                  + Tambah Pilihan
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-2 rounded border-2 border-dashed border-[#088395] text-[#088395] hover:bg-[#E8F6F9]"
          >
            + Tambah Soal
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-[#088395] text-white rounded hover:bg-[#071952]"
          >
            Simpan Quiz
          </button>
        </div>
      </form>
    </div>
  );
}
