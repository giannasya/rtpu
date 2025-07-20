import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        if (!id) throw new Error('Missing course ID');
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const [courseResponse, enrollmentResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/courses/${id}/full`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:3000/api/enrollments/check?course_id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: { enrolled: false } })) // Handle if endpoint doesn't exist
        ]);

        if (!courseResponse.data?.course) {
          throw new Error('Invalid course data');
        }

        setCourse({
          ...courseResponse.data.course,
          modules: courseResponse.data.modules || []
        });
        
        setEnrolled(enrollmentResponse.data?.enrolled || false);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load course');
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, navigate]);

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
        { course_id: id },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
      );

      if (response.data?.success) {
        toast.success('Successfully enrolled in course');
        setEnrolled(true);
        // Redirect to course overview after enrollment
        navigate(`/course/${id}/overview`);
      } else {
        throw new Error(response.data?.message || 'Enrollment failed');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      const errorMsg = err.response?.data?.message || 
                      err.message || 
                      'Failed to enroll in course';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Course not found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested course could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-32">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {/* Course Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Created by: {course.teacher_name || 'Unknown teacher'}
              </p>
            </div>
            {!enrolled && (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${enrolling ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>

        {/* Course Content */}
        <div className="px-4 py-5 sm:p-6">
          {course.image_url && (
            <img
              src={`http://localhost:3000${course.image_url}`}
              alt={course.title}
              className="w-full h-64 object-contain mb-6 rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-course.jpg';
              }}
            />
          )}

          <div className="prose max-w-none">
            <h2 className="text-lg font-medium text-gray-900">Description</h2>
            <p className="mt-2 text-gray-600 whitespace-pre-line">
              {course.description || 'No description available'}
            </p>
          </div>

          {/* Show modules only if enrolled */}
          {enrolled ? (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Course Modules</h2>
              <div className="mt-4 space-y-4">
                {course.modules.length === 0 ? (
                  <p className="text-sm text-gray-500">No modules available yet</p>
                ) : (
                  course.modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{module.title || 'Untitled Module'}</h3>
                      {module.submaterials && module.submaterials.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {module.submaterials.map((material) => (
                            <li key={material.id} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{material.title}</p>
                                {material.file_url && (
                                 <a
                                    href={`/materi/${id}/${material.id}`}
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    View Material
                                  </a>

                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">No submaterials in this module</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
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
  );
};

export default CourseDetail;