const express = require("express");
const {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroup,
  inviteFriendByEmail,
  removeMember,
} = require("../controllers/groupController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createGroup);
router.get("/", getMyGroups);
router.post("/join", joinGroup);
router.get("/:id", getGroupById);
router.post("/:id/invite-friend", inviteFriendByEmail);
router.delete("/:id/members/:userId", removeMember);

module.exports = router;
