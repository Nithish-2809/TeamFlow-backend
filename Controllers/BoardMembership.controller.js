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
}

const leaveBoard = async (req,res) => {
    try {
        const {boardId} = req.params
        const userId = req.user._id

        const membership = await BoardMembership.findOne({
            userId,boardId,status : "APPROVED"
        }).populate("userId","userName")

        if(!membership) {
            return res.status(404).json({"msg" : "You are not the member of this board!"})
        }

        if(membership.isAdmin) {
            return res.status(400).json({"msg" : "You cannot leave the board as you are admin."})
        }
        const userName = membership.userId.userName

        await membership.deleteOne()

        return res.status(200).json({
            "msg" : "You left the board",
            userName : userName
        })
    }
    catch(err) {
        console.error(err)
        return res.status(500).json({"msg" : "Failed to leave the board"})
    }
}

const makeBoardAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { boardId, userId } = req.params;
    const adminId = req.user._id;

    if (adminId.toString() === userId) {
      return res.status(400).json({
        msg: "You are already the admin"
      });
    }

    const newAdmin = await BoardMembership
      .findOne({
        userId,
        boardId,
        status: "APPROVED"
      })
      .populate("userId", "userName")
      .session(session);

    if (!newAdmin) {
      return res.status(404).json({
        msg: "User is not a member of this board"
      });
    }


    await BoardMembership.updateOne(
      { boardId, userId: adminId, isAdmin: true },
      { isAdmin: false },
      { session }
    );

    
    await BoardMembership.updateOne(
      { boardId, userId },
      { isAdmin: true },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      msg: "Admin changed successfully",
      userName: newAdmin.userId.userName
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);

    return res.status(500).json({
      msg: "Failed to make board admin"
    });
  }
};


module.exports = {acceptInviteRequest,rejectInviteRequest,removeBoardMember,leaveBoard,makeBoardAdmin}