const Task = require("../models/Task");
const Group = require("../models/Group");

const ensureMember = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return { ok: false, code: 404, message: "Group not found" };
  const isMember = group.members.some((m) => m.user.toString() === userId.toString());
  if (!isMember) return { ok: false, code: 403, message: "You are not a member of this group" };
  return { ok: true, group };
};

// @route POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { group, trip, title, description, assignedTo, dueDate } = req.body;
    if (!group || !title) return res.status(400).json({ message: "group and title are required" });

    const check = await ensureMember(group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    if (assignedTo) {
      const isMemberAssignee = check.group.members.some((m) => m.user.toString() === assignedTo);
      if (!isMemberAssignee) {
        return res.status(400).json({ message: "Assignee must be a member of the group" });
      }
    }

    const task = await Task.create({
      group,
      trip: trip || null,
      title,
      description,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });
    const populated = await task.populate("assignedTo", "name email avatarColor");
    return res.status(201).json({ task: populated });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/tasks/group/:groupId
const getTasksForGroup = async (req, res, next) => {
  try {
    const check = await ensureMember(req.params.groupId, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const tasks = await Task.find({ group: req.params.groupId })
      .populate("assignedTo", "name email avatarColor")
      .populate("createdBy", "name email avatarColor")
      .sort({ dueDate: 1, createdAt: -1 });
    return res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const check = await ensureMember(task.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const { title, description, assignedTo, status, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    await task.save();

    const populated = await task.populate("assignedTo", "name email avatarColor");
    return res.json({ task: populated });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const check = await ensureMember(task.group, req.user._id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    await task.deleteOne();
    return res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasksForGroup, updateTask, deleteTask };
