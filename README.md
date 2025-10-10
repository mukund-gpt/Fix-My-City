# The Caravan Chronicle (FixMyCity) 🚀🏙️

A full‑stack civic‑complaint platform (React + Vite frontend, Express + MongoDB backend). Citizens can submit geo‑tagged complaints with media, comment, track progress, and admins/staff can moderate and analyze issues. 🌐📝

---

## Key features ✨

- 🔒 User authentication (signup / login / JWT / Google OAuth)
- 📝 Create / Read / Update / Delete complaints with image/file uploads
- 🗺️ Interactive map with geolocation and filters
- 💬 Commenting and discussion on complaints
- 🛠️ Admin dashboard: moderation, assignment, analytics
- 👷 Staff portal: assigned tasks, status updates
- 🔔 Notifications (real‑time / status updates)
- 📊 Live statistics and reports (exportable)
- 🧩 Flask ML microservice for duplicate complaint detection
- 📁 Uploaded media stored in backend/uploads

---

## Functionality — detailed 🔍

- Registration & Login 🔑

  - Role-based access (user, staff, admin) 🎭
  - JWT tokens for auth and protected APIs 🔐

- Complaint lifecycle 🧭

  - Submit complaint with title, description, category, location, attachments 📥📸
  - View complaints on a list or map with filters (type, status, date) 🔎
  - Staff assignment & progress updates 🔄
  - Resolution, user notifications, and archival ✅

- Comments & Communication 💬

  - Users and staff can comment on complaints
  - Notifications on replies and status changes 🔔

- Map & Geo features 🗺️

  - Display complaints as map markers
  - Click marker → view complaint details and media 📍

- Admin & Analytics 📈

  - View complaint trends, resolution times, top categories
  - Export reports (CSV / PDF) for insights 📤

- File uploads & media 📂
  - Images/attachments handled via multer (saved to backend/uploads) 🖼️
- Flask ML microservice for duplicate complaint detection 🧠
  - Uses a pre-trained NLP model to analyze complaint text similarity
  - REST API endpoint to check if a new complaint matches existing ones
  - Integrated with the backend for real-time duplicate detection

---

## API overview 🔗

Primary routes in backend/routes — key controllers:

- complaint.controller.js — complaint CRUD, file uploads
- auth.controller.js — registration/login, token issuance
- comments.controller.js — add/list comments
- admin.controller.js — admin actions & analytics
- liveStat.controller.js — live statistics endpoints
- map.controller.js — geo queries / clustering

Auth uses JWT tokens from utills/generatetoken.js and DB connection is in utills/db.js.
