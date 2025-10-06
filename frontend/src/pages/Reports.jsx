import axios from "axios";
import { useState } from "react";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    const res = await axios.get(
      `/api/admin/reports?startDate=${startDate}&endDate=${endDate}`
    );
    setAnalytics(res.data);
  };

  const downloadReport = (format) => {
    const url = `/api/admin/reports?startDate=${startDate}&endDate=${endDate}&format=${format}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Reports & Analytics</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={fetchAnalytics} className="bg-blue-600 text-white p-2 rounded">
          View Analytics
        </button>
        <button onClick={() => downloadReport("csv")} className="bg-green-600 text-white p-2 rounded">
          Export CSV
        </button>
        <button onClick={() => downloadReport("pdf")} className="bg-red-600 text-white p-2 rounded">
          Export PDF
        </button>
      </div>

      {analytics && (
        <div className="mt-4">
          <p>Total Complaints: {analytics.totalComplaints}</p>
          <p>Average Resolution Time: {analytics.avgResolutionTime.toFixed(2)} hrs</p>
          <p>SLA Compliance: {analytics.slaCompliance.toFixed(2)}%</p>
          <h3 className="mt-2 font-semibold">Volume by Category:</h3>
          <ul>
            {Object.entries(analytics.volumeByCategory).map(([category, count]) => (
              <li key={category}>
                {category}: {count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
