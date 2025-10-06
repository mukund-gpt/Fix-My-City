import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosinstance";

const sampleStaff = [
  { name: "Water Supply Department", email: "water@bareillygov.in", role: "staff", department: "Water Supply" },
  { name: "Electricity Department", email: "electricity@bareillygov.in", role: "staff", department: "Electricity" },
  { name: "Sanitation Department", email: "sanitation@bareillygov.in", role: "staff", department: "Sanitation" },
  { name: "Roads & Transport", email: "transport@bareillygov.in", role: "staff", department: "Roads & Transport" },
  { name: "Health Department", email: "health@bareillygov.in", role: "staff", department: "Health" },
  { name: "Education Department", email: "education@bareillygov.in", role: "staff", department: "Education" },
  { name: "Fire & Emergency", email: "fire@bareillygov.in", role: "staff", department: "Fire & Emergency" },
  { name: "IT Department", email: "it@bareillygov.in", role: "staff", department: "IT" },
  { name: "Urban Planning", email: "planning@bareillygov.in", role: "staff", department: "Urban Planning" },
  { name: "Revenue Department", email: "revenue@bareillygov.in", role: "staff", department: "Revenue" }
];

export default function StaffSearch() {
  const [query, setQuery] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStaff = async (search = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/staff?search=${search}`);
    //   console.log(res);
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
    const handler = setTimeout(() => {
      fetchStaff(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler); // cleanup on query change
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search department..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Department Name</th>
            <th className="border p-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={2} className="text-center p-4">
                Loading...
              </td>
            </tr>
          ) : staffList.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center p-4">
                No staff found
              </td>
            </tr>
          ) : (
            staffList.map((staff) => (
              <tr key={staff._id}>
                <td className="border p-2">{staff.department}</td>
                <td className="border p-2">{staff.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
