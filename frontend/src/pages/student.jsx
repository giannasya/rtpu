import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import axios from 'axios';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const imageUrl = course.image_url ? `http://localhost:3000${course.image_url}` : img1;
  const DESCRIPTION_LIMIT = 100; // Batas karakter untuk deskripsi
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  const handleCardClick = (e) => {
    // Cegah navigasi ke /materi jika klik tombol Read More
    if (e.target.tagName !== 'BUTTON') {
      navigate(`/materi/${course.id}`);
    }
  };

  const handleReadMoreClick = (e) => {
    e.stopPropagation(); // Mencegah event klik kartu
    setShowDescriptionModal(true);
  };

  const handleCloseModal = () => {
    setShowDescriptionModal(false);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white rounded-2xl shadow-lg p-4 max-w-sm transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer"
      >
        <img
          src={imageUrl}
          alt={course.title}
          className="w-full h-40 object-cover rounded-t-lg"
          onError={(e) => {
            console.error(`Failed to load image: ${imageUrl}`);
            e.target.src = img1;
          }}
        />
        <div className="p-4">
          <p className="text-[#088395] text-sm">{course.date}</p>
          <h3 className="text-lg font-semibold mt-2 text-[#071952]">{course.title}</h3>
          <div className="text-gray-700 text-sm mt-1 max-h-16 overflow-y-auto">
            {course.description && course.description.length > DESCRIPTION_LIMIT
              ? `${course.description.substring(0, DESCRIPTION_LIMIT)}...`
              : course.description || "No description available"}
            {course.description && course.description.length > DESCRIPTION_LIMIT && (
              <button
                onClick={handleReadMoreClick}
                className="text-blue-500 text-sm ml-2 hover:underline focus:outline-none"
              >
                Read More
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">👨‍🎓 {course.students} students enrolled</p>
          {course.file_url && (
            <a
              href={`http://localhost:3000${course.file_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm mt-2 block"
              onClick={(e) => e.stopPropagation()} // Cegah navigasi saat klik link
            >
              Lihat Dokumen
            </a>
          )}
        </div>
      </div>
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-[#071952]">{course.title}</h2>
            <p className="text-gray-700 text-sm mb-4">{course.description || "No description available"}</p>
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function Student() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching courses with token:', token);
      if (!token) {
        console.warn('No token found, redirecting to login');
        navigate('/login');
        return;
      }
      const res = await axios.get('http://localhost:3000/api/courses/student', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      console.log('Courses fetched:', res.data.courses);
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('Unauthorized, redirecting to login');
        navigate('/login');
      } else if (err.response?.status === 500) {
        console.error('Server error:', err.response.data);
      }
    }
  };

  useEffect(() => {
    console.log('Mounting Student, fetching courses...');
    fetchCourses();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#EBF4F6] pl-64">
      <div className="p-6 pt-28">
        <header className="rounded-xl shadow-lg overflow-hidden">
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            showArrows={false}
            interval={4000}
            stopOnHover={false}
            swipeable={true}
            emulateTouch={true}
          >
            {[img1, img2, img3].map((image, index) => (
              <div key={index} className="relative h-64 w-full rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="object-cover w-full h-full brightness-90 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white z-10">
                  <h2 className="text-2xl font-semibold drop-shadow-lg">Explore Top Courses</h2>
                  <p className="text-sm drop-shadow-md">Learn with industry experts</p>
                </div>
              </div>
            ))}
          </Carousel>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8">
          {courses.length === 0 ? (
            <p className="text-gray-500">Tidak ada kursus tersedia.</p>
          ) : (
            courses.map((course, index) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}