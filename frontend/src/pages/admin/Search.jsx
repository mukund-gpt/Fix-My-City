import { Checkbox, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosinstance";

export default function StaffSearch({ selectedStaff = [], onChange }) {
  const [query, setQuery] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(selectedStaff || []);

  // Fetch staff from backend
  const fetchStaff = async (search = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/staff?search=${search}`);
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
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => fetchStaff(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Handle staff selection toggle
  const handleToggle = (staff) => {
    let updated;
    if (selected.find((s) => s._id === staff._id)) {
      updated = selected.filter((s) => s._id !== staff._id);
    } else {
      updated = [...selected, staff];
    }
    setSelected(updated);
    onChange && onChange(updated.map((s) => s._id)); // pass _id array back
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search department..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {loading ? (
        <div className="flex justify-center py-4">
          <CircularProgress />
        </div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Select</th>
              <th className="border p-2">Department Name</th>
              <th className="border p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-4">
                  No staff found
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff._id}>
                  <td className="border p-2 text-center">
                    <Checkbox
                      checked={!!selected.find((s) => s._id === staff._id)}
                      onChange={() => handleToggle(staff)}
                    />
                  </td>
                  <td className="border p-2">{staff.department}</td>
                  <td className="border p-2">{staff.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
