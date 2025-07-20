import React from "react";
import { useNavigate } from "react-router-dom";

const learningPaths = [
  {
    id: 101,
    title: "Rekayasa Mesin Dasar",
    description: "Pelajari dasar-dasar rekayasa mesin untuk kebutuhan industri.",
    coursesCount: 5,
    image: "https://source.unsplash.com/400x300/?machine,technology",
  },
  {
    id: 102,
    title: "Produk Unggulan untuk Industri",
    description: "Bangun dan kembangkan produk bernilai tinggi yang siap dipasarkan.",
    coursesCount: 4,
    image: "https://source.unsplash.com/400x300/?product,innovation",
  },
  {
    id: 103,
    title: "Konsultasi UMKM Efektif",
    description: "Optimalkan strategi konsultasi dan pendampingan usaha kecil.",
    coursesCount: 3,
    image: "https://source.unsplash.com/400x300/?consulting,people",
  },
];

export default function LearningPath() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-center text-[#1b3d41]">
          Jalur Pembelajaran RTPU PNJ
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Pilih jalur pembelajaran yang sesuai untuk mengembangkan kompetensi di bidang teknologi dan produk unggulan.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {learningPaths.map((path) => (
            <div
              key={path.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/learning-path/${path.id}`)}
            >
              <img
                src={path.image}
                alt={path.title}
                className="w-full h-40 object-cover rounded-t-xl"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[#088395]">
                  {path.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">{path.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {path.coursesCount} kursus di dalamnya
                </p>
                <button
                  className="mt-4 bg-[#088395] text-white px-4 py-2 rounded-full text-sm hover:bg-[#056776] transition"
                >
                  Lihat Jalur
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
