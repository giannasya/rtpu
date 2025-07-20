import React from "react";
import Navbar from "../components/navbar";
import pnj from "../assets/pnj.png";

export default function About() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#071952] to-[#088395] text-white py-20 px-6 flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in pt-10">
            Tentang RTPU PNJ
          </h1>
          <p className="text-lg md:text-xl opacity-90 animate-slide-up">
            Membangun masa depan melalui pendidikan teknologi yang inovatif dan praktis.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
        {/* Mission Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:w-1/2 transform transition duration-300 hover:scale-105 hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-[#071952] mb-4">
            Misi Kami
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Memberdayakan individu dan profesional melalui pelatihan teknologi terkini, seperti Building Automation System dan Data Science, untuk memenuhi kebutuhan industri modern dengan pendidikan berkualitas tinggi.
          </p>
        </div>

        {/* Vision Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:w-1/2 transform transition duration-300 hover:scale-105 hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-[#071952] mb-4">
            Visi Kami
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Menjadi pusat pelatihan teknologi terdepan di Indonesia, menghasilkan tenaga kerja kompeten dan inovatif yang siap bersaing di pasar global melalui transformasi digital.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-[#071952] mb-6">
            Tim Kami
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Didukung oleh pengajar dan profesional berpengalaman dari Politeknik Negeri Jakarta, kami berdedikasi untuk memberikan pengalaman belajar terbaik.
          </p>
          <div className="flex justify-center">
            <img
              src={pnj}
              alt="PNJ Logo"
              className="h-20 transform transition duration-300 hover:scale-110"
            />
          </div>
        </div>
      </div>

      {/* Tailwind Animation Classes */}
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