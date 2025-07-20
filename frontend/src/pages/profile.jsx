import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../components/authcontext"; // Adjust path if needed
import { FaUserEdit, FaCalendarAlt, FaUserTag, FaLink } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosconfig"; // Adjust path if needed

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    portfolio: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch user data from backend
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/users/${user.id}`);
        const fetchedUser = response.data.user;
        setFormData({
          name: fetchedUser.name || "",
          email: fetchedUser.email,
          bio: fetchedUser.bio || "",
          portfolio: fetchedUser.portfolio || "",
          role: fetchedUser.role,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        alert("Failed to load profile data");
        navigate("/login");
      }
    };

    fetchUser();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        name: formData.name,
        bio: formData.bio,
        portfolio: formData.portfolio,
      });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EBF4F6] to-[#D6EADF] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative bg-[#37B7C3] h-40">
          <div className="absolute -bottom-10 left-6 flex items-center">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-[#37B7C3] text-[#37B7C3] flex items-center justify-center text-4xl font-bold">
              {formData.name ? formData.name[0] : formData.email[0]}
            </div>
            <div className="ml-4 text-white">
              <h1 className="text-2xl font-semibold">{formData.name || formData.email}</h1>
              <p className="text-sm">{formData.email}</p>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-white hover:text-[#bde0fe] text-xl"
                title="Edit Profile"
              >
                <FaUserEdit />
              </button>
            )}
          </div>
        </div>

        <div className="pt-16 px-6 pb-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  disabled // Prevent editing email
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Portfolio URL</label>
                <input
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7C8363] text-white rounded-lg hover:bg-[#6b7357]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center gap-2">
                <FaUserTag className="text-[#7C8363]" />
                <p>
                  <span className="font-semibold">Role:</span> {formData.role || "User"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-[#7C8363]" />
                <p>
                  <span className="font-semibold">Joined:</span>{" "}
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "January 2024"}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Bio:</span>{" "}
                  {formData.bio || "No bio available."}
                </p>
              </div>
              {formData.portfolio && (
                <div className="flex items-center gap-2">
                  <FaLink className="text-[#7C8363]" />
                  <a
                    href={formData.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Portfolio
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;