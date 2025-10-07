
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
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
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import axiosInstance from "../../api/axiosinstance.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ViewAnalytics = () => {
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

  if (!data) return <p>Loading...</p>;

  const statusData = {
    labels: ["Open", "In Progress", "Resolved"],
    datasets: [
      {
        label: "Complaints Status",
        data: [data.open, data.inProgress, data.resolved],
        backgroundColor: ["#ef4444", "#facc15", "#22c55e"],
      },
    ],
  };

  const urgencyData = {
    labels: data.urgencyCounts.map((u) => u._id),
    datasets: [
      {
        label: "Urgency Distribution",
        data: data.urgencyCounts.map((u) => u.count),
        backgroundColor: ["#34d399", "#fcd34d", "#f87171"],
      },
    ],
  };

  const locationData = {
    labels: data.locationCounts.map((l) => l._id),
    datasets: [
      {
        label: "Complaints by Location",
        data: data.locationCounts.map((l) => l.count),
        backgroundColor: ["#60a5fa", "#fbbf24", "#f87171", "#34d399", "#a78bfa"],
      },
    ],
  };

  return (
    <Box className="p-6">
      <Typography variant="h4" className="mb-6 font-bold text-gray-800">
        Admin Analytics Dashboard
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-2 font-semibold">
                Complaint Status
              </Typography>
              <Bar data={statusData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-2 font-semibold">
                Urgency Distribution
              </Typography>
              <Pie data={urgencyData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-2 font-semibold">
                Complaints by Location
              </Typography>
              <Doughnut data={locationData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewAnalytics;
