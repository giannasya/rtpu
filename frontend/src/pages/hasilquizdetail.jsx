import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function HasilQuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:3000/api/students/${id}/results`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data.results);
      } catch (err) {
        setError("Gagal load hasil kuis");
      }
    };
    fetchResults();
  }, [id]);

  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
    <br></br>
    <br></br>
     <center> <h1 className="text-2xl font-bold mb-4">Hasil Kuis</h1></center>
      {results.length === 0 ? (
        <p>Belum ada hasil kuis.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">No</th>
              <th className="border p-2">Judul Kuis</th>
              <th className="border p-2">Nilai</th>
              <th className="border p-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={idx}>
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">{r.title}</td>
                <td className="border p-2 text-center">{r.score}%</td>
                <td className="border p-2 text-center">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        onClick={() => navigate("/hasilquiz")}
        className="mt-4 bg-gray-600 text-white py-2 px-4 rounded"
      >
        Kembali
      </button>
    </div>
  );
}
