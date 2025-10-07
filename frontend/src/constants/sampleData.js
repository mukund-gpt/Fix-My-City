const samplemessage = [
  {
    id: 1,
    title: "Pothole on Main Street",
    description: "Large pothole causing traffic delays.",
    location: "Main Street, Block A",
    status: "OPEN",
    citizen: {
      _id: '68e28645997566fcb50ce7da',
      name: 'Mukund',
      email: 'alice@example.com'
    },
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
    citizen: {
      _id: '68e28645997566fcb50ce7d9',
      name: 'Shreyansh',
      email: 'shrey@example.com'
    },
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
    citizen: {
      _id: '68e28645997566fcb50ce7d9',
      name: 'Suresh',
      email: 'bob@example.com'
    },
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


const departments = [
  { name: 'Water Supply', email: 'water@bareillygov.in' },
  { name: 'Electricity', email: 'electricity@bareillygov.in' },
  { name: 'Sanitation', email: 'sanitation@bareillygov.in' },
  { name: 'Road & Transport', email: 'transport@bareillygov.in' },
  { name: 'Waste Management', email: 'waste@bareillygov.in' },
  { name: 'Public Health', email: 'health@bareillygov.in' },
  { name: 'Street Lighting', email: 'streetlight@bareillygov.in' },
  { name: 'Parks & Gardens', email: 'parks@bareillygov.in' },
  { name: 'Building & Construction', email: 'construction@bareillygov.in' },
  { name: 'Sewage Management', email: 'sewage@bareillygov.in' },
  { name: 'Environment', email: 'environment@bareillygov.in' },
  { name: 'Fire & Safety', email: 'fire@bareillygov.in' },
  { name: 'Women & Child Welfare', email: 'womenchild@bareillygov.in' },
  { name: 'Housing', email: 'housing@bareillygov.in' },
  { name: 'Tax Department', email: 'tax@bareillygov.in' },
  { name: 'Disaster Management', email: 'disaster@bareillygov.in' },
  { name: 'Law & Order Support', email: 'laworder@bareillygov.in' },
  { name: 'Agriculture Support', email: 'agriculture@bareillygov.in' },
  { name: 'Animal Welfare', email: 'animal@bareillygov.in' },
  { name: 'Tourism & Culture', email: 'tourism@bareillygov.in' },
];

export default {samplemessage, samplenotification};
