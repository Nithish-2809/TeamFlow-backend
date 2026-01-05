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




module.exports = {acceptInviteRequest,rejectInviteRequest}