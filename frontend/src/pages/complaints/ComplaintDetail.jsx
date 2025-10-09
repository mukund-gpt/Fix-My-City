import CloseIcon from '@mui/icons-material/Close'; // Added for the Drawer close button
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Typography } from "@mui/material"; // Imported Drawer
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosinstance.js";
import ComplaintCard from "../../components/ComplainCard.jsx";
import StaffSearch from "../admin/Search.jsx";

// Define the Drawer width (e.g., 500px, which is generous for StaffSearch)
const DRAWER_WIDTH = 500; 

const ComplaintDetail = () => {
    const { id } = useParams();
    const { userRole, user } = useSelector((state) => state.auth);
    const [complaint, setComplaint] = useState(null);
    const [selectedStaffIds, setSelectedStaffIds] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Renamed showAssign to isDrawerOpen
    const token = user?.token;

    // Fetch complaint
    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const res = await axiosInstance.get(`/complaints/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const fetchedComplaint = res.data;
                setComplaint(fetchedComplaint);

                const initialIds = fetchedComplaint.assignedTo 
                    ? fetchedComplaint.assignedTo.map(staff => staff._id)
                    : [];
                setSelectedStaffIds(initialIds);
            } catch (error) {
                console.error(error);
                toast.error(error.message || "Error fetching complaint");
            }
        };

        if (token) {
            fetchComplaint();
        }
    }, [id, token]);

    // Handle assignment API call
    const handleAssignStaff = async (selectedIds) => {
        try {
            if (selectedIds.length === 0) {
                toast("Please select at least one staff member.", { icon: '⚠️' });
                return;
            }

            const res = await axiosInstance.put(
                `/admin/complaints/assign`,
                { complaintId: complaint._id, userIds: selectedIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedComplaint = res?.data?.complaint;
            setComplaint(updatedComplaint);
            
            const updatedIds = updatedComplaint.assignedTo 
                ? updatedComplaint.assignedTo.map(staff => staff._id)
                : [];
            setSelectedStaffIds(updatedIds);

            toast.success("Complaint assigned successfully!");
            setIsDrawerOpen(false); // Close drawer after success
        } catch (err) {
            console.error(err);
            toast.error("Failed to assign staff");
        }
    };

    if (!complaint)
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <CircularProgress />
                <p className="ml-4 text-xl text-gray-700">Loading complaint details...</p>
            </div>
        );

    return (
        <Box sx={{ flexGrow: 1 }} className="bg-gray-100 min-h-screen">
            
            <div className="p-6 max-w-7xl mx-auto ">
                <h1 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-2">Complaint Resolution Hub</h1>
                
                {/* --- Two-Column Layout (Adjusted to a 2/1 split for better Complaint Card visibility) --- */}
                {/* The Assignment Button will now live in the right column */}
                <div className={`grid ${userRole === 'admin' ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    
                    {/* LEFT SIDE: Complaint Detail (Takes 2/3 width) */}
                    <div className={userRole === 'admin' ? 'lg:col-span-2' : 'col-span-1'}> 
                        <Box className="bg-white p-6 rounded-xl shadow-2xl h-full">
                            <Typography variant="h5" component="h2" className="font-bold text-gray-800 mb-4 border-b pb-2">
                                Complaint Details
                            </Typography>
                            <ComplaintCard complaint={complaint} />
                        </Box>
                    </div>

                    {/* RIGHT SIDE: Admin Actions Panel (Takes 1/3 width) */}
                    {userRole === "admin" && (
                        <Box className="lg:col-span-1"> 
                            <Box className="bg-white p-6 rounded-xl shadow-2xl sticky top-4">
                                
                                <Typography variant="h6" component="h2" className="font-bold text-indigo-600 mb-4">
                                    Admin Actions
                                </Typography>
                                <Divider className="mb-4" />

                                {/* Currently Assigned Staff */}
                                <Box className="mb-6">
                                    <Typography variant="subtitle1" className="font-bold text-gray-700 mb-2">
                                        Assigned Staff:
                                    </Typography>
                                    {complaint.assignedTo && complaint.assignedTo.length > 0 ? (
                                        <ul className="list-none space-y-1">
                                            {complaint.assignedTo.map((staff) => (
                                                <li key={staff._id} className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                                                    <span className="font-medium text-indigo-700">{staff.name}</span> ({staff.email})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-red-500 font-medium">No staff assigned yet.</p>
                                    )}
                                </Box>
                                <Divider className="mb-4" />

                                {/* Assignment Toggle Button (Opens Drawer) */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => setIsDrawerOpen(true)}
                                >
                                    Assign / Re-assign Staff
                                </Button>
                            </Box>
                        </Box>
                    )}
                </div>
                {/* ------------------------------- */}
            </div>
            
            {/* --- Assignment Drawer --- */}
            <Drawer
                anchor="right"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
                }}
            >
                <Box className="p-6 h-full flex flex-col bg-gray-50">
                    
                    {/* Drawer Header */}
                    <Box className="flex justify-between items-center mb-6 pb-4 border-b">
                        <Typography variant="h5" component="h2" className="font-bold text-indigo-700">
                            Assign Staff to Complaint
                        </Typography>
                        <IconButton onClick={() => setIsDrawerOpen(false)} aria-label="close" size="large">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Staff Search Content */}
                    <Box className="flex-grow overflow-y-auto mb-4">
                        <Typography variant="subtitle1" className="mb-3 font-bold text-gray-700">
                            Search and Select Staff:
                        </Typography>
                        <StaffSearch
                            selectedStaff={selectedStaffIds} 
                            onChange={setSelectedStaffIds} 
                        />
                    </Box>

                    {/* Action Buttons (Fixed at the bottom) */}
                    <Box className="pt-4 border-t flex space-x-3">
                        <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            onClick={() => handleAssignStaff(selectedStaffIds)}
                        >
                            Save Assignment
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={() => setIsDrawerOpen(false)}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Drawer>
            {/* --------------------------- */}
        </Box>
    );
};

export default ComplaintDetail;