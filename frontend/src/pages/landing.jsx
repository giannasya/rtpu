import React from "react";
import { useNavigate } from "react-router-dom";
import pnj from "../assets/pnj.png";
import guru1 from "../assets/guru1.jpeg";
import guru2 from "../assets/guru2.jpeg";
import guru3 from "../assets/guru3.jpeg";
import guru4 from "../assets/guru4.jpeg";
import guru5 from "../assets/guru5.jpeg";
import gedung from "../assets/gedung.jpg";
import pnjtext from "../assets/pnjtext.png";
import bami from "../assets/bami.jpeg";
import produk from "../assets/produk.jpeg";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-gray-800 bg-[#1b3d41]">
      {/* Hero */}
      <section className="relative flex flex-col md:flex-row items-center justify-center gap-12 min-h-screen px-8 pt-32 bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden text-gray-800">
        {/* Background Glow Ring */}
        <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-[#88e0ef] opacity-30 rounded-full filter blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-[#56cfe1] opacity-20 rounded-full filter blur-2xl -z-10" />

        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-center text-center md:text-left">
          {/* Text Section */}
          <div className="md:w-1/2 space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              <span className="text-gray-900">Apa Itu</span> <br />
              <span className="text-[#088395] italic">Rekayasa Teknologi & Produk Unggulan ?</span> <br />
              <span className="text-gray-900">Politeknik Negeri Jakarta</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-lg">
              Belajar lebih seru, fleksibel, dan berdampak. Temukan kursus, raih sertifikasi, dan berkembang bersama kami.
            </p>
            <a
              href="https://www.pnj.ac.id" 
              rel="noopener noreferrer"
              className="inline-block mt-2 text-base text-[#088395] underline hover:text-[#056776]"
            >
              Baca Selengkapnya
            </a>
          </div>

          {/* Image Section */}
          <img
            src={pnjtext}
            alt="PNJ Logo"
            className="w-full max-w-sm md:max-w-md mt-12 md:mt-0"
          />
        </div>
      </section>

      <section className="bg-cyan-800 py-24 px-6 text-white relative overflow-visible">
        {/* Gambar Gedung PNJ */}
        <div className="max-w-5xl mx-auto relative">
          {/* Overlay Card di atas gambar */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white text-gray-800 rounded-full shadow-xl px-24 py-4 flex items-center justify-center gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-lg xl:text-lg font-semibold text-gray-700">
                  We Are Part Of:
                </p>
                <p className="text-base lg:text-lg font-bold text-cyan-800">
                  Politeknik Negeri Jakarta
                </p>
              </div>
              <img
                src={pnj}
                alt="Logo PNJ"
                className="w-10 h-10 sm:w-20 sm:h-20 object-contain"
              />
            </div>
          </div>

          {/* Gambar Gedung */}
          <div className="rounded-xl overflow-hidden shadow-md border border-white/10">
            <img
              src={gedung}
              alt="Gedung PNJ"
              className="w-full h-56 md:h-64 object-cover"
            />
          </div>
        </div>

        {/* Grid Barang/Jasa/Konseling */}
        <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <img
            src={bami}
            alt="BARANG"
            className="rounded-xl shadow-lg object-cover h-48 w-full"
          />
          <img
            src={bami}
            alt="JASA"
            className="rounded-xl shadow-lg object-cover h-48 w-full"
          />
          <img
            src={produk}
            alt="KONSELING"
            className="rounded-xl shadow-lg object-cover h-48 w-full"
          />
        </div>
      </section>

      {/* Para Guru */}
      <section className="bg-white py-16 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          {/* Teks Judul */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-800 leading-snug">
              Para Guru <span className="text-cyan-700 font-bold">Terbaik</span> Kami
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg">
              Mereka yang siap membimbing dan menginspirasi Anda setiap langkahnya.
            </p>
          </div>

          {/* Kolom Kiri – Scroll ke Atas */}
          <div className="lg:w-1/6 relative h-[400px] overflow-hidden">
            <div className="animate-loopScroll absolute inset-x-0 top-0 flex flex-col items-center gap-6">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-6">
                  {[guru1, guru2, guru3, guru4, guru5].map((src, index) => (
                    <div
                      key={`${i}-${index}`} // PERBAIKAN DI SINI (template literal)
                      className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden shadow-md bg-gray-100 border border-gray-200"
                    >
                      <img 
                        src={src} 
                        alt={`Guru ${index + 1}`} // PERBAIKAN DI SINI (template literal)
                        className="object-cover w-full h-full" 
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Kolom Kanan – Scroll ke Bawah */}
          <div className="lg:w-1/6 relative h-[400px] overflow-hidden">
            <div className="animate-loopScrollReverse absolute inset-x-0 top-0 flex flex-col items-center gap-6">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-6">
                  {[guru1, guru2, guru3, guru4, guru5].map((src, index) => (
                    <div
                      key={`${i}-${index}`} // PERBAIKAN DI SINI (template literal)
                      className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden shadow-md bg-gray-100 border border-gray-200"
                    >
                      <img 
                        src={src} 
                        alt={`Guru ${index + 1}`} // PERBAIKAN DI SINI (template literal)
                        className="object-cover w-full h-full" 
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ajakan Aksi */}
      <section className="bg-cyan-800 py-20 px-6 text-white text-center">
        <div className="bg-white text-[#1b3d41] rounded-[2rem] shadow-2xl w-full max-w-lg mx-auto p-10 space-y-6 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <h2 className="text-3xl font-extrabold leading-snug tracking-tight">
            Jadi, Apa yang Kamu Tunggu?
          </h2>
          
          <p className="text-lg text-gray-700 leading-relaxed">
            Kesempatan untuk berkembang sudah di depan mata. Yuk mulai perjalananmu bersama kami hari ini.
          </p>
          
          <button
            onClick={() => navigate("/register")}
            className="bg-[#2f4cdd] hover:bg-[#1c38c4] text-white text-lg font-semibold px-8 py-3 rounded-full transition duration-300 shadow-md hover:scale-105"
          >
            AYO MULAI
          </button>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto" style={{ maxWidth: '950px', paddingLeft: '120px' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Logo */}
            <div className="w-56 md:w-64 flex-shrink-0">
              <img
                src={pnjtext}
                alt="Logo RTPU PNJ"
                className="w-full object-contain"
              />
            </div>

            {/* Alamat */}
            <div className="text-left text-xl md:text-2xl text-gray-900 leading-relaxed">
              <p className="font-semibold">RTPU PNJ</p>
              <p>Universitas Indonesia,</p>
              <p>Jl. Prof. DR. G.A. Siwabessy,</p>
              <p>Kukusan, Beji, Depok City,</p>
              <p>West Java 16425</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}