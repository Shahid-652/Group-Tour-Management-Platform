const Memory = require("../models/Memory");
const Group = require("../models/Group");

const ensureMember = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return { ok: false, code: 404, message: "Group not found" };
  const isMember = group.members.some((m) => m.user.toString() === userId.toString());
  if (!isMember) return { ok: false, code: 403, message: "You are not a member of this group" };
  return { ok: true, group };
};

const isValidLink = (link) => {
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (err) {
    return false;
  }
};

// @route POST /api/memories
// body: { group, trip, title, driveLink, mediaType, note }
const createMemory = async (req, res, next) => {
  try {
    const { group, trip, title, driveLink, mediaType, note } = req.body;
    if (!group || !title || !driveLink) {
      return res.status(400).json({ message: "group, title and driveLink are required" });
    }
    if (!isValidLink(driveLink)) {
      return res.status(400).json({ message: "driveLink must be a valid URL" });
    }

    const check = await ensureMember(group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const memory = await Memory.create({
      group,
      trip: trip || null,
      title,
      driveLink,
      mediaType: mediaType || "mixed",
      note: note || "",
      addedBy: req.user._id,
    });
    const populated = await memory.populate("addedBy", "name email avatarColor");
    return res.status(201).json({ memory: populated });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/memories/group/:groupId
const getMemoriesForGroup = async (req, res, next) => {
  try {
    const check = await ensureMember(req.params.groupId, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const memories = await Memory.find({ group: req.params.groupId })
      .populate("addedBy", "name email avatarColor")
      .sort({ createdAt: -1 });
    return res.json({ memories });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/memories/:id
const deleteMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: "Memory link not found" });

    const check = await ensureMember(memory.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const isOwnerOfGroup = check.group.owner.toString() === req.user._id.toString();
    const isUploader = memory.addedBy.toString() === req.user._id.toString();
    if (!isOwnerOfGroup && !isUploader) {
      return res.status(403).json({ message: "Only the uploader or group owner can remove this link" });
    }

    await memory.deleteOne();
    return res.json({ message: "Memory link removed" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createMemory, getMemoriesForGroup, deleteMemory };
