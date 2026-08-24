import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Drawer,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleOpen = () => {
    setFormData({
      name: user.name,
      email: user.email,
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    console.log("Save updated data:", formData);
    handleClose();
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl justify-center">
        <Card
          className="
          rounded-2xl shadow-2xl w-96 
          bg-white text-slate-900
          overflow-hidden border border-slate-200
          transform transition-transform duration-500 ease-in-out
          hover:shadow-yellow-500/30
        "
          sx={{ backdropFilter: "blur(8px)" }}
        >
          {/* Header Section */}
          <Box className="flex flex-col items-center bg-gradient-to-r from-yellow-500 to-yellow-400 p-6 relative">
            <Avatar
              alt={user.name}
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              sx={{
                width: 100,
                height: 100,
                border: "4px solid white",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                transition: "transform 0.4s ease-in-out",
                "&:hover": { transform: "scale(1.1)" },
              }}
            />
            <Typography
              variant="h5"
              className="font-bold mt-4 text-gray-900"
              sx={{ fontWeight: 700 }}
            >
              {user.name}
            </Typography>
            <Typography variant="body2" className="text-gray-800 font-medium">
              {user.role.toUpperCase()}
            </Typography>
          </Box>

          {/* Info Section */}
          <CardContent className="p-6 space-y-4">
            <Divider className="bg-slate-200" />

            <div>
              <Typography
                variant="subtitle2"
                className="uppercase tracking-wider text-slate-500"
              >
                Email
              </Typography>
              <Typography
                variant="body1"
                className="font-medium text-slate-900"
              >
                {user.email}
              </Typography>
            </div>

            <Divider className="bg-slate-200" />

            <div>
              <Typography
                variant="subtitle2"
                className="uppercase tracking-wider text-slate-500"
              >
                Role
              </Typography>
              <Typography
                variant="body1"
                className="font-medium text-slate-900"
              >
                {user.role}
              </Typography>
            </div>

            <Divider className="bg-slate-200" />

            <div>
              <Typography
                variant="subtitle2"
                className="text-gray-400 uppercase tracking-wider"
              >
                User ID
              </Typography>
              <Typography
                variant="body2"
                className="break-words text-slate-600"
              >
                {user._id}
              </Typography>
            </div>

            <Divider className="bg-slate-200" />

            {/* Action Button */}
            <Button
              variant="contained"
              onClick={handleOpen}
              fullWidth
              className="
              mt-4 rounded-lg bg-yellow-500 hover:bg-yellow-600 
              text-black font-semibold transition-all duration-300 
              shadow-lg hover:shadow-2xl
            "
            >
              Edit Profile
            </Button>

            <Drawer anchor="right" open={open} onClose={handleClose}>
              <Box className="p-6 w-80 flex flex-col gap-4">
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                />
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Box>
            </Drawer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
