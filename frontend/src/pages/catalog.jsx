import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Catalog() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const BASE_URL = "http://localhost:3000"; // Sesuaikan dengan URL server

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/courses/all`, {
          headers: {
            "Cache-Control": "no-cache",
          },
          timeout: 10000,
        });
        console.log("Courses fetched:", response.data.courses);
        setCourses(response.data.courses || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError("Gagal memuat kelas. Silakan coba lagi nanti.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const openModal = (course) => {
    setSelectedCourse(course);
  };

  const closeModal = () => {
    setSelectedCourse(null);
  };

  const isDescriptionLong = (description) => {
    return description && description.length > 100; // Batas 100 karakter untuk "Read More"
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-center text-[#1b3d41]">
          Daftar Kelas RTPU PNJ
        </h1>
        {loading ? (
          <div className="text-center text-gray-600">Memuat kelas...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : courses.length === 0 ? (
          <div className="text-center text-gray-600">Tidak ada kelas tersedia saat ini.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <img
                  src={course.image_url ? `${BASE_URL}${course.image_url}` : "https://source.unsplash.com/400x300/?education"}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-t-xl"
                  onError={(e) => {
                    console.log(`Failed to load image for ${course.title}: ${e.target.src}`);
                    e.target.src = "https://source.unsplash.com/400x300/?education";
                  }}
                />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#088395]">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {course.description || "Tidak ada deskripsi tersedia."}
                  </p>
                  {isDescriptionLong(course.description) && (
                    <button
                      className="text-sm text-[#088395] hover:underline mt-2"
                      onClick={(e) => {
                        e.stopPropagation(); // Mencegah navigasi ke /course/:id
                        openModal(course);
                      }}
                    >
                      Read More
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal untuk deskripsi lengkap */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-[#1b3d41] mb-4">
              {selectedCourse.title}
            </h2>
            <p className="text-gray-600">{selectedCourse.description || "Tidak ada deskripsi tersedia."}</p>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-[#088395] text-white rounded-lg hover:bg-[#066a78]"
                onClick={closeModal}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}