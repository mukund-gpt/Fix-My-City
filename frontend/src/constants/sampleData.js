const samplemessage = [
  {
    id: 1,
    title: "Pothole on Main Street",
    description: "Large pothole causing traffic delays.",
    location: "Main Street, Block A",
    status: "OPEN",
    photo: "https://picsum.photos/400/200?random=1",
    owner: "John Doe",
    department: "Road Maintenance"
  },
  {
    id: 2,
    title: "Water Leakage",
    description: "Burst pipe causing water accumulation.",
    location: "Sector 5, Park Road",
    status: "IN_PROGRESS",
    photo: "https://picsum.photos/400/200?random=2",
    owner: "Jane Smith",
    department: "Water Department"
  },
  {
    id: 3,
    title: "Garbage Not Collected",
    description: "Bins overflowing for 2 days.",
    location: "Central Market",
    status: "RESOLVED",
    photo: "https://picsum.photos/400/200?random=3",
    owner: "Alice Johnson",
    department: "Sanitation"
  }
];

const samplenotification = [{
  id: 1,
  title: "New Complaint Assigned",
  description: "A new complaint has been assigned to you.",
  date: "2023-10-01",
  status: "UNREAD"
}, {
  id: 2,
  title: "Complaint Resolved",
  description: "Your complaint about the pothole has been resolved.",
  date: "2023-10-02",
  status: "READ"
}, {
  id: 3,
  title: "New Policy Update",
  description: "There is a new policy update regarding waste management.",
  date: "2023-10-03",
  status: "UNREAD"
  }, {
  id: 4,
  title: "Maintenance Schedule",
  description: "The maintenance schedule for the next month has been released.",
  date: "2023-10-04",
  status: "READ"
  }, {
  id: 5,
  title: "Community Event",
  description: "Join us for a community cleanup event this weekend.",
  date: "2023-10-05",
  status: "UNREAD"
  }, {
  id: 6,
  title: "Feedback Request",
  description: "We would like your feedback on the recent service provided.",
  date: "2023-10-06",
  status: "READ"
  }, {
  id: 7,
  title: "System Maintenance",
  description: "The system will undergo maintenance on 2023-10-07 from 2 AM to 4 AM.",
  date: "2023-10-07",
  status: "UNREAD"
}]
export default {samplemessage, samplenotification};
