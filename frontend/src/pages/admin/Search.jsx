import {
  Checkbox,
  CircularProgress,
  Paper, // New: For the search input
  Table,
  TableBody,
  TableCell,
  TableContainer, // New: To wrap the scrollable table
  TableHead,
  TableRow,
  TextField, // New: For the search input
} from "@mui/material";
import { useEffect, useState } from "react";
// NOTE: Ensure this path is correct for your project
import axiosInstance from "../../api/axiosinstance";
import { useSelector } from "react-redux";

// Sets the fixed height and enables vertical scrolling (Tailwind CSS classes)
// h-48 is approx 12rem/192px, fitting 3-4 rows
const SCROLL_CONTAINER_CLASSES = "h-105 overflow-y-auto";

export default function StaffSearch({ selectedStaff = [], onChange }) {
  const [query, setQuery] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  // selected holds the full staff objects
  const [selected, setSelected] = useState(selectedStaff || []);
  const token = useSelector((state) => state.auth.user?.token);

  // Fetch staff from backend
  const fetchStaff = async (search = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/staff?search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setStaffList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setStaffList([]);
    }
    setLoading(false);
  };

  // Fetch all staff initially
  useEffect(() => {
    fetchStaff();
  }, [token]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => fetchStaff(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Handle staff selection toggle
  const handleToggle = (staff) => {
    let updated;
    if (selected.some((s) => s._id === staff._id)) {
      // Deselect
      updated = selected.filter((s) => s._id !== staff._id);
    } else {
      // Select
      updated = [...selected, staff];
    }
    console.log(selected);

    setSelected(updated);
    // Pass only the array of IDs back to the parent component
    onChange && onChange(updated.map((s) => s._id));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-xl">
      {/* 1. Enhanced Search Input (MUI TextField) */}
      <TextField
        fullWidth
        label="Search Staff by Department, Name, or Email"
        variant="outlined"
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4" // Tailwind margin bottom
      />

      {/* 2. Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <CircularProgress color="primary" />
        </div>
      ) : (
        // 3. Scrollable Table Container
        // Paper adds an elevated look, className handles the fixed height and scroll
        <TableContainer component={Paper} className={SCROLL_CONTAINER_CLASSES}>
          <Table stickyHeader size="small">
            {/* Table Header (Sticky) */}
            <TableHead>
              <TableRow className="bg-gray-100">
                {" "}
                {/* Tailwind background color */}
                <TableCell style={{ width: 50 }}>
                  <span className="font-semibold text-gray-700">Select</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gray-700">
                    Staff Name / Department
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gray-700">Email</span>
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {staffList.length === 0 && query !== "" ? (
                // No search results found
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                    className="py-4 text-gray-500"
                  >
                    No staff found matching "{query}"
                  </TableCell>
                </TableRow>
              ) : staffList.length === 0 ? (
                // No staff available (e.g., initial empty load)
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                    className="py-4 text-gray-500"
                  >
                    No staff available.
                  </TableCell>
                </TableRow>
              ) : (
                // Staff List Rows
                staffList.map((staff) => (
                  <TableRow
                    key={staff._id}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    onClick={() => handleToggle(staff)}
                    className="cursor-pointer" // Tailwind for hover hint
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.some((s) => s?._id === staff._id)}
                        onChange={() => handleToggle(staff)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">
                        {staff.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {staff.department || "Department not specified"}
                      </div>
                    </TableCell>
                    <TableCell>{staff.email}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
