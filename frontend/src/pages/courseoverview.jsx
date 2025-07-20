import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaClipboardList,
  FaFileAlt,
} from "react-icons/fa";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

export default function CourseOverview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [course, setCourse] = useState(state?.course || null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      const courseId = window.location.pathname.split('/')[2];
      try {
        const token = getAuthToken();
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`/api/courses/${courseId}/full`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data || !response.data.course) {
          throw new Error("Invalid course data");
        }

        setCourse({
          ...response.data.course,
          modules: response.data.modules || []
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch course");
      }
    };

    const fetchProgress = async () => {
      if (course?.id) {
        try {
          const token = getAuthToken();
          const response = await axios.get(`/api/progress?courseId=${course.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.progress !== undefined) {
            setProgress(response.data.progress);
          }
        } catch (err) {
          console.error("Error fetching progress:", err);
        }
      }
    };

    fetchCourseData().then(() => {
      fetchProgress().finally(() => setLoading(false));
    });
  }, [course?.id, state, navigate]);

  const handleNavigation = (path) => {
    navigate(path, { state: { course } });
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <Sidebar />

      <div className="pl-64 pt-24 px-4 md:px-16">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{course.title}</h1>
        <p className="text-sm text-gray-600 mb-6">{course.description}</p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-700">Learning Progress</p>
            <p className="text-sm text-blue-600 font-medium">{progress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Course Modules */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Course Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.modules?.length > 0 ? (
              course.modules.map((mod) => (
                <div
                  key={mod.id}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
                  onClick={() => handleNavigation(`/course/${course.id}/module/${mod.id}`)}
                >
                  <h3 className="font-medium text-gray-900">{mod.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {mod.submaterials?.length || 0} materials
                  </p>
                  <ul className="mt-2 pl-4 list-disc text-sm text-gray-700">
                    {mod.submaterials?.map((sub) => (
                      <li key={sub.id}>
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {sub.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 col-span-3">No modules available yet</p>
            )}
          </div>
        </div>

        {/* Grid Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 flex gap-4 items-start">
            <FaFileAlt className="text-3xl text-blue-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">Assignments</h3>
              <p className="text-sm text-gray-600">
                View and submit your assignments.
              </p>
              <button
                className="mt-2 text-blue-500 hover:underline"
                onClick={() => handleNavigation(`/course/${course.id}/assignments`)}
              >
                View Assignments
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex gap-4 items-start">
            <FaClipboardList className="text-3xl text-blue-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">Quizzes</h3>
              <p className="text-sm text-gray-600">
                Take quizzes to test your knowledge.
              </p>
              <button
                className="mt-2 text-blue-500 hover:underline"
                onClick={() => handleNavigation(`/course/${course.id}/quizzes`)}
              >
                View Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
