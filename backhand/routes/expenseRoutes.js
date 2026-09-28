const express = require("express");
const {
  createExpense,
  getExpensesForGroup,
  getGroupBalances,
  settleSplit,
  deleteExpense,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createExpense);
router.get("/group/:groupId", getExpensesForGroup);
router.get("/group/:groupId/balances", getGroupBalances);
router.put("/:id/settle/:userId", settleSplit);
router.delete("/:id", deleteExpense);

module.exports = router;
