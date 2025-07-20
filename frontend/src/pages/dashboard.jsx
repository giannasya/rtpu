import React, { useState, useEffect } from "react";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import axios from 'axios';

const CourseCard = ({ course, onAddModule, onShowDescription }) => {
  const DESCRIPTION_LIMIT = 100;
  const imageUrl = course.image_url ? `http://localhost:3000${course.image_url}` : img1;

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-lg p-4 max-w-sm h-full">
      <img
        src={imageUrl}
        alt={course.title}
        className="w-full h-40 object-cover rounded-t-lg"
        onError={(e) => {
          console.error(`Failed to load image: ${imageUrl}`);
          e.target.src = img1;
        }}
      />
      <div className="p-4 flex flex-col justify-between h-full">
        <div className="flex-1">
          <p className="text-[#088395] text-sm">{course.date}</p>
          <h3 className="text-lg font-semibold mt-2 text-[#071952]">{course.title}</h3>
          <div className="text-gray-700 text-sm mt-1 max-h-16 overflow-y-auto">
            {course.description && course.description.length > DESCRIPTION_LIMIT
              ? `${course.description.substring(0, DESCRIPTION_LIMIT)}...`
              : course.description || "No description available"}
            {course.description && course.description.length > DESCRIPTION_LIMIT && (
              <button
                onClick={() => onShowDescription(course)}
                className="text-blue-500 text-sm ml-2 hover:underline focus:outline-none"
              >
                Read More
              </button>
            )}
          </div>
          {course.file_url && (
            <a
              href={`http://localhost:3000${course.file_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm mt-2 block"
            >
              Lihat Dokumen
            </a>
          )}
          {course.modules && course.modules.length > 0 && (
            <div className="mt-3 max-h-24 overflow-y-auto">
              <h4 className="text-sm font-semibold text-[#071952]">Modul:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {course.modules.map((mod, i) => (
                  <li key={i}>
                    {mod.title}
                    <ul className="list-decimal pl-5">
                      {mod.submaterials.map((sub, j) => (
                        <li key={j}>
                          {sub.title}{' '}
                          {sub.file_url && (
                            <a
                              href={sub.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline ml-1"
                            >
                              [Video]
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-4">
          <button
            onClick={() => onAddModule(course.id)}
            className="w-full bg-gradient-to-r from-[#088395] to-[#37B7C3] text-white py-2 rounded-lg shadow-md hover:from-[#071952] hover:to-[#088395] transition duration-300"
          >
            Tambah Modul
          </button>
        </div>
      </div>
    </div>
  );
};

const DescriptionModal = ({ course, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-[#071952]">{course.title}</h2>
      <p className="text-gray-700 text-sm mb-4">{course.description || "No description available"}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

const ModuleForm = ({ onClose, onSubmit, courseId, fetchCourses }) => {
  const [form, setForm] = useState({ modules: [] });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const googleDriveRegex = /^https:\/\/(drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)[a-zA-Z0-9_-]+/;

  const handleAddModule = () => {
    setForm(prev => ({
      ...prev,
      modules: [...prev.modules, { title: "", submaterials: [{ title: "", video_url: "" }] }]
    }));
  };

  const handleModuleChange = (index, value) => {
    setForm(prev => {
      const modules = [...prev.modules];
      modules[index].title = value;
      return { ...prev, modules };
    });
  };

  const handleAddSubmaterial = (moduleIndex) => {
    setForm(prev => {
      const modules = [...prev.modules];
      modules[moduleIndex].submaterials.push({ title: "", video_url: "" });
      return { ...prev, modules };
    });
  };

  const handleSubmaterialChange = (moduleIndex, subIndex, field, value) => {
    setForm(prev => {
      const modules = [...prev.modules];
      modules[moduleIndex].submaterials[subIndex][field] = value;
      return { ...prev, modules };
    });
  };

  const handleRemoveModule = (moduleIndex) => {
    setForm(prev => {
      const modules = [...prev.modules];
      modules.splice(moduleIndex, 1);
      return { ...prev, modules };
    });
  };

  const handleRemoveSubmaterial = (moduleIndex, subIndex) => {
    setForm(prev => {
      const modules = [...prev.modules];
      modules[moduleIndex].submaterials.splice(subIndex, 1);
      return { ...prev, modules };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Validation
    const validationErrors = {};
    form.modules.forEach((mod, index) => {
      if (!mod.title) {
        validationErrors[`module_${index}`] = `Judul modul #${index + 1} wajib diisi`;
      }
      mod.submaterials.forEach((sub, subIndex) => {
        if (!sub.title) {
          validationErrors[`submaterial_${index}_${subIndex}`] = `Judul submateri #${subIndex + 1} di modul #${index + 1} wajib diisi`;
        }
        if (sub.video_url && !googleDriveRegex.test(sub.video_url)) {
          validationErrors[`submaterial_url_${index}_${subIndex}`] = `Link Google Drive tidak valid untuk submateri #${subIndex + 1} di modul #${index + 1}`;
        }
      });
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ submit: 'Silakan login terlebih dahulu' });
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `http://localhost:3000/api/courses/${courseId}/modules`,
        { modules: form.modules },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Modules added successfully:', response.data);
      await fetchCourses();
      onClose();
    } catch (err) {
      console.error('Error submitting modules:', err);
      let errorMessage = 'Gagal menambahkan modul. ';
      if (err.response) {
        errorMessage += err.response.data.message || 'Terjadi kesalahan server.';
        if (err.response.status === 401) {
          errorMessage = 'Token tidak valid. Silakan login kembali.';
          navigate('/login');
        }
      } else {
        errorMessage += 'Tidak dapat terhubung ke server.';
      }
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4 text-[#071952]">Tambah Modul dan Submateri</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {form.modules.map((mod, modIndex) => (
            <div key={modIndex} className="border p-3 rounded bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Modul #{modIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveModule(modIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  Hapus Modul
                </button>
              </div>
              <input
                type="text"
                placeholder={`Judul Modul #${modIndex + 1}`}
                className="w-full p-2 border rounded mb-2"
                value={mod.title}
                onChange={(e) => handleModuleChange(modIndex, e.target.value)}
              />
              {errors[`module_${modIndex}`] && (
                <p className="text-red-500 text-sm">{errors[`module_${modIndex}`]}</p>
              )}
              
              {mod.submaterials.map((sub, subIndex) => (
                <div key={subIndex} className="ml-4 mb-3 border-l-2 pl-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Submateri #{subIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubmaterial(modIndex, subIndex)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={`Judul Submateri #${subIndex + 1}`}
                    className="w-full p-2 border rounded mb-1"
                    value={sub.title}
                    onChange={(e) => handleSubmaterialChange(modIndex, subIndex, "title", e.target.value)}
                  />
                  {errors[`submaterial_${modIndex}_${subIndex}`] && (
                    <p className="text-red-500 text-sm">{errors[`submaterial_${modIndex}_${subIndex}`]}</p>
                  )}
                  <input
                    type="text"
                    placeholder="Masukkan link Google Drive video"
                    className="w-full p-2 border rounded"
                    value={sub.video_url}
                    onChange={(e) => handleSubmaterialChange(modIndex, subIndex, "video_url", e.target.value)}
                  />
                  {errors[`submaterial_url_${modIndex}_${subIndex}`] && (
                    <p className="text-red-500 text-sm">{errors[`submaterial_url_${modIndex}_${subIndex}`]}</p>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => handleAddSubmaterial(modIndex)}
                className="text-sm mt-2 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              >
                + Tambah Submateri
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddModule}
            className="w-full bg-[#E8F6F9] text-[#088395] py-2 rounded border border-[#088395] hover:bg-[#d3edf1]"
          >
            + Tambah Modul
          </button>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-300 rounded"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#088395] text-white rounded hover:bg-[#071952]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
          
          {errors.submit && (
            <div className="mt-3 p-2 bg-red-100 text-red-700 rounded">
              {errors.submit}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get('http://localhost:3000/api/courses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCourses(response.data.courses || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      } else {
        setError('Gagal memuat kursus. Silakan coba lagi.');
      }
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [navigate]);

  const handleAddModules = async (formData, token, courseId) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/courses/${courseId}/modules`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Error adding modules:', err);
      throw err;
    }
  };

  const handleShowDescription = (course) => {
    setSelectedCourse(course);
  };

  const handleCloseDescription = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-[#EBF4F6]">
      <Navbar />
      <div className="p-6 pt-28">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        <header className="rounded-xl shadow-lg overflow-hidden">
          <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} showArrows={false} interval={4000}>
            {[img1, img2, img3].map((image, index) => (
              <div key={index} className="relative h-64 w-full rounded-xl overflow-hidden">
                <img src={image} alt={`Slide ${index + 1}`} className="object-cover w-full h-full brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white z-10">
                  <h2 className="text-2xl font-semibold drop-shadow-lg">Explore Top Courses</h2>
                  <p className="text-sm drop-shadow-md">Learn with industry experts</p>
                </div>
              </div>
            ))}
          </Carousel>
        </header>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => navigate('/AddQuiz')}
            className="bg-[#088395] text-white px-4 py-2 rounded-lg shadow hover:bg-[#071952] transition duration-300"
          >
            Add Quiz
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8">
          {courses.length === 0 ? (
            <p className="text-gray-500">Tidak ada kursus tersedia.</p>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onAddModule={() => {
                  setSelectedCourseId(course.id);
                  setShowModuleForm(true);
                }}
                onShowDescription={handleShowDescription}
              />
            ))
          )}
        </div>
      </div>
      
      {showModuleForm && (
        <ModuleForm
          onClose={() => {
            setShowModuleForm(false);
            setSelectedCourseId(null);
          }}
          onSubmit={handleAddModules}
          courseId={selectedCourseId}
          fetchCourses={fetchCourses}
        />
      )}
      
      {selectedCourse && (
        <DescriptionModal course={selectedCourse} onClose={handleCloseDescription} />
      )}
    </div>
  );
}