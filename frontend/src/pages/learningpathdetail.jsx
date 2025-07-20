import React from "react";
import { useParams, useNavigate } from "react-router-dom";

// Dummy data untuk learning path dan kursus terkait
const learningPathData = {
  "1": {
    title: "Rekayasa Mesin Dasar",
    description:
      "Pelajari langkah awal menjadi ahli teknik mesin. Cocok untuk pemula yang ingin memahami mesin industri.",
    image: "https://source.unsplash.com/800x400/?engineering,machine",
    courses: [
      { id: 101, title: "Dasar Teknik Mesin" },
      { id: 102, title: "Penggunaan CAD 2D" },
      { id: 103, title: "Simulasi dan Pemodelan Mesin" },
    ],
  },
  "2": {
    title: "Produk Unggulan untuk Industri",
    description:
      "Bangun produk inovatif dari ide hingga siap pasar. Cocok untuk mahasiswa, UMKM, dan startup.",
    image: "https://source.unsplash.com/800x400/?product,development",
    courses: [
      { id: 201, title: "Design Thinking" },
      { id: 202, title: "Prototype Produk" },
      { id: 203, title: "Validasi Pasar" },
    ],
  },
  "3": {
    title: "Konsultasi UMKM Efektif",
    description:
      "Jadilah konsultan andal untuk UMKM. Pelajari teknik pendampingan dan evaluasi bisnis.",
    image: "https://source.unsplash.com/800x400/?consulting,teamwork",
    courses: [
      { id: 301, title: "Dasar Pendampingan UMKM" },
      { id: 302, title: "Studi Kasus Konsultasi" },
    ],
  },
};

export default function LearningPathDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = learningPathData[id];

  if (!data) {
    return (
      <div className="text-center py-20 text-red-500 text-xl">
        Learning Path tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 px-6 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
        <h1 className="text-3xl font-bold text-[#1b3d41] mb-2">{data.title}</h1>
        <p className="text-gray-600 mb-8">{data.description}</p>

        <h2 className="text-xl font-semibold text-[#088395] mb-4">
          Daftar Kursus dalam Jalur Ini
        </h2>
        <ul className="space-y-4 mb-8">
          {data.courses.map((course) => (
            <li
              key={course.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow transition"
            >
              {course.title}
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate(`/course/${data.courses[0].id}`)}
          className="bg-[#088395] text-white px-6 py-3 rounded-full hover:bg-[#056776] transition"
        >
          Mulai Belajar
        </button>
      </div>
    </div>
  );
}
