import React, { useState, useEffect } from "react";
import axios from "../utils/axiosconfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    image: null,
    file: null,
    modules: [],
  });

  useEffect(() => {
    fetchGrids();
  }, []);

  const fetchGrids = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/courses/admin");
      setGrids(response.data.courses || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Gagal memuat kursus");
      toast.error("Gagal memuat kursus");
    } finally {
      setLoading(false);
    }
  };

  const parseDateToInputFormat = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) return dateString; // yyyy-MM-dd
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`; // dd-MM-yyyy
    }
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  const handleAddNewCourse = () => {
    setFormData({
      title: "",
      date: "",
      description: "",
      image: null,
      file: null,
      modules: [],
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (course) => {
    const formattedDate = parseDateToInputFormat(course.date);
    setEditingCourse(course);
    setFormData({
      title: course.title || "",
      date: formattedDate,
      description: course.description || "",
      image: null,
      file: null,
      teacher_id: course.teacher_id || "",
      modules: course.modules || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kursus ini?")) return;
    try {
      await axios.delete(`/api/courses/${courseId}`);
      toast.success("Kursus berhasil dihapus!");
      fetchGrids();
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus kursus");
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("description", formData.description);
      if (formData.image) formDataToSend.append("image", formData.image);
      if (formData.file) formDataToSend.append("file", formData.file);
      formDataToSend.append("modules", JSON.stringify(formData.modules));

      await axios.post("/api/courses", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Kursus berhasil ditambahkan!");
      setIsAddModalOpen(false);
      fetchGrids();
    } catch (err) {
      console.error("Error adding course:", err);
      toast.error(err.response?.data?.message || "Gagal menambahkan kursus");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("description", formData.description);
      if (formData.image) formDataToSend.append("image", formData.image);
      if (formData.file) formDataToSend.append("file", formData.file);
      formDataToSend.append("modules", JSON.stringify(formData.modules));

      await axios.put(`/api/courses/${editingCourse.id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Kursus berhasil diperbarui!");
      setIsModalOpen(false);
      setEditingCourse(null);
      fetchGrids();
    } catch (err) {
      console.error("Error updating course:", err);
      toast.error(err.response?.data?.message || "Gagal memperbarui kursus");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsAddModalOpen(false);
    setEditingCourse(null);
    setFormData({ title: "", date: "", description: "", image: null, file: null, modules: [] });
  };

  const GridCard = ({ grid }) => (
    <div className="bg-white p-4 rounded-xl shadow-md">
      {grid.image_url && (
        <img
          src={`http://localhost:3000${grid.image_url}`}
          alt={grid.title}
          className="w-full h-40 object-cover rounded-t-xl mb-2"
        />
      )}
      <h3 className="text-xl font-semibold text-[#071952] mb-2">{grid.title}</h3>
      <p className="text-sm text-gray-600">{grid.description}</p>
      <p className="text-sm text-gray-500 mt-2">Tanggal: {parseDateToInputFormat(grid.date)}</p>
      <div className="mt-4 flex space-x-2">
        <button onClick={() => handleEdit(grid)} className="px-3 py-1 bg-[#088395] text-white rounded hover:bg-[#071952]">Edit</button>
        <button onClick={() => handleDelete(grid.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Hapus</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#071952] flex items-center justify-center p-4">
      <ToastContainer />
      
      {/* Edit Course Modal */}
      {isModalOpen && editingCourse && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-semibold text-[#071952] mb-4">Edit Kursus</h2>
      <form onSubmit={handleSubmitEdit}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Judul</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Tanggal</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleFormChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Ganti Gambar</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFormChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Ganti File</label>
          <input
            type="file"
            name="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFormChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      
      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-[#071952] mb-4">Tambah Kursus Baru</h2>
            <form onSubmit={handleSubmitAdd}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Judul</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Gambar</label>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  name="file"
                  accept="application/pdf,.doc,.docx"
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#088395] text-white rounded hover:bg-[#071952]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
     <div className="w-full max-w-7xl mx-auto relative">
  <div className="flex justify-end mt-4 mb-6 sticky top-20 z-30">
    <button
      onClick={handleAddNewCourse}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      Add New Course
    </button>
  </div>

  <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-10">
    Course Management
  </h1>


        {loading ? (
          <div className="text-center text-white">Memuat...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : grids.length === 0 ? (
          <div className="text-center text-white">Belum ada kursus.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grids.map((grid) => (
              <GridCard key={grid.id} grid={grid} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;