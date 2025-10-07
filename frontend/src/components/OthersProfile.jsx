import { Avatar } from "@mui/material"; // import Avatar if using MUI
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosinstance.js";

const OthersProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/auth/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>User not found.</p>;

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 w-full max-w-sm">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-24 h-24 rounded-full mb-4"
            />
          ) : (
            <Avatar
              sx={{
                width: 96,
                height: 96,
                bgcolor: "#facc15", // yellow background
                fontSize: 40,
                mb: 2,
              }}
            >
              {profile.name?.[0].toUpperCase()}
            </Avatar>
          )}

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>

          {profile.role && (
            <p className="mt-1 text-sm px-3 py-1 bg-blue-500 text-white rounded-full">
              {profile.role.toUpperCase()}
            </p>
          )}

          {profile.bio && <p className="mt-3 text-center">{profile.bio}</p>}
          {profile.location && (
            <p className="mt-2 text-gray-500 dark:text-gray-400">{profile.location}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OthersProfile;
