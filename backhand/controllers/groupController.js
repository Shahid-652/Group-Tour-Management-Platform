const crypto = require("crypto");
const Group = require("../models/Group");
const User = require("../models/User");

const generateInviteCode = () => crypto.randomBytes(4).toString("hex").toUpperCase();

// @route POST /api/groups
const createGroup = async (req, res, next) => {
  try {
    const { name, description, coverColor } = req.body;
    if (!name) return res.status(400).json({ message: "Group name is required" });

    let inviteCode = generateInviteCode();
    while (await Group.findOne({ inviteCode })) {
      inviteCode = generateInviteCode();
    }

    const group = await Group.create({
      name,
      description,
      coverColor,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "owner" }],
      inviteCode,
    });

    return res.status(201).json({ group });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/groups  (groups the logged-in user belongs to)
const getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ "members.user": req.user._id })
      .populate("members.user", "name email avatarColor")
      .populate("owner", "name email avatarColor")
      .sort({ createdAt: -1 });
    return res.json({ groups });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/groups/:id
const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members.user", "name email avatarColor")
      .populate("owner", "name email avatarColor");
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: "You are not a member of this group" });

    return res.json({ group });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/groups/join  { inviteCode }
const joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ message: "Invite code is required" });

    const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase().trim() });
    if (!group) return res.status(404).json({ message: "Invalid invite code" });

    const alreadyMember = group.members.some((m) => m.user.toString() === req.user._id.toString());
    if (alreadyMember) return res.status(409).json({ message: "You are already a member of this group" });

    group.members.push({ user: req.user._id, role: "member" });
    await group.save();

    const populated = await group.populate("members.user", "name email avatarColor");
    return res.json({ group: populated });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/groups/:id/invite-friend  { email }
// Invites a registered user directly by email (adds them if found)
const inviteFriendByEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: "You are not a member of this group" });

    const friend = await User.findOne({ email: email.toLowerCase() });
    if (!friend) {
      return res.status(404).json({
        message: "No account found with this email. Share the invite code instead.",
        inviteCode: group.inviteCode,
      });
    }

    const alreadyMember = group.members.some((m) => m.user.toString() === friend._id.toString());
    if (alreadyMember) return res.status(409).json({ message: "This user is already a member" });

    group.members.push({ user: friend._id, role: "member" });
    await group.save();

    const populated = await group.populate("members.user", "name email avatarColor");
    return res.json({ group: populated });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/groups/:id/members/:userId  (owner only, or self-leave)
const removeMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isOwner = group.owner.toString() === req.user._id.toString();
    const isSelf = req.params.userId === req.user._id.toString();
    if (!isOwner && !isSelf) {
      return res.status(403).json({ message: "Only the group owner can remove other members" });
    }
    if (req.params.userId === group.owner.toString()) {
      return res.status(400).json({ message: "Group owner cannot be removed" });
    }

    group.members = group.members.filter((m) => m.user.toString() !== req.params.userId);
    await group.save();
    return res.json({ message: "Member removed" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroup,
  inviteFriendByEmail,
  removeMember,
};
