import React, { useState } from "react";
import Navbar from "../components/navbar";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#071952] to-[#088395] text-white py-20 px-6 flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in pt-10">
            Hubungi Kami
          </h1>
          <p className="text-lg md:text-xl opacity-90 animate-slide-up">
            Kami siap membantu Anda! Kirimkan pertanyaan atau masukan Anda sekarang.
          </p>
        </div>
      </div>

      {/* Contact Form and Info */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:w-2/3 transform transition duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-semibold text-[#071952] mb-6">
            Kirim Pesan
          </h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#088395] transition duration-200"
                placeholder="Masukkan nama Anda"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#088395] transition duration-200"
                placeholder="Masukkan email Anda"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Pesan
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#088395] transition duration-200"
                placeholder="Tulis pesan Anda di sini"
              ></textarea>
            </div>
            <div>
              <button
                onClick={() => alert("Pesan akan dikirim!")}
                className="w-full bg-[#088395] hover:bg-[#056776] text-white px-4 py-2 rounded-lg shadow transform transition duration-300 hover:scale-105"
              >
                Kirim Pesan
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:w-1/3">
          <h2 className="text-2xl font-semibold text-[#071952] mb-6">
            Informasi Kontak
          </h2>
          <div className="space-y-6 text-gray-600">
            <div className="flex items-center gap-3">
              <Mail className="text-[#088395] w-6 h-6" />
              <p>
                <span className="font-medium">Email:</span>{" "}
                upartpu@pnj.ac.id   
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-[#088395] w-6 h-6" />
              <p>
                <span className="font-medium">Telepon:</span> 0812 9882 1177
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-[#088395] w-6 h-6" />
              <p>
                <span className="font-medium">Alamat:</span> Politeknik Negeri
                Jakarta, Jl. Prof. DR. G.A. Siwabessy, Kampus UI Depok, Jawa Barat 16425
              </p>
            </div>
          </div>

          {/* Peta Lokasi Interaktif */}
          <div className="mt-6 rounded-lg overflow-hidden shadow-lg">
            <a
              href="https://www.google.com/maps/place/Politeknik+Negeri+Jakarta/@-6.362902,106.827133,17z"
              target="_blank"
              rel="noopener noreferrer"
            >
              <iframe
                title="Lokasi PNJ"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1983.3798036907777!2d106.827133!3d-6.362902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ec119fa7ce2b%3A0x1bbd0eb2fba3dcbb!2sPoliteknik%20Negeri%20Jakarta!5e0!3m2!1sen!2sid!4v1710500000000!5m2!1sen!2sid"
                width="100%"
                height="250"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="border-0 w-full"
              ></iframe>
            </a>
          </div>
        </div>
      </div>

      {/* Animasi CSS */}
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
