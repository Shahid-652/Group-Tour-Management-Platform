# 🌍 Group Tour Management Platform

A full-stack web application designed to simplify group travel management. This platform helps users create tour groups, manage itineraries, assign tasks, track split expenses, and share trip memories effortlessly.

---

## 🚀 Features

* **🔐 User Authentication**: Secure Login & Register system using JWT (JSON Web Tokens) and bcrypt password hashing.
* **👥 Group Management**: Create tour groups, join existing ones via invite/group codes, and manage members.
* **📅 Trip & Itinerary Planning**: Organize upcoming group trips with schedules and locations.
* **📝 Task Assignment**: Assign travel tasks to specific group members and track completion status.
* **💰 Expense Splitting & Tracking**: Track group expenses, split costs automatically among members, and calculate debts.
* **📸 Trip Memories**: Share photos, notes, and memorable moments from trips.
* **📊 Interactive Dashboard**: Overview of active trips, pending tasks, and recent expense activities.

---

## 🛠️ Tech Stack

### Frontend

* **Framework/Library**: React.js (Vite)
* **Styling**: Tailwind CSS, PostCSS
* **Routing**: React Router DOM
* **HTTP Client**: Axios

### Backend

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Authentication**: JWT (JSON Web Token), bcryptjs
* **Environment Management**: dotenv

---

## 📁 Project Structure

```text
group-tour-platform/
├── backend/
│   ├── config/          # Database connections
│   ├── controllers/     # API request handlers
│   ├── middleware/      # Auth & Error handling middlewares
│   ├── models/          # MongoDB Mongoose schemas
│   ├── routes/          # Express API route endpoints
│   ├── utils/           # Helper functions (expense calculation, etc.)
│   └── server.js        # Server entry point
│
└── frontend/
    ├── public/          # Static assets
    └── src/
        ├── api/         # Axios instance & API config
        ├── components/  # Reusable UI components (Navbar, ProtectedRoute, etc.)
        ├── context/     # Auth Context API
        ├── pages/       # Application views (Dashboard, Groups, Tasks, Memories, etc.)
        ├── App.jsx      # Main application component
        └── main.jsx     # Frontend entry point

```

---

## ⚡ Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
* [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/group-tour-platform.git
cd group-tour-platform

```

---

### 2. Backend Setup

1. Navigate to the `backend` folder:
```bash
cd backend

```


2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the `backend` directory (refer to `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/group-tour-db
JWT_SECRET=your_jwt_secret_key_here

```


4. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start

```


*The backend server will run on `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
```bash
cd ../frontend

```


2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the `frontend` directory (refer to `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api

```


4. Start the frontend development server:
```bash
npm run dev

```


*The frontend app will run on `http://localhost:5173`.*

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/auth/register` | Register a new user |
| **POST** | `/api/auth/login` | Authenticate user & return token |
| **GET/POST** | `/api/groups` | Get user groups / Create a group |
| **GET/POST** | `/api/trips` | Get trips / Create a new trip |
| **GET/POST** | `/api/tasks` | Fetch tasks / Assign a new task |
| **GET/POST** | `/api/expenses` | Get expenses / Add split expense |
| **GET/POST** | `/api/memories` | View trip memories / Add new memory |

---

