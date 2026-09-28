const express = require("express");
const {
  createTrip,
  getTripsForGroup,
  getTripById,
  updateTrip,
  deleteTrip,
  addItineraryItem,
  removeItineraryItem,
} = require("../controllers/tripController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createTrip);
router.get("/group/:groupId", getTripsForGroup);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);
router.post("/:id/itinerary", addItineraryItem);
router.delete("/:id/itinerary/:itemId", removeItineraryItem);

module.exports = router;
