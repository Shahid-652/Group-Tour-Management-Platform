const mongoose = require("mongoose");

const ItineraryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, default: "" },
    location: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { _id: true }
);

const TripSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    itinerary: [ItineraryItemSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", TripSchema);
