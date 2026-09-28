const mongoose = require("mongoose");

const MemorySchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    title: { type: String, required: true, trim: true },
    driveLink: { type: String, required: true, trim: true },
    mediaType: { type: String, enum: ["photo", "video", "mixed", "other"], default: "mixed" },
    note: { type: String, trim: true, default: "" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Memory", MemorySchema);
