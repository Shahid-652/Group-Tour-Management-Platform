const Trip = require("../models/Trip");
const Group = require("../models/Group");

const ensureMember = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return { ok: false, code: 404, message: "Group not found" };
  const isMember = group.members.some((m) => m.user.toString() === userId.toString());
  if (!isMember) return { ok: false, code: 403, message: "You are not a member of this group" };
  return { ok: true, group };
};

// @route POST /api/trips
const createTrip = async (req, res, next) => {
  try {
    const { group, title, destination, startDate, endDate } = req.body;
    if (!group || !title || !destination || !startDate || !endDate) {
      return res.status(400).json({ message: "group, title, destination, startDate and endDate are required" });
    }
    const check = await ensureMember(group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const trip = await Trip.create({
      group,
      title,
      destination,
      startDate,
      endDate,
      createdBy: req.user._id,
    });
    return res.status(201).json({ trip });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/trips/group/:groupId
const getTripsForGroup = async (req, res, next) => {
  try {
    const check = await ensureMember(req.params.groupId, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const trips = await Trip.find({ group: req.params.groupId }).sort({ startDate: 1 });
    return res.json({ trips });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/trips/:id
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const check = await ensureMember(trip.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });
    return res.json({ trip });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/trips/:id
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const check = await ensureMember(trip.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const { title, destination, startDate, endDate } = req.body;
    if (title !== undefined) trip.title = title;
    if (destination !== undefined) trip.destination = destination;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    await trip.save();
    return res.json({ trip });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/trips/:id
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const check = await ensureMember(trip.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    await trip.deleteOne();
    return res.json({ message: "Trip deleted" });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/trips/:id/itinerary
const addItineraryItem = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const check = await ensureMember(trip.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const { title, date, time, location, notes } = req.body;
    if (!title || !date) return res.status(400).json({ message: "title and date are required" });

    trip.itinerary.push({ title, date, time, location, notes });
    trip.itinerary.sort((a, b) => new Date(a.date) - new Date(b.date));
    await trip.save();
    return res.status(201).json({ trip });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/trips/:id/itinerary/:itemId
const removeItineraryItem = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const check = await ensureMember(trip.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    trip.itinerary = trip.itinerary.filter((i) => i._id.toString() !== req.params.itemId);
    await trip.save();
    return res.json({ trip });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTrip,
  getTripsForGroup,
  getTripById,
  updateTrip,
  deleteTrip,
  addItineraryItem,
  removeItineraryItem,
};
