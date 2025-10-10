import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LiveStat = () => {
  const [stats, setStats] = useState({
    overview: {
      totalComplaints: 0,
      openComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0,
      todayComplaints: 0,
      overdueComplaints: 0,
      resolutionRate: 0,
    },
    performance: {
      averageResolutionTime: { hours: 0, days: 0 },
    },
    distribution: {
      urgency: { HIGH: 0, MEDIUM: 0, LOW: 0 },
    },
    trends: {
      last7Days: [],
      statusTrend: [],
    },
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_SERVER}`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    socket.on("dashboard-update", (data) => {
      console.log("Received dashboard update:", data);
      setStats(data);
      setLastUpdate(new Date());
    });

    socket.on("dashboard-error", (error) => {
      console.error("Dashboard error:", error);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
    <div
      className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
          <h3 className="text-white text-4xl font-bold mb-1">{value}</h3>
          {subtext && <p className="text-white/70 text-xs">{subtext}</p>}
        </div>
        <div className="bg-white/20 p-3 rounded-lg">
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Real-time monitoring and analytics
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  isConnected
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  } animate-pulse`}
                ></div>
                <span className="text-sm font-medium">
                  {isConnected ? "Live" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Activity}
            label="Total Complaints"
            value={stats.overview.totalComplaints}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={AlertCircle}
            label="Open Complaints"
            value={stats.overview.openComplaints}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={CheckCircle}
            label="Resolved"
            value={stats.overview.resolvedComplaints}
            color="from-green-500 to-emerald-600"
            subtext={`${stats.overview.resolutionRate}% resolution rate`}
          />
          <StatCard
            icon={Clock}
            label="New Today"
            value={stats.overview.todayComplaints}
            color="from-purple-500 to-pink-600"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-blue-400" size={24} />
              <h3 className="text-white text-lg font-semibold">In Progress</h3>
            </div>
            <p className="text-4xl font-bold text-white">
              {stats.overview.inProgressComplaints}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-400" size={24} />
              <h3 className="text-white text-lg font-semibold">Overdue</h3>
            </div>
            <p className="text-4xl font-bold text-red-400">
              {stats.overview.overdueComplaints}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-green-400" size={24} />
              <h3 className="text-white text-lg font-semibold">
                Avg Resolution
              </h3>
            </div>
            <p className="text-4xl font-bold text-white">
              {stats.performance.averageResolutionTime.days}
              <span className="text-lg text-gray-400 ml-2">days</span>
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {stats.performance.averageResolutionTime.hours} hours
            </p>
          </div>
        </div>

        {/* Urgency Distribution */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-white text-xl font-semibold mb-4">
            Urgency Distribution
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-full bg-gray-700 rounded-lg p-4 mb-2">
                <p className="text-red-400 text-3xl font-bold">
                  {stats.distribution.urgency.HIGH}
                </p>
              </div>
              <p className="text-gray-400 text-sm">High Priority</p>
            </div>
            <div className="text-center">
              <div className="w-full bg-gray-700 rounded-lg p-4 mb-2">
                <p className="text-yellow-400 text-3xl font-bold">
                  {stats.distribution.urgency.MEDIUM}
                </p>
              </div>
              <p className="text-gray-400 text-sm">Medium Priority</p>
            </div>
            <div className="text-center">
              <div className="w-full bg-gray-700 rounded-lg p-4 mb-2">
                <p className="text-green-400 text-3xl font-bold">
                  {stats.distribution.urgency.LOW}
                </p>
              </div>
              <p className="text-gray-400 text-sm">Low Priority</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Last 7 Days Trend */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-4">
              Last 7 Days Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.trends.last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Line
                  type="monotone"
                  dataKey="complaints"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Trend */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-4">
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.trends.statusTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Legend />
                <Bar dataKey="OPEN" fill="#F59E0B" />
                <Bar dataKey="IN_PROGRESS" fill="#3B82F6" />
                <Bar dataKey="RESOLVED" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStat;
