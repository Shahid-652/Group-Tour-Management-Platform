const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["pending", "in_progress", "done"], default: "pending" },
    dueDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
