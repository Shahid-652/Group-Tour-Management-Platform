const express = require("express");
const { createMemory, getMemoriesForGroup, deleteMemory } = require("../controllers/memoryController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createMemory);
router.get("/group/:groupId", getMemoriesForGroup);
router.delete("/:id", deleteMemory);

module.exports = router;
