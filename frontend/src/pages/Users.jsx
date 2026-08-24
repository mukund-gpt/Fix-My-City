import { useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosinstance";

const roles = [
  { name: "Citizens", key: "citizen" },
  { name: "Admins", key: "admin" },
  { name: "Staff", key: "staff" },
];

const Users = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      if (user.role !== "admin") {
        setError("Access denied. Only administrators can view user data.");
        setLoading(false);
        return;
      }

      try {
        let apiUrl = "/admin/users";
        if (selectedRole !== "all") {
          apiUrl += `?role=${selectedRole}`;
        }
        const res = await axiosInstance.get(apiUrl, {
          headers: { Authorization: `Bearer ${user.token}` },
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
  }, [user?.role, user?.token, selectedRole]);

  // Helper to determine role badge color
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white shadow-md">
            ADMIN
          </span>
        );
      case "staff":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500 text-white shadow-md">
            STAFF
          </span>
        );
      case "citizen":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white shadow-md">
            CITIZEN
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500 text-white">
            {role.toUpperCase()}
          </span>
        );
    }
  };

  // Helper to determine status badge color
  const getStatusBadge = (status) => {
    const isSuspended = status === "Suspended";
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-lg ${
          isSuspended
            ? "bg-yellow-800 text-yellow-200"
            : "bg-green-700 text-green-200"
        }`}
      >
        {status}
      </span>
    );
  };

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-slate-900">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-red-600 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Permission Denied</h2>
          <p>
            You must be an administrator to access the User Management page.
          </p>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-slate-900">
        <div className="flex items-center text-yellow-400 text-xl font-medium">
          <svg
            className="animate-spin -ml-1 mr-3 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading user list...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-slate-900">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-red-600 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-2 text-indigo-400 flex items-center">
          <AccountCircleIcon className="mr-3 text-5xl" />
          User Management Console
        </h1>
        <p className="mb-6 text-gray-400">
          View, manage, and audit all user accounts across the system. Total
          users:
          <span className="font-bold text-yellow-400">{users.length}</span>
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
                            ${
                              selectedRole === role.key
                                ? "bg-indigo-500 text-white shadow-lg ring-2 ring-indigo-300"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                            }
                        `}
            >
              {role.name}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="transition duration-150"
                >
                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {u.name}
                  </td>
                  {/* Email */}
                  <td className="hidden px-6 py-4 whitespace-nowrap text-sm text-slate-500 sm:table-cell">
                    {u.email}
                  </td>
                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getRoleBadge(u.role)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <p className="text-xl">
              No users found in the system for this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
