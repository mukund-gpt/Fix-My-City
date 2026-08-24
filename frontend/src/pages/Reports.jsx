import axiosInstance from "@/api/axiosinstance";
import { server } from "@/constants/config";
import { Calendar, CheckCircle, Download, Tally3, Timer } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function Reports() {
  // Initialize start date to 30 days ago and end date to today for a useful default range
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);
  // --- MOCK DATA FOR DEMO ---
  // This simulates the data structure expected from the API.
  const mockAnalyticsData = {
    totalComplaints: 452,
    avgResolutionTime: 12.75, // in hours
    slaCompliance: 94.5, // in percentage
    volumeByCategory: {
      "Technical Issue": 120,
      "Billing Dispute": 98,
      "Service Delay": 150,
      "General Inquiry": 84,
    },
  };

  const fetchAnalytics = async () => {
    if (!startDate || !endDate) {
      setError("Please select both a start and end date.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      // In a real application, you would use the actual API call:

      const res = await axiosInstance.get(
        `/admin/reports?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setAnalytics(res.data);
      console.log("Analytics Response:", analytics);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to fetch analytics data. Please try again.");
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = (format) => {
    if (!startDate || !endDate) {
      setError("Please select both a start and end date before downloading.");
      return;
    }
    setError(null);
    // This opens the download URL in a new tab
    const url = `${server}/api/admin/reports?startDate=${startDate}&endDate=${endDate}&format=${format}`;
    window.open(url, "_blank");
    console.log(`Simulating download of ${format} report from: ${url}`);
  };

  // Component for a single key performance indicator card
  const MetricCard = ({ title, value, unit, icon: Icon, color }) => (
    <div
      className={`p-5 rounded-2xl shadow-xl transition duration-300 transform hover:shadow-2xl ${color} text-white`}
    >
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium opacity-80 uppercase tracking-wider">
          {title}
        </h4>
        <Icon className="w-6 h-6" />
      </div>
      <p className="mt-3 text-4xl font-extrabold">
        {value}
        <span className="text-xl font-normal ml-1 opacity-90">{unit}</span>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Service Reports & Analytics
          </h1>
          <p className="mt-1 text-slate-500">
            Generate key performance indicators and download reports for
            detailed analysis.
          </p>
        </header>

        {/* --- Date Filter and Action Bar (Card) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-2xl mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Select Reporting Period
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
            {/* Date Inputs Group */}
            <div className="flex gap-4 flex-grow">
              <div className="flex-1">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Start Date
                </label>
                <div className="relative">
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border-gray-300 border-2 p-3 pr-10 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  End Date
                </label>
                <div className="relative">
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border-gray-300 border-2 p-3 pr-10 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* View Button */}
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-[1.02] active:scale-100 ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 text-white shadow-md hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Loading..." : "View Analytics"}
            </button>
          </div>

          {/* Download Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-4 justify-start">
            <button
              onClick={() => downloadReport("csv")}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition duration-200"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => downloadReport("pdf")}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl shadow-md hover:bg-red-600 transition duration-200"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 shadow-sm"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* --- Analytics Dashboard Display --- */}
        {analytics && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Key Performance Indicators
            </h2>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard
                title="Total Complaints"
                value={analytics?.totalComplaints.toLocaleString()}
                unit=""
                icon={Tally3}
                color="bg-indigo-600"
              />
              <MetricCard
                title="Avg. Resolution Time"
                value={analytics?.avgResolutionTimeInHours}
                unit="hrs"
                icon={Timer}
                color="bg-teal-600"
              />
              <MetricCard
                title="SLA Compliance"
                value={analytics?.slaCompliance}
                unit="%"
                icon={CheckCircle}
                color="bg-amber-600"
              />
            </div>

            {/* Volume by Category Section */}
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Volume by Category
              </h3>
              <ul className="space-y-3">
                {analytics?.filteredVolumeByCategory &&
                  Object.entries(analytics.filteredVolumeByCategory) // [[category, count], ...]
                    .map(([category, count]) => ({ category, count })) // convert to array of objects
                    .sort((a, b) => b.count - a.count) // sort descending
                    .map(({ category, count }) => {
                      const total = analytics?.totalComplaints || 0;
                      const percentage = total > 0 ? (count / total) * 100 : 0;

                      return (
                        <li
                          key={category}
                          className="p-4 bg-gray-50 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center transition duration-150 hover:bg-gray-100 border-l-4 border-blue-500"
                        >
                          <span className="font-medium text-gray-700 flex-1 mb-2 sm:mb-0">
                            {category}
                          </span>
                          <div className="flex-1 w-full sm:w-auto h-2 bg-gray-200 rounded-full mx-0 sm:mx-4 my-2 sm:my-0">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-right">
                            <span className="font-bold text-lg text-gray-800 mr-2">
                              {count}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </span>
                        </li>
                      );
                    })}
              </ul>
            </div>
          </div>
        )}

        {!analytics && !isLoading && (
          <div className="mt-12 text-center p-10 bg-white rounded-2xl shadow-lg border border-gray-100">
            <Tally3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              Please select a date range and click "View Analytics" to load the
              report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
