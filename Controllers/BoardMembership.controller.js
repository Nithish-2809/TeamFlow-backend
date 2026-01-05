const mongoose = require("mongoose")
const BoardMembership = require("../Models/BoardMembership.model")


const acceptInviteRequest = async (req, res) => {
  try {
    const { boardId, userId } = req.params;

    const membership = await BoardMembership.findOneAndUpdate(
      { userId, boardId, status: "PENDING" },
      { status: "APPROVED" },
      { new: true }
    );

    if (!membership) {
      return res.status(404).json({ msg: "No pending request found" });
    }

    return res.status(200).json({
      msg: "Request accepted",
      member: {
        userId: membership.userId,
        boardId: membership.boardId,
        status: membership.status
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to approve board member"
    });
  }
}

const rejectInviteRequest = async (req, res) => {
  try {
    const { boardId, userId } = req.params;

    const membership = await BoardMembership
      .findOne({ boardId, userId, status: "PENDING" })
      .populate("userId", "userName");

    if (!membership) {
      return res.status(404).json({ msg: "No pending request" });
    }

    const userName = membership.userId.userName;

    await membership.deleteOne();

    return res.status(200).json({
      msg: "Request rejected",
      userName
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to reject the user"
    });
  }
}

const removeBoardMember = async (req, res) => {
  try {
    const { boardId, userId } = req.params;
    const adminId = req.user._id;

    if (adminId.toString() === userId) {
      return res.status(400).json({
        msg: "Admin cannot remove themselves."
      });
    }

    const membership = await BoardMembership.findOne({
        boardId,
        userId,
        status: "APPROVED"
      })
      .populate("userId", "userName");

    if (!membership) {
      return res.status(404).json({ msg: "Board member not found" });
    }

    
    if (membership.isAdmin) {
      return res.status(400).json({
        msg: "Board admin cannot be removed"
      });
    }

    const userName = membership.userId.userName;

    await membership.deleteOne();

    return res.status(200).json({
      msg: "Board member removed successfully",
      userName
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to remove the board member"
    });
  }
};



module.exports = {acceptInviteRequest,rejectInviteRequest,removeBoardMember}