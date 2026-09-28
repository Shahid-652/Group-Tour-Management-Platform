const express = require("express");
const { createTask, getTasksForGroup, updateTask, deleteTask } = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createTask);
router.get("/group/:groupId", getTasksForGroup);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
