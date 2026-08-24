import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
// Import Doughnut for the location chart, as it is generally cleaner for distribution
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import axiosInstance from "../../api/axiosinstance.js";

// Register all necessary elements for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Define a simple, reusable StatsCard component for key metrics
const StatCard = ({ title, value, color, icon: Icon }) => (
  <Card
    sx={{
      boxShadow: 3,
      borderRadius: 2,
      borderLeft: `5px solid ${color}`,
      transition: "transform 0.3s ease-in-out",
      "&:hover": {
        transform: "translateY(-5px)",
      },
    }}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="subtitle1"
          color="text.secondary"
          fontWeight="medium"
        >
          {title}
        </Typography>
        {/* You would need to import an Icon component (e.g., from @mui/icons-material) here */}
        {/* {Icon && <Icon sx={{ color, fontSize: 32 }} />} */}
      </Box>
      <Typography
        variant="h4"
        component="div"
        fontWeight="bold"
        mt={1}
        color={color}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ViewAnalytics = () => {
  const theme = useTheme(); // Use the MUI theme for color consistency
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get("/admin/analytics");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  if (!data) return <p className="p-6">Loading Analytics Data...</p>;

  // --- Chart Data Configuration ---

  const statusColors = [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
  ];
  const urgencyColors = [
    theme.palette.primary.light,
    theme.palette.warning.dark,
    theme.palette.error.dark,
  ];
  const locationPalette = [
    theme.palette.info.main,
    theme.palette.secondary.main,
    theme.palette.primary.dark,
    theme.palette.success.light,
    theme.palette.error.light,
  ];

  const statusData = {
    labels: ["Open", "In Progress", "Resolved"],
    datasets: [
      {
        label: "Complaints Status",
        data: [data.open, data.inProgress, data.resolved],
        backgroundColor: statusColors,
        borderColor: "#fff",
        borderWidth: 2,
        borderRadius: 5, // Add bar radius for a modern look
      },
    ],
  };

  const urgencyData = {
    labels: data.urgencyCounts.map((u) => u._id),
    datasets: [
      {
        label: "Urgency Distribution",
        data: data.urgencyCounts.map((u) => u.count),
        backgroundColor: urgencyColors,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const locationData = {
    labels: data.locationCounts.map((l) => l._id),
    datasets: [
      {
        label: "Complaints by Location",
        data: data.locationCounts.map((l) => l.count),
        backgroundColor: locationPalette,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // --- Chart Options Configuration ---

  // Common options for bar and pie/doughnut charts
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows charts to fill the container size
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      title: {
        display: false, // Title is handled by Card Typography
      },
    },
  };

  const barChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false, // Remove horizontal grid lines for cleaner look
        },
        ticks: {
          precision: 0, // Ensure whole numbers for counts
        },
      },
      x: {
        grid: {
          display: false, // Remove vertical grid lines
        },
      },
    },
  };

  const pieDoughnutOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        ...commonChartOptions.plugins.legend,
        position: "right", // Place legend on the right for better visual balance
      },
    },
  };

  // Calculate total complaints for the summary card
  const totalComplaints = data.open + data.inProgress + data.resolved;
  const resolvedPercentage =
    totalComplaints > 0
      ? ((data.resolved / totalComplaints) * 100).toFixed(1)
      : 0;

  return (
    <Box className="min-h-screen bg-slate-50 p-6">
      <Typography
        variant="h4"
        className="mb-1 border-b pb-2 font-extrabold text-slate-900"
      >
        Admin Analytics Dashboard
      </Typography>

      {/* Summary Statistics Row */}
      <Grid container spacing={4} className="mb-8 mt-2">
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Complaints"
            value={totalComplaints}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Resolved Rate"
            value={`${resolvedPercentage}%`}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Open Complaints"
            value={data.open}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* Chart Rows */}
      <Grid container spacing={4}>
        {/* Complaint Status Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card className="shadow-lg rounded-xl h-96">
            {" "}
            {/* Increased height for better chart aspect ratio */}
            <CardContent>
              <Typography variant="h6" className="mb-4 font-bold text-gray-700">
                Complaint Status Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={statusData} options={barChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Urgency Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card className="shadow-lg rounded-xl h-96">
            <CardContent>
              <Typography variant="h6" className="mb-4 font-bold text-gray-700">
                Urgency Distribution
              </Typography>
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Use Pie or Doughnut for percentage distribution */}
                <Pie data={urgencyData} options={pieDoughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Complaints by Location Doughnut Chart */}
        <Grid item xs={12}>
          <Card className="shadow-lg rounded-xl h-96">
            <CardContent>
              <Typography variant="h6" className="mb-4 font-bold text-gray-700">
                Complaints by Location
              </Typography>
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Doughnut data={locationData} options={pieDoughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewAnalytics;
