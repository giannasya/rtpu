import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function HasilQuizList() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:3000/api/students/quiz", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data.students);
      } catch (err) {
        alert("Gagal load data siswa");
        navigate("/dashboard");
      }
    };
    fetchStudents();
  }, [navigate]);

  return (
  <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
    <br></br>
    <br></br>
    <h1 className="text-2xl font-bold mb-4 text-center text-blue-800">
      Rekapitulasi Hasil Quiz Siswa
    </h1>
    <p className="text-center text-gray-600 mb-6">
      Klik tombol <b>Lihat Hasil</b> untuk melihat detail nilai masing-masing siswa.
    </p>
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-2">No</th>
          <th className="border p-2">Nama Siswa</th>
          <th className="border p-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s, idx) => (
          <tr key={s.id}>
            <td className="border p-2 text-center">{idx + 1}</td>
            <td className="border p-2">{s.name}</td>
            <td className="border p-2 text-center">
              <Link
                to={`/hasilquiz/${s.id}`}
                className="bg-blue-600 text-white py-1 px-3 rounded"
              >
                Lihat Hasil
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}
