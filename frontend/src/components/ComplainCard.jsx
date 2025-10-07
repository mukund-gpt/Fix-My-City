import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ComplaintCard = ({ complaint }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!complaint) return null;

  const {
    urgency,
    title,
    description,
    photo,
    status,
    citizen,
    createdAt,
    updatedAt,
  } = complaint;

  return (
    <Card
      sx={{
        mb: 2,
        color: "white",
        border: "1px solid #374151",
        boxShadow: 3,
      }}
    >
      <CardContent>
        {/* Citizen Info */}
        {citizen?._id !== user?._id && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
            }}
            onClick={() => navigate(`/profile/${citizen?._id}`)}
          >
            <Avatar sx={{ bgcolor: "#facc15" }}>
              {citizen?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "black" }}
              >
                {citizen?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                {citizen?.email}
              </Typography>
            </Box>
            <Chip
              label={urgency}
              color={
                urgency === "HIGH"
                  ? "error"
                  : urgency === "MEDIUM"
                  ? "warning"
                  : "default"
              }
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}

        {citizen?._id !== user?._id && (
          <Divider sx={{ bgcolor: "#374151", mb: 2 }} />
        )}

        {/* Complaint Title & Description */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#fbbf24",
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#d1d5db",
            mb: 2,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        {/* Photo */}
        {photo && (
          <Box
            component="img"
            src={photo.replace(/\\/g, "/")}
            alt={title}
            sx={{
              width: "100%",
              height: 250,
              objectFit: "cover",
              borderRadius: 1,
              mb: 2,
            }}
          />
        )}

        <Divider sx={{ bgcolor: "#374151", mb: 2 }} />

        {/* Status and timestamps */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              Status:
            </Typography>
            <Chip
              label={status.replace("_", " ")}
              size="small"
              sx={{
                fontWeight: 600,
                color: "white",
                backgroundColor:
                  status === "OPEN"
                    ? "#ef4444"
                    : status === "IN_PROGRESS"
                    ? "#f59e0b"
                    : "#22c55e",
              }}
            />
          </Box>

          <Typography variant="caption" sx={{ color: "#6b7280" }}>
            Created: {new Date(createdAt).toLocaleDateString()}{" "}
            {new Date(createdAt).toLocaleTimeString()}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: "#6b7280" }}>
            Updated: {new Date(updatedAt).toLocaleDateString()}{" "}
            {new Date(updatedAt).toLocaleTimeString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ComplaintCard;
