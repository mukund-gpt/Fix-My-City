import { Avatar, Box, Card, CardContent, Chip, Divider, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ComplaintCard = ({ complaint }) => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
  if (!complaint) return null;

  const { urgency, title, description, photo, status, citizen, createdAt, updatedAt } = complaint;

  return (
    <Card className="mb-4 bg-gray-900 text-white border border-gray-700 shadow-lg">
      <CardContent>
        {/* Citizen Info */}
        {citizen?._id !== user?._id && (
                  <Box className="flex items-center space-x-3 mb-3"
                  onclick={() => navigate(`/profile/${citizen?._id}`)}>
            <Avatar>{citizen?.name?.[0]}</Avatar>
            <Box>
              <Typography variant="subtitle1" className="font-bold">
                {citizen?.name}
              </Typography>
              <Typography variant="caption" className="text-gray-400">
                {citizen?.email}
              </Typography>
            </Box>
            <Chip
              label={urgency}
              color={
                urgency === "HIGH" ? "error" : urgency === "MEDIUM" ? "warning" : "default"
              }
              size="small"
              className="ml-auto font-semibold"
            />
          </Box>
        )}

        <Divider className="bg-gray-700 mb-3" />

        {/* Complaint Title & Description */}
        <Typography variant="h6" className="font-semibold text-yellow-400">
          {title}
        </Typography>
        <Typography variant="body2" className="text-gray-300 mb-2">
          {description}
        </Typography>

        {/* Photo */}
        {photo && (
          <img
            src={photo.replace("\\", "/")} // Replace backslash with slash
            alt={title}
            className="w-full h-48 object-cover rounded-md mb-2"
          />
        )}

        <Divider className="bg-gray-700 mb-2" />

        {/* Status and timestamps */}
        <Box className="flex justify-between items-center text-sm text-gray-400">
          <Box>
            <Typography variant="body2" component="span">
              Status:{" "}
            </Typography>
            <Typography
              variant="body2"
              component="span"
              sx={{
                display: "inline-block",
                px: 2,
                py: 0.5,
                borderRadius: "9999px",
                fontWeight: 600,
                color: "white",
                backgroundColor:
                  status === "OPEN"
                    ? "#ef4444"
                    : status === "IN_PROGRESS"
                    ? "#facc15"
                    : "#22c55e",
              }}
            >
              {status}
            </Typography>
          </Box>

          <Typography variant="body2">
            Created: {new Date(createdAt).toLocaleString()}
          </Typography>
        </Box>

        <Box className="flex justify-end text-xs text-gray-500 mt-1">
          <Typography>Updated: {new Date(updatedAt).toLocaleString()}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ComplaintCard;
