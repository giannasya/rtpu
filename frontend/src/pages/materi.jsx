import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#F8FAFC] pl-64">
    <div className="pt-24 px-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <div className="min-h-screen bg-[#F8FAFC] pl-64">
    <div className="pt-24 px-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong>Error: </strong> {error}
        {onRetry && (
          <button 
            onClick={onRetry}
            className="ml-4 text-blue-500 hover:text-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);

const NotFoundScreen = () => (
  <div className="min-h-screen bg-[#F8FAFC] pl-64">
    <div className="pt-24 px-6">
      <p>Course not found</p>
    </div>
  </div>
);

export default function Materi() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const isValidCourseId = courseId && /^\d+$/.test(courseId);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isValidCourseId) {
        throw new Error("Invalid course ID format");
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/courses/${courseId}/full`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to load course data");
      }

      setCourseData({
        course: response.data.course,
        modules: response.data.modules
      });
      setEnrolled(response.data.isEnrolled);
    } catch (err) {
      console.error("Error fetching course:", err);
      if (err.response) {
        if (err.response.status === 404) {
          setError("Course not found");
        } else if (err.response.status === 401) {
          setError("Please login to access this course");
          navigate('/login');
        } else {
          setError(err.response.data?.message || "Failed to load course data");
        }
      } else {
        setError(err.message || "Failed to load course");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isValidCourseId) {
      fetchCourseData();
    } else {
      setError("Invalid course ID format");
      setLoading(false);
    }
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:3000/api/enrollments',
        { course_id: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        toast.success('Successfully enrolled in course');
        setEnrolled(true);
        await fetchCourseData();
      } else {
        throw new Error(response.data?.message || 'Enrollment failed');
      }
    } catch (err) {
      console.error("Error enrolling:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmaterialClick = (submaterial) => {
    if (!enrolled) {
      toast.error("You need to enroll in this course first");
      return;
    }
    
    navigate(`/materi/${courseId}/${submaterial.id}`, {
      state: {
        courseData: {
          course: courseData.course,
          modules: courseData.modules
        },
        currentMaterial: submaterial
      }
    });
  };

  if (!isValidCourseId) {
    return <ErrorScreen error={error || "Invalid course ID format"} />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={fetchCourseData} />;
  }

  if (!courseData) {
    return <NotFoundScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <div className="pt-24 px-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-md w-full md:w-1/3 p-4 sticky top-24 h-fit">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Course:</p>
            <h2 className="text-lg font-bold text-gray-800">{courseData.course.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(courseData.course.date).toLocaleDateString()}
            </p>
          </div>

          {courseData.course.image_url && (
            <img
              src={courseData.course.image_url}
              alt={courseData.course.title}
              className="w-full h-auto rounded-lg mb-4"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x200?text=Course+Image";
              }}
            />
          )}

          {!enrolled && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className={`w-full ${enrolling ? 'bg-blue-400' : 'bg-blue-600'} text-white py-2 rounded-lg hover:bg-blue-700 transition`}
            >
              {enrolling ? 'Enrolling...' : 'Enroll in Course'}
            </button>
          )}

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500 mb-3">Course Modules:</p>
            <div className="space-y-2">
              {courseData.modules.length > 0 ? (
                courseData.modules.map((module) => (
                  <div key={module.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 font-medium">
                      {module.title}
                    </div>
                    <div className="divide-y">
                      {module.submaterials.length > 0 ? (
                        module.submaterials.map((submaterial) => (
                          <div
                            key={submaterial.id}
                            className={`px-3 py-2 flex justify-between items-center ${
                              enrolled ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                            }`}
                            onClick={() => handleSubmaterialClick(submaterial)}
                          >
                            <span className="text-sm">{submaterial.title}</span>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              {submaterial.file_url?.includes('.pdf') ? 'PDF' : 
                               submaterial.file_url?.includes('drive.google.com') ? 'Video' : 'Material'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No materials available
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  This course doesn't have any modules yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{courseData.course.title}</h1>
            <p className="text-gray-500 text-sm mb-4">
              Published on {new Date(courseData.course.created_at).toLocaleDateString()}
            </p>
            <div className="prose max-w-none">
              <p className="text-gray-700">{courseData.course.description}</p>
            </div>

            {!enrolled && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You need to enroll in this course to access the modules and materials.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}