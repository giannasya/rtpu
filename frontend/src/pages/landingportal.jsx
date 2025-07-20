import React from "react";
import { useNavigate } from "react-router-dom";
import pnj from "../assets/pnj.png";
import heroImage from "../assets/gedung.jpg";
import fitur1 from "../assets/guru1.jpeg";
import fitur2 from "../assets/guru2.jpeg";
import fitur3 from "../assets/guru3.jpeg";

import mitra1 from "../assets/pnj.png";

export default function LandingPortal() {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Hero */}
      <section className="bg-gradient-to-br from-white to-[#f0f4f8] py-20">
        <div className="container mx-auto px-6 flex flex-col-reverse lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-[#1b3d41]">
              Selamat Datang di 
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-[#1b3d41]">
              <span className="text-[#088395]">Portal RTPU PNJ</span>
            </h1>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-md">
              Belajar, konsultasi, dan kembangkan potensi bersama RTPU Politeknik Negeri Jakarta.
            </p>
            <div className="mt-6 flex justify-center lg:justify-start gap-4">
              <button onClick={() => navigate("/landing")} className="bg-[#088395] text-white px-6 py-2 rounded-full hover:bg-[#056776] transition">Daftar Sekarang</button>
              <button onClick={() => navigate("/catalog")} className="border border-[#088395] text-[#088395] px-6 py-2 rounded-full hover:bg-[#088395] hover:text-white transition">Lihat Kelas</button>
            </div>
          </div>
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <img src={heroImage} alt="Hero" className="rounded-xl shadow-lg" />
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#1b3d41] mb-12">Kenapa Pilih RTPU PNJ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              img: fitur1, title: "Pengajar Berpengalaman", desc: "Dosen dan praktisi profesional siap membimbing."
            }, {
              img: fitur2, title: "Materi Terstruktur", desc: "Disusun berbasis kebutuhan dunia industri."
            }, {
              img: fitur3, title: "Fleksibel dan Online", desc: "Akses materi kapan saja dan di mana saja."
            }].map((f, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-6 text-center shadow hover:shadow-lg">
                <img src={f.img} alt={f.title} className="w-full h-40 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-semibold text-[#1b3d41]">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategori Belajar */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#1b3d41] mb-12">Kategori Pembelajaran</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[{
              img: fitur1, label: "Teknologi Rekayasa"
            }, {
              img: fitur2, label: "Konsultasi & Bimbingan"
            }, {
              img: fitur3, label: "Produk Inovatif"
            }].map((k, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow hover:shadow-lg cursor-pointer">
                <img src={k.img} alt={k.label} className="w-full h-40 object-cover" />
                <div className="bg-white p-4 text-center">
                  <p className="text-lg font-medium text-[#088395]">{k.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mitra / Partner */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#1b3d41] mb-6">Didukung Oleh</h2>
          <div className="flex justify-center gap-10 items-center">
            <img src={mitra1} alt="Partner" className="h-16 object-contain" />
            {/* Tambahkan logo partner lain jika ada */}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#088395] py-20 text-white text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Gabung dan Mulai Belajar</h2>
          <p className="mb-6">Bersama RTPU PNJ, kamu bisa kembangkan potensi dan raih sertifikasi unggulan.</p>
          <button onClick={() => navigate("/register")} className="bg-white text-[#088395] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">Daftar Sekarang</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1b3d41] text-white py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">RTPU PNJ</h3>
            <p className="text-sm text-gray-300">Jl. Prof. DR. G.A. Siwabessy, Kukusan, Beji, Depok City, Jawa Barat 16425</p>
          </div>
          <div className="mt-6 md:mt-0">
            <p className="text-sm">© {new Date().getFullYear()} RTPU PNJ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
