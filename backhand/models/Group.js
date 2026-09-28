const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    coverColor: { type: String, default: "#2DD4BF" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["owner", "member"], default: "member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    inviteCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
