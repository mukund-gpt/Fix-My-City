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
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
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

          <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
          <p className="text-slate-500">{profile.email}</p>

          {profile.role && (
            <p className="mt-1 text-sm px-3 py-1 bg-blue-500 text-white rounded-full">
              {profile.role.toUpperCase()}
            </p>
          )}

          {profile.bio && <p className="mt-3 text-center">{profile.bio}</p>}
          {profile.location && (
            <p className="mt-2 text-slate-500">{profile.location}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OthersProfile;
