# The-Caravan-Chronicle 🚀

## Project Overview 🌟
The Caravan Chronicle is a MERN stack-based project aimed at empowering citizens to address and resolve issues within their city. This platform facilitates complaint submission, tracking, and resolution while fostering transparency and accountability.

## Features ✨

- **User Authentication 🔒**: Secure login and registration system.
- **Complaint Management 📝**: Submit, track, and resolve complaints.
- **Admin Dashboard 🛠️**: Tools for administrators to manage complaints and users.
- **Staff Portal 👷**: Dedicated interface for staff to handle assigned complaints.
- **Interactive Map 🗺️**: Visualize complaints and their locations.
- **Notifications 🔔**: Stay updated with real-time notifications.
- **Reports 📊**: Generate and view detailed reports.

## Feature Details 🔍

### User Authentication 🔒
The platform provides a secure authentication system that includes:
- **Registration 🖊️**: Users can create accounts with unique credentials.
- **Login 🔑**: Secure login using encrypted passwords.
- **Session Management 🕒**: Ensures users remain logged in securely.
- **Role-Based Access Control 🎭**: Different roles (e.g., admin, staff, user) have specific permissions.

### Complaint Management 📝
- **Submission 📥**: Users can submit complaints with detailed descriptions and optional attachments.
- **Tracking 📍**: Complaints can be tracked in real-time, showing their current status.
- **Resolution ✅**: Once resolved, users are notified, and the complaint is archived for future reference.

### Admin Dashboard 🛠️
- **User Management 👤**: Admins can view, edit, and manage user accounts.
- **Complaint Oversight 👁️**: Admins can monitor all complaints and assign them to staff members.
- **Analytics 📈**: Provides insights into complaint trends and resolution times.

### Staff Portal 👷
- **Assigned Complaints 📋**: Staff members can view complaints assigned to them.
- **Status Updates 🔄**: Staff can update the status of complaints as they work on them.
- **Communication 💬**: Allows staff to communicate with users for additional details.

### Interactive Map 🗺️
- **Visualization 🌍**: Displays complaints on a map for better spatial understanding.
- **Filters 🔎**: Users can filter complaints by type, status, or date.
- **Integration 🔗**: Powered by Maptiler API for seamless map rendering.

### Notifications 🔔
- **Real-Time Updates ⏰**: Users receive notifications for status changes, new messages, and more.
- **Customizable ⚙️**: Users can choose which notifications they want to receive.

### Reports 📊
- **Generation 🖨️**: Users and admins can generate detailed reports on complaints.
- **Export 📤**: Reports can be exported in various formats (e.g., PDF, Excel).
- **Insights 💡**: Provides data-driven insights to improve city management.

## Technologies Used 🛠️
- **Frontend 🎨**: React, Vite
- **Backend ⚙️**: Node.js, Express.js
- **Database 🗄️**: MongoDB
- **State Management 🧠**: Redux
- **Other Tools 🛠️**: Axios, Maptiler API

## Folder Structure
- **backend/**: Contains server-side code, including routes, controllers, models, and utilities.
- **frontend/**: Contains client-side code, including components, pages, and Redux setup.

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/shreyanshgangwar1509/The-Caravan-Chronicle.git
   ```
2. Navigate to the project directory:
   ```bash
   cd The-Caravan-Chronicle
   ```
3. Install dependencies for both frontend and backend:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
4. Start the development servers:
   - Backend:
     ```bash
     cd backend
     npm start
     ```
   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```




