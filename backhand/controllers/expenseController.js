const Expense = require("../models/Expense");
const Group = require("../models/Group");
const { splitEqually, splitCustom } = require("../utils/splitExpense");

const ensureMember = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return { ok: false, code: 404, message: "Group not found" };
  const isMember = group.members.some((m) => m.user.toString() === userId.toString());
  if (!isMember) return { ok: false, code: 403, message: "You are not a member of this group" };
  return { ok: true, group };
};

// @route POST /api/expenses
// body: { group, trip, title, amount, category, paidBy, splitType, participantIds?, customSplits? }
const createExpense = async (req, res, next) => {
  try {
    const { group, trip, title, amount, category, paidBy, splitType, participantIds, customSplits } = req.body;

    if (!group || !title || !amount || !paidBy) {
      return res.status(400).json({ message: "group, title, amount and paidBy are required" });
    }

    const check = await ensureMember(group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    let splits;
    if (splitType === "custom") {
      if (!Array.isArray(customSplits) || customSplits.length === 0) {
        return res.status(400).json({ message: "customSplits array is required for custom split type" });
      }
      const total = customSplits.reduce((sum, s) => sum + Number(s.amountOwed), 0);
      if (Math.abs(total - Number(amount)) > 0.01) {
        return res.status(400).json({ message: `Custom split total (${total}) must equal expense amount (${amount})` });
      }
      splits = splitCustom(customSplits);
    } else {
      const participants = participantIds && participantIds.length > 0
        ? participantIds
        : check.group.members.map((m) => m.user.toString());
      splits = splitEqually(Number(amount), participants);
    }

    const expense = await Expense.create({
      group,
      trip: trip || null,
      title,
      amount,
      category,
      paidBy,
      splitType: splitType || "equal",
      splits,
      createdBy: req.user._id,
    });

    const populated = await Expense.findById(expense._id)
      .populate("paidBy", "name email avatarColor")
      .populate("splits.user", "name email avatarColor");

    return res.status(201).json({ expense: populated });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/expenses/group/:groupId
const getExpensesForGroup = async (req, res, next) => {
  try {
    const check = await ensureMember(req.params.groupId, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate("paidBy", "name email avatarColor")
      .populate("splits.user", "name email avatarColor")
      .sort({ date: -1 });

    return res.json({ expenses });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/expenses/group/:groupId/balances
// Returns net balance per member: positive = should receive, negative = owes
const getGroupBalances = async (req, res, next) => {
  try {
    const check = await ensureMember(req.params.groupId, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const expenses = await Expense.find({ group: req.params.groupId });

    const balances = {};
    check.group.members.forEach((m) => {
      balances[m.user.toString()] = 0;
    });

    expenses.forEach((exp) => {
      const paidById = exp.paidBy.toString();
      balances[paidById] = (balances[paidById] || 0) + exp.amount;
      exp.splits.forEach((s) => {
        const uid = s.user.toString();
        balances[uid] = (balances[uid] || 0) - s.amountOwed;
      });
    });

    Object.keys(balances).forEach((k) => {
      balances[k] = Math.round(balances[k] * 100) / 100;
    });

    return res.json({ balances });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/expenses/:id/settle/:userId  - mark a member's share as settled
const settleSplit = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    const check = await ensureMember(expense.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const split = expense.splits.find((s) => s.user.toString() === req.params.userId);
    if (!split) return res.status(404).json({ message: "Split entry not found for this user" });

    split.settled = true;
    await expense.save();
    return res.json({ expense });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    const check = await ensureMember(expense.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    await expense.deleteOne();
    return res.json({ message: "Expense deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createExpense,
  getExpensesForGroup,
  getGroupBalances,
  settleSplit,
  deleteExpense,
};
