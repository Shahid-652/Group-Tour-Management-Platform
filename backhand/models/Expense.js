const mongoose = require("mongoose");

const SplitEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amountOwed: { type: Number, required: true },
    settled: { type: Boolean, default: false },
  },
  { _id: false }
);

const ExpenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["food", "transport", "accommodation", "activities", "other"],
      default: "other",
    },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    splitType: { type: String, enum: ["equal", "custom"], default: "equal" },
    splits: [SplitEntrySchema],
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
