import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Box = ({ children, className, onClick }) => (
  <div className={`${className}`} onClick={onClick}>
    {children}
  </div>
);
const Card = ({ children, className, onClick }) => (
  <div className={`rounded-2xl shadow-lg ${className}`} onClick={onClick}>
    {children}
  </div>
);
const CardContent = ({ children, className }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
const Chip = ({ label, className }) => (
  <span
    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${className}`}
  >
    {label}
  </span>
);
const Divider = ({ className }) => (
  <hr className={`my-4 border-gray-200 ${className}`} />
);
const Typography = ({ variant, children, className }) => {
  const getStyle = (variant) => {
    switch (variant) {
      case "h3":
        return "text-3xl font-bold font-poppins";
      case "h5":
        return "text-xl font-bold font-poppins";
      case "subtitle1":
        return "text-base font-semibold font-opensans";
      case "body1":
        return "text-base font-opensans";
      case "body2":
        return "text-sm font-opensans";
      case "caption":
        return "text-xs font-opensans";
      default:
        return "font-opensans";
    }
  };
  // Mock font families are used here (poppins/opensans) but rely on being externally loaded.
  return <p className={`${getStyle(variant)} ${className}`}>{children}</p>;
};

// --- Mock Complaint Data for demonstration ---
const mockComplaint = {
  _id: "C-48293",
  urgency: "HIGH",
  title: "Large Pothole at Main Street and Elm",
  description:
    "There is a massive pothole in the intersection that has already caused two cars to damage their tires. It's about 3 feet wide and nearly a foot deep. Needs urgent attention as it's a major safety hazard.",
  photos: [
    "https://placehold.co/600x400/800080/FFFFFF?text=Pothole+View+1",
    "https://placehold.co/600x400/FFA500/000000?text=Pothole+View+2",
    "https://placehold.co/600x400/008000/FFFFFF?text=Pothole+View+3",
  ],
  status: "OPEN",
  citizen: { name: "Jane Doe" },
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due in 2 days
  isOverdue: false,
  assignedTo: [{ id: 1, name: "Maintenance Team A" }],
  location: "Main St & Elm Ave",
  latitude: 34.0522,
  longitude: -118.2437,
};

const ComplaintCard = ({ complaint = mockComplaint, isShow = false }) => {
  const navigate = useNavigate();

  // --- State for Image Carousel ---
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!complaint) return null;

  const {
    _id,
    urgency,
    title,
    description,
    photos,
    status,
    citizen,
    createdAt,
    deadline,
    isOverdue,
    assignedTo,
  } = complaint;

  // --- Dynamic Media List (Carousel Data) ---
  const mediaItems = useMemo(() => {
    // Start with all user-uploaded photos
    let items = photos ? [...photos] : [];

    if (items.length === 0) {
      // Use a cleaner no-photo placeholder
      items.push(
        "https://placehold.co/600x400/D1D5DB/ffffff?text=No+Photo+Available"
      );
    }

    return items;
  }, [photos]);

  const totalMedia = mediaItems.length;
  const currentMediaUrl = mediaItems[currentPhotoIndex];

  // Reset index when photos list changes (useful if complaint object is swapped)
  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [photos]);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % totalMedia);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex(
      (prevIndex) => (prevIndex - 1 + totalMedia) % totalMedia
    );
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-red-600 text-white shadow-red-500/50";
      case "IN_PROGRESS":
        return "bg-teal-500 text-white shadow-teal-500/50";
      case "RESOLVED":
        return "bg-green-600 text-white shadow-green-500/50";
      default:
        return "bg-gray-400 text-gray-800";
    }
  };

  const getUrgencyClasses = (urgency) => {
    switch (urgency) {
      case "HIGH":
        return "border-red-500 text-red-600 bg-white";
      case "MEDIUM":
        return "border-orange-500 text-orange-600 bg-white";
      default:
        return "border-green-500 text-green-600 bg-white";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isAssigned = assignedTo && assignedTo.length > 0;

  // --- Component Structure ---
  return (
    <Card
      className={`
        relative bg-gray-800/50 rounded-2xl p-0
        shadow-2xl overflow-hidden 
        transition-all duration-500 transform 
        hover:scale-[1.01] cursor-pointer
        font-opensans
        border-gray-700 border
      `}
      onClick={() => navigate(`/complaint/${_id}`)}
    >
      {/* Dynamic Header with Status */}
      <div
        className={`p-4 font-poppins font-extrabold uppercase text-center 
        ${getStatusClasses(status)}
        text-shadow-sm
        ${isOverdue && status !== "RESOLVED" ? "animate-pulse" : ""}
      `}
      >
        {isOverdue && status !== "RESOLVED" ? (
          <span className="flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>SLA VIOLATION - OVERDUE</span>
          </span>
        ) : (
          `Status: ${status?.replace("_", " ")}`
        )}
      </div>

      {/* Main Content Area */}
      <CardContent className="relative z-10">
        {/* Title & Urgency Badge */}
        <Box className="flex justify-between items-start mb-4">
          <Typography
            variant="h5"
            className="text-white dark:text-white leading-tight pr-4 font-poppins"
          >
            {title}
          </Typography>
          <Chip
            label={urgency}
            className={`font-extrabold shadow-md border-2 ${getUrgencyClasses(
              urgency
            )} transform hover:scale-105 transition duration-300`}
          />
        </Box>
        {/* Photo Carousel Area */}
        {totalMedia > 0 && (
          <Box className="w-full h-80 overflow-hidden rounded-xl mb-4 shadow-xl border border-gray-200 dark:border-gray-700 relative group">
            {/* Image */}
            <img
              key={currentMediaUrl} // Force re-render on image change
              src={currentMediaUrl}
              alt={`${title} - View ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-700 ease-in-out transform"
            />

            {/* Photo Counter */}
            <Chip
              label={`${currentPhotoIndex + 1} / ${totalMedia}`}
              className="absolute top-2 right-2 bg-gray-900/80 text-white shadow-lg text-xs"
            />

            {/* Carousel Controls (Show only if more than one photo exists) */}
            {totalMedia > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80 z-20"
                  aria-label="Previous photo"
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80 z-20"
                  aria-label="Next photo"
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Navigation Dots */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
                  {mediaItems.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                        index === currentPhotoIndex
                          ? "bg-white shadow-lg"
                          : "bg-gray-400/70"
                      } cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex(index);
                      }}
                    ></div>
                  ))}
                </div>
              </>
            )}
          </Box>
        )}
        {/* Description Snippet */}
        <Typography
          variant="body2"
          className="text-gray-300 dark:text-gray-300 mb-4 line-clamp-3 text-sm"
        >
          {description}
        </Typography>
        <Divider className="border-gray-300 dark:border-gray-700" />
        {/* Metrics & Details Grid */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm font-medium mt-4">
          {/* Created By / Citizen */}
          <Box className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-500 dark:text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <Typography
              variant="body2"
              className="text-gray-200 dark:text-gray-400"
            >
              Filed by:{" "}
            </Typography>
            <Typography
              variant="body1"
              className="text-gray-200 dark:text-white font-semibold"
            >
              {citizen?.name || "Anonymous"}
            </Typography>
          </Box>

          {/* Assigned To */}
          <Box className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-teal-500 dark:text-teal-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            <Typography
              variant="body2"
              className="text-gray-200 dark:text-gray-400"
            >
              Assigned:{" "}
            </Typography>
            <Typography
              variant="body1"
              className={`font-semibold ${
                isAssigned
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-gray-400 italic"
              }`}
            >
              {isAssigned ? `${assignedTo.length} Staff` : "Unassigned"}
            </Typography>
          </Box>
        </Box>
        <Divider className="border-gray-300 dark:border-gray-700" />

        {isShow &&
          assignedTo?.map((staff, idx) => (
            <span
              key={staff.id}
              className="ml-6 text-gray-300 dark:text-gray-300 font-normal"
            >
              🎯{staff.name}
              <br />
            </span>
          ))}
        {/* Deadline and Timestamps */}
        <Box className="flex justify-between items-center text-xs mt-4">
          <Box
            className={`p-2 rounded-lg font-bold ${
              isOverdue
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            }`}
          >
            SLA Due: {formatDate(deadline)}
          </Box>
          <Typography variant="caption" className="text-gray-300">
            Opened: {formatDate(createdAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ComplaintCard;
