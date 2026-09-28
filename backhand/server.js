require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const tripRoutes = require("./routes/tripRoutes");
const taskRoutes = require("./routes/taskRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const memoryRoutes = require("./routes/memoryRoutes");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Group Tour Management Platform API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/memories", memoryRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
