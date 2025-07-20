import React from "react";

const ProfileCard = ({ user, onEdit }) => {
  return (
    <div className="text-center space-y-4 ">
      <div className="w-24 h-24 mx-auto rounded-full bg-gray-300" />
      <h2 className="text-xl font-semibold">{user.name}</h2>
      <p className="text-sm text-gray-600">{user.email}</p>
      <p className="text-gray-500">{user.bio}</p>
      <button
        onClick={onEdit}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileCard;
