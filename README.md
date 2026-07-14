<div align="center">
  
# 🚀 PTTM-Platform
**Project and Team Task Management Platform**

A modern, high-performance web application designed to streamline project workflows, team collaboration, and task tracking. Built with a robust full-stack architecture.

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
<br />
[![Node.js](https://img.shields.io/badge/Node.js-18-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-404D59?style=for-the-badge)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

<br />

## 📖 Project Description

The **PTTM-Platform** is a comprehensive task management solution that empowers teams to organize projects, assign responsibilities, and monitor progress in real time. Designed with a premium, Stripe-inspired user interface, the platform offers a seamless experience with an interactive Kanban board, role-based dashboards, and automated email notifications to keep everyone in the loop.

---

## ✨ Key Features

- **🔐 Role-Based Access Control (RBAC):**
  - **Admin:** Complete system oversight, user management, and global project control.
  - **Project Manager:** Create projects, define tasks, and assign team members.
  - **Team Member:** View assigned tasks and dynamically update task statuses.
- **📋 Interactive Kanban Board:** Drag-and-drop workflow optimization with optimistic UI updates for instant feedback.
- **📊 Task Progress Dashboard:** Visual analytics using Chart.js to monitor team velocity and project completion rates.
- **📧 Automated Email Notifications:** Integrated with Nodemailer to instantly alert team members when new tasks are assigned.
- **💎 Premium UI/UX:** A fully responsive, modern design utilizing Tailwind CSS glassmorphism, smooth animations, and high-contrast typography.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Library:** React
- **Styling:** Tailwind CSS
- **Data Fetching:** SWR & Axios
- **Charts:** Chart.js (react-chartjs-2)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (using `pg` pool)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Mail Service:** Nodemailer

---

## 📄 API Documentation (Postman Collection)

A complete Postman collection (`postman_collection.json`) is included in the `Backend` directory of this repository. Evaluators and developers can directly import this JSON file into Postman to test all Authentication, Project, and Task endpoints with pre-configured request bodies and variable environments.

---

## 🔗 Live Links

- **Frontend (Vercel):** [https://pttm-platform.vercel.app](#) *(Placeholder)*
- **Backend API (Render):** [https://pttm-platform.onrender.com/api](#) *(Placeholder)*

---

## 🚀 Local Installation

Follow these step-by-step instructions to run the application locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/PTTM-Platform.git
cd PTTM-Platform
```

### 2. Database Setup
The platform requires a PostgreSQL database. You can set this up locally or use a cloud provider like Supabase/Neon.

1. Create a new PostgreSQL database.
2. Execute the provided SQL schema file located at `Backend/schema.sql` to create the necessary tables, enums, and triggers.

```bash
# Example using psql
psql -U your_username -d your_database_name -f Backend/schema.sql
```

### 3. Setup the Backend
Open a terminal and navigate to the backend directory:
```bash
cd Backend
npm install
```
Configure your database and start the server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a **new** terminal and navigate to the frontend directory:
```bash
cd Frontend
npm install
```
Start the Next.js development server:
```bash
npm run dev
```

The platform will now be running simultaneously. You can view the frontend at `http://localhost:3000`.

---

## 🔐 Environment Variables

To run this project locally, you will need to create `.env` files in both the frontend and backend directories.

### Backend (`Backend/.env`)
Create a `.env` file in the `Backend` folder and add the following keys:
```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/pttm_db
JWT_SECRET=your_super_secret_jwt_key
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password
```

### Frontend (`Frontend/.env.local`)
Create a `.env.local` file in the `Frontend` folder and add the following key:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

<div align="center">
  <i>Built with ❤️ by Rasindu Perera</i>
</div>
