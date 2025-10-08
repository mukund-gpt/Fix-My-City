import { useEffect, useState } from "react";
// Importing icons for visual clarity
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosinstance";


const roles = [
     { name: 'Citizens', key: 'citizen' },
    { name: 'Admins', key: 'admin' },
    { name: 'Staff', key: 'staff' },
   
];



const Users = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    
    const fetchUsers = async () => {
        if (user.role !== 'admin') {
            setError("Access denied. Only administrators can view user data.");
            setLoading(false);
            return;
        }

        try {
            let apiUrl = "/admin/users";
            if (selectedRole !== 'all') {
                apiUrl += `?role=${selectedRole}`;
            }
            const res = await axiosInstance.get(apiUrl, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setUsers(res.data.users);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load user list.");
        } finally {
            setLoading(false);
        }
    };
    
    fetchUsers();
  }, [dispatch, user?.role, user.token,selectedRole]);
  
  // Helper to determine role badge color
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white shadow-md">ADMIN</span>;
      case 'staff':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500 text-white shadow-md">STAFF</span>;
      case 'citizen':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white shadow-md">CITIZEN</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500 text-white">{role.toUpperCase()}</span>;
    }
  };

  // Helper to determine status badge color
  const getStatusBadge = (status) => {
    const isSuspended = status === 'Suspended';
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${isSuspended ? 'bg-yellow-800 text-yellow-200' : 'bg-green-700 text-green-200'}`}>
            {status}
        </span>
    );
  };


  if (user.role !== 'admin') {
      return (
          <div className="min-h-screen bg-gray-900 p-8 text-white flex justify-center items-center">
              <div className="p-8 bg-gray-800 rounded-xl border border-red-700 text-red-400 shadow-xl">
                  <h2 className="text-2xl font-bold mb-4">Permission Denied</h2>
                  <p>You must be an administrator to access the User Management page.</p>
              </div>
          </div>
      );
  }

  if (loading) return (
      <div className="min-h-screen bg-gray-900 p-8 text-white flex justify-center items-center">
          <div className="flex items-center text-yellow-400 text-xl font-medium">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading user list...
          </div>
      </div>
  );
    
  if (error) return (
      <div className="min-h-screen bg-gray-900 p-8 text-white flex justify-center items-center">
          <div className="p-8 bg-gray-800 rounded-xl border border-red-700 text-red-400 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p>{error}</p>
          </div>
      </div>
  );

  return (
   <div className="min-h-screen bg-gray-900 p-4 sm:p-8 text-white">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-extrabold mb-2 text-indigo-400 flex items-center">
                <AccountCircleIcon className="mr-3 text-5xl" />
                User Management Console
            </h1>
            <p className="mb-6 text-gray-400">
                View, manage, and audit all user accounts across the system. Total users: <span className="font-bold text-yellow-400">{users.length}</span>
            </p>

            {/* NEW: Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
                {roles.map((role) => (
                    <button
                        key={role.key}
                        onClick={() => {
                            setLoading(true); // Manually set loading true to show spinner while fetching
                            setSelectedRole(role.key);
                        }}
                        className={`
                            px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out
                            ${selectedRole === role.key 
                                ? 'bg-indigo-500 text-white shadow-lg ring-2 ring-indigo-300' 
                                : 'bg-gray-700 text-gray-300 hover:bg-indigo-400 hover:text-gray-900'
                            }
                        `}
                    >
                        {role.name}
                    </button>
                ))}
            </div>

            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-x-auto border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-700 transition duration-150">
                                {/* Name */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {u.name}
                                </td>
                                {/* Email */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell">
                                    {u.email}
                                </td>
                                {/* Role */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {getRoleBadge(u.role)}
                                </td>
                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                                    {getStatusBadge(u.status)}
                                </td>
                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button
                                        onClick={() => navigate(`/profile/${u._id}`)}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-200 bg-indigo-700 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-lg"
                                        title={`View profile for ${u.name}`}
                                    >
                                        <VisibilityIcon className="w-4 h-4 mr-1" />
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && !loading && (
                 <div className="mt-8 p-12 text-center text-gray-400 border border-gray-700 rounded-xl bg-gray-800">
                    <p className="text-xl">No users found in the system for this filter.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Users;
