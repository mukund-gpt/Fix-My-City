import Complaint from "../models/complaint.model.js";

// Get comprehensive dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await calculateDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

// Core function to calculate all statistics
export const calculateDashboardStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  // Parallel queries for better performance
  const [
    totalComplaints,
    openComplaints,
    inProgressComplaints,
    resolvedComplaints,
    todayComplaints,
    overdueComplaints,
    avgResolutionTime,
    urgencyDistribution,
    last7DaysData,
    statusTrend,
  ] = await Promise.all([
    // Total complaints
    Complaint.countDocuments(),

    // Open complaints
    Complaint.countDocuments({ status: "OPEN" }),

    // In Progress complaints
    Complaint.countDocuments({ status: "IN_PROGRESS" }),

    // Resolved complaints
    Complaint.countDocuments({ status: "RESOLVED" }),

    // Today's complaints
    Complaint.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),

    // Overdue complaints
    Complaint.countDocuments({
      status: { $ne: "RESOLVED" },
      deadline: { $lt: new Date() },
    }),

    // Average resolution time
    Complaint.aggregate([
      {
        $match: {
          status: "RESOLVED",
          totalTimeToResolve: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$totalTimeToResolve" },
        },
      },
    ]),

    // Urgency distribution
    Complaint.aggregate([
      {
        $group: {
          _id: "$urgency",
          count: { $sum: 1 },
        },
      },
    ]),

    // Last 7 days trend
    Complaint.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Status trend over time
    Complaint.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]),
  ]);

  // Calculate resolution rate
  const resolutionRate =
    totalComplaints > 0
      ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1)
      : 0;

  // Convert average resolution time to hours and days
  const avgTimeMs = avgResolutionTime[0]?.avgTime || 0;
  const avgTimeHours = (avgTimeMs / (1000 * 60 * 60)).toFixed(1);
  const avgTimeDays = (avgTimeMs / (1000 * 60 * 60 * 24)).toFixed(1);

  // Format urgency distribution
  const urgencyStats = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  urgencyDistribution.forEach((item) => {
    urgencyStats[item._id] = item.count;
  });

  // Format last 7 days data for chart
  const last7DaysFormatted = last7DaysData.map((item) => ({
    date: item._id,
    complaints: item.count,
  }));

  // Format status trend
  const statusTrendFormatted = statusTrend.reduce((acc, item) => {
    const date = item._id.date;
    if (!acc[date]) {
      acc[date] = { date, OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    }
    acc[date][item._id.status] = item.count;
    return acc;
  }, {});

  const statusTrendArray = Object.values(statusTrendFormatted);

  return {
    overview: {
      totalComplaints,
      openComplaints,
      inProgressComplaints,
      resolvedComplaints,
      todayComplaints,
      overdueComplaints,
      resolutionRate: parseFloat(resolutionRate),
    },
    performance: {
      averageResolutionTime: {
        milliseconds: avgTimeMs,
        hours: parseFloat(avgTimeHours),
        days: parseFloat(avgTimeDays),
      },
    },
    distribution: {
      urgency: urgencyStats,
    },
    trends: {
      last7Days: last7DaysFormatted,
      statusTrend: statusTrendArray,
    },
    timestamp: new Date(),
  };
};

