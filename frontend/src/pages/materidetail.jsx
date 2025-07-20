import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#F8FAFC] pl-64">
    <div className="pt-24 px-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      </div>
    </div>
  </div>
);

const ErrorScreen = ({ error }) => (
  <div className="min-h-screen bg-[#F8FAFC] pl-64">
    <div className="pt-24 px-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 text-blue-500 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

const MateriDetail = () => {
  const { courseId, materialId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [courseData, setCourseData] = useState(null);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const findMaterial = (modules, targetId) => {
    if (!modules) return null;
    for (const module of modules) {
      const material = module.submaterials?.find(
        (m) => m.id.toString() === targetId.toString()
      );
      if (material) return material;
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // ✅ Jika data dikirim dari navigate state
        if (location.state?.courseData) {
          const material = findMaterial(
            location.state.courseData.modules,
            materialId
          );
          if (material) {
            setCourseData(location.state.courseData);
            setCurrentMaterial(material);
            setLoading(false);
            return;
          }
        }

        const response = await axios.get(
          `http://localhost:3000/api/courses/${courseId}/full`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data?.success) throw new Error("Failed to load course data");

        const modules = response.data.modules.map((mod) => ({
          ...mod,
          submaterials: mod.submaterials?.length
            ? mod.submaterials
            : mod.materials || [],  // fallback kalau submaterials kosong
        }));

        const material = findMaterial(modules, materialId);
        if (!material) throw new Error("Material not found");

        setCourseData({ course: response.data.course, modules });
        setCurrentMaterial(material);

      } catch (err) {
        console.error("Error loading material:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load material"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, materialId, location.state, navigate]);

  const getSecureFileUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("/uploads/") || url.startsWith("/Uploads/")) {
      return `http://localhost:3000${url}`;
    }

    if (url.includes("drive.google.com")) {
      const fileId = url.match(/[-\w]{25,}/);
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId[0]}/preview`;
      }
      return url;
    }

    return url;
  };

  const handleMaterialNavigation = (newMaterialId) => {
    const material = findMaterial(courseData.modules, newMaterialId);
    if (material) {
      setCurrentMaterial(material);
      navigate(`/materi/${courseId}/${newMaterialId}`, {
        replace: true,
        state: {
          courseData,
          currentMaterial: material,
        },
      });
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!currentMaterial)
    return (
      <div className="min-h-screen bg-[#F8FAFC] pl-64">
        <div className="pt-24 px-6">
          <p className="text-lg">Material not found</p>
        </div>
      </div>
    );

  const fileUrl = getSecureFileUrl(currentMaterial.file_url);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <div className="pt-24 px-6 flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold mb-4">{currentMaterial.title}</h1>

            {fileUrl ? (
              fileUrl.includes(".pdf") ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    fileUrl
                  )}&embedded=true`}
                  className="w-full h-[80vh] rounded-md shadow mb-4"
                  title={currentMaterial.title}
                />
              ) : fileUrl.includes("drive.google.com") ? (
                <div className="aspect-video mb-4">
                  <iframe
                    src={fileUrl}
                    className="w-full h-full rounded-md shadow"
                    allow="autoplay"
                  />
                </div>
              ) : (
                <video
                  controls
                  className="w-full rounded-md shadow"
                  src={fileUrl}
                />
              )
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p>No content available for this material</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-xl shadow p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Course Modules</h2>
            {courseData?.modules.map((module) => (
              <div key={module.id} className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  {module.title}
                </h3>
                <ul className="space-y-1">
                  {module.submaterials.map((material) => (
                    <li
                      key={material.id}
                      className={`text-sm px-2 py-1 rounded flex justify-between items-center ${
                        material.id.toString() === materialId
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-50 cursor-pointer"
                      }`}
                      onClick={() => handleMaterialNavigation(material.id)}
                    >
                      <span>{material.title}</span>
                      {material.file_url && (
                        <a
                          href={getSecureFileUrl(material.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-500 text-xs ml-2 underline"
                        >
                          Open
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MateriDetail;
