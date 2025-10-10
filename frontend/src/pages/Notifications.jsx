import axiosInstance from '@/api/axiosinstance';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import { Box, Button, CircularProgress, Divider, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from 'react-redux';
// import io from 'socket.io-client'; 
// import { socketConnection } from '../';
// --- MOCK DATA (Replaces samplenotification) ---
const mockNotifications = [
    { id: 1, title: "Complaint Assigned", description: "Complaint #CP1092 has been assigned to your department (Maintenance).", type: "assignment", isRead: false, timestamp: new Date(Date.now() - 3600000) },
    { id: 2, title: "New User Registered", description: "A new user, Jane Doe, has successfully registered.", type: "system", isRead: false, timestamp: new Date(Date.now() - 7200000) },
    { id: 3, title: "Status Update", description: "Complaint #CP0015 status updated to 'In Progress'.", type: "update", isRead: true, timestamp: new Date(Date.now() - 10800000) },
    { id: 4, title: "Urgent: System Alert", description: "Database backup failed last night. Action required.", type: "alert", isRead: false, timestamp: new Date(Date.now() - 14400000) },
    { id: 5, title: "New Complaint Received", description: "A new urgent complaint about lighting outage has arrived.", type: "new_complaint", isRead: true, timestamp: new Date(Date.now() - 18000000) },
    { id: 6, title: "Test Notification 1", description: "This is a past notification item.", type: "update", isRead: true, timestamp: new Date(Date.now() - 21600000) },
    { id: 7, title: "Test Notification 2", description: "This is another past notification item.", type: "update", isRead: true, timestamp: new Date(Date.now() - 25200000) },
];

const useTimeAgo = (timestamp) => {
    return useMemo(() => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }, [timestamp]);
};

// Function to simulate fetching a chunk of data
const fetchNotificationChunk = (offset, limit) => {
    // Sort mock data by timestamp (most recent first)
    const sortedData = mockNotifications.sort((a, b) => b.timestamp - a.timestamp);
    
    // Simulate pagination
    return new Promise((resolve) => {
        setTimeout(() => {
            const chunk = sortedData.slice(offset, offset + limit);
            resolve({
                data: chunk,
                hasMore: offset + limit < sortedData.length,
            });
        }, 500); // Simulate network delay
    });
};

// --- Sub-Component for a Single Notification Item ---
const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
    const { id, title, description, isRead, timestamp } = notification;

    const timeAgo = useMemo(() => {
        const seconds = Math.floor((new Date() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }, [timestamp]);

    const statusClasses = isRead 
        ? "bg-white text-gray-500 hover:shadow-md"
        : "bg-indigo-50 border-l-4 border-indigo-500 text-gray-800 font-medium hover:bg-indigo-100 shadow-lg";

    return (
        <ListItem 
            className={`transition duration-300 ease-in-out rounded-lg mb-2 p-4 ${statusClasses}`}
            secondaryAction={
                <ListItemSecondaryAction className="flex space-x-2 mr-2">
                    <IconButton 
                        edge="end" 
                        aria-label={isRead ? "Mark Unread" : "Mark Read"} 
                        onClick={() => onMarkAsRead(id)}
                        size="small"
                        color={isRead ? "default" : "primary"}
                    >
                        {isRead ? <MarkEmailReadIcon fontSize="small" /> : <MarkEmailUnreadIcon fontSize="small" />}
                    </IconButton>
                    <IconButton 
                        edge="end" 
                        aria-label="Delete" 
                        onClick={() => onDelete(id)}
                        size="small"
                        color="error"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </ListItemSecondaryAction>
            }
        >
            <ListItemText
                primary={
                    <Box className="flex items-center space-x-2">
                        {!isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                        )}
                        <Typography variant="body1" className={!isRead ? "font-bold" : "font-semibold"}>
                            {title}
                        </Typography>
                        <Typography variant="caption" className="text-gray-400 flex-shrink-0">
                            — {timeAgo}
                        </Typography>
                    </Box>
                }
                secondary={description}
                classes={{ secondary: 'text-sm mt-1' }}
            />
        </ListItem>
    );
};


// --- Main Notifications Component ---
const Notifications = () => {
    const NOTIFICATIONS_PER_LOAD = 5;
    const socket = useMemo(() => io(process.env.VITE_BACKEND_URL || 'http://localhost:5000'), []);
    const {  userRole,user } = useSelector((state)=>state.auth);
    
    const [notifications, setNotifications] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Fetch notifications function
    const fetchNotifications = useCallback(async (isLoadMore = false) => {
        if (!hasMore && isLoadMore) {
            toast.info("No more notifications to load.");
            return;
        }
        
        setLoading(true);
        const currentOffset = isLoadMore ? offset : 0;
        const url = `/notifications?limit=${NOTIFICATIONS_PER_LOAD}&offset=${currentOffset}`;

        try {
            const response = await axiosInstance(url,
                {
                    headers:
                        {
                            Authorization:`Bearer ${user?.token}`
                        }
                });
            console.log(response);
            
            if (!response.data.ok) {
                toast.error("Error Occured during Notification loading")
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const { data, meta } = response.data;
            
            setNotifications(prev => 
                isLoadMore ? [...prev, ...data] : data
            );
            setOffset(currentOffset + data.length);
            setHasMore(meta.hasMore);
            
            if (data.length === 0 && !isLoadMore) {
                toast.success("Your notification inbox is empty.");
            } else if (isLoadMore && data.length > 0) {
                toast.success(`Loaded ${data.length} new notifications.`);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    }, [hasMore, offset]);

    useEffect(() => {
        fetchNotifications(false);
    }, [fetchNotifications]);

    useEffect(() => {
        if (!user || !user.id || !socket) return;

        socket.emit("register-user", user.id); 

        const handleNewNotification = (newNotification) => {
            toast.success(newNotification.title, {
                duration: 5000,
                icon: '🔔',
                style: {
                    background: '#6366f1', // indigo-500
                    color: '#fff',
                }
            });

            setNotifications(prev => [
                {
                    ...newNotification,
                    // Ensure timestamp is a Date object for your helper component
                    timestamp: new Date(newNotification.createdAt) 
                }, 
                ...prev
            ]);
            
        };

        // 2. Set up the listener for the real-time event
        socket.on('new-notification', handleNewNotification);

        // 3. Cleanup function: runs on unmount or dependency change
        return () => {
            socket.off('new-notification', handleNewNotification);
            // Optionally, disconnect or unregister user
            // socket.emit("unregister-user", user.id); 
        };
    }, [socket, user]); 

    // Handle marking a notification as read/unread
    const handleMarkAsRead = (notificationId) => {
        setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, isRead: !n.isRead } : n
        ));
        toast.success(
            notifications.find(n => n.id === notificationId)?.isRead 
            ? "Marked as unread." 
            : "Marked as read."
        );
        // Add actual API call logic here
    };
    
    // Handle deleting a notification
    const handleDeleteNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success("Notification deleted.");
        // Add actual API call logic here
    };

    const handleLoadMore = () => {
        if (!loading) {
            fetchNotifications(true);
        }
    };
    
    // Derived state for the unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Box className="p-6 bg-gray-50 min-h-screen">
            <Box className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                
                {/* Header */}
                <Typography variant="h4" component="h1" className="font-extrabold text-gray-800 mb-2 border-b pb-2">
                    Your Notifications
                </Typography>
                <Box className="flex justify-between items-center mb-6">
                    <Typography variant="h6" className="text-indigo-600 font-semibold">
                        {unreadCount > 0 
                            ? `${unreadCount} unread items` 
                            : 'All caught up!'}
                    </Typography>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => {
                            // Logic to mark all as read
                            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                            toast.success("All notifications marked as read.");
                        }}
                        disabled={unreadCount === 0 || loading}
                    >
                        Mark All Read
                    </Button>
                </Box>
                
                {/* Notification List */}
                <List className="p-0">
                    {notifications.length === 0 && !loading ? (
                         <Box className="text-center p-10 bg-gray-100 rounded-lg">
                            <Typography variant="h6" className="text-gray-500">
                                Nothing here yet.
                            </Typography>
                            <Typography variant="body2" className="text-gray-400">
                                Check back later for updates.
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notification, index) => (
                            <div key={notification.id}>
                                <NotificationItem 
                                    notification={notification} 
                                    onMarkAsRead={handleMarkAsRead} 
                                    onDelete={handleDeleteNotification}
                                />
                                {index < notifications.length - 1 && <Divider component="li" className="!my-2" />}
                            </div>
                        ))
                    )}
                </List>

                {/* Load More Button */}
                <Box className="text-center mt-6">
                    {loading && notifications.length > 0 ? (
                        <CircularProgress size={24} className="text-indigo-600" />
                    ) : hasMore && notifications.length > 0 && (
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            onClick={handleLoadMore} 
                            disabled={loading}
                            className="shadow-lg"
                        >
                            Load More Notifications
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Notifications;
