const Board = require("../Models/Board.model")
const BoardMembership = require("../Models/BoardMembership.model")
const Invite = require("../Models/Invite.model")
const List = require("../Models/List.model")
const Task = require("../Models/Task.model")
const Message = require("../Models/Message.model")
const mongoose = require("mongoose")



const createBoard = async (req, res) => {
  try {
    const { name } = req.body
    const userId = req.user._id

    if (!name) {
      return res.status(400).json({
        msg: "Board name is required"
      })
    }

    const newBoard = await Board.create({
      name,
      leader: userId
    })

    
    await BoardMembership.create({
      boardId: newBoard._id,
      userId,
      isAdmin: true,
      status: "APPROVED"
    })

    return res.status(201).json({
      msg: "Board created successfully",
      board: {
        _id: newBoard._id,
        name: newBoard.name
      }
    })

  } catch (error) {
    console.error("Create board error:", error)
    return res.status(500).json({
      msg: "Board creation failed"
    })
  }
}

const myBoards = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ msg: "Please login to continue" });
    }

    const memberships = await BoardMembership.find({
      userId: user._id,
      status: "APPROVED",
    }).populate({
      path: "boardId",
      populate: {
        path: "leader",
        select: "userName profilePic",
      },
    });

    const boards = await Promise.all(
      memberships.map(async (membership) => {
        const membersCount = await BoardMembership.countDocuments({
          boardId: membership.boardId._id,
          status: "APPROVED",
        });

        return {
          _id: membership.boardId._id,
          name: membership.boardId.name,
          leader: {
            _id: membership.boardId.leader._id,
            userName: membership.boardId.leader.userName,
            profilePic: membership.boardId.leader.profilePic,
          },
          isAdmin: membership.isAdmin,
          membersCount,
          updatedAt: membership.boardId.updatedAt,
        };
      })
    );

    return res.status(200).json({ boards });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to fetch boards" });
  }
}

const getBoardById = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!boardId) {
      return res.status(400).json({ msg: "Please send a boardId" });
    }

    const membership = req.membership;

    const board = await Board.findById(boardId).populate("leader","userName email")

    if (!board) {
      return res.status(404).json({ msg: "Board not found" });
    }

    return res.status(200).json({
      _id: board._id,
      name: board.name,
      leader: {
        _id: board.leader._id,
        userName: board.leader.userName,
        email: board.leader.email,
      },
      isAdmin: membership.isAdmin,
      createdAt: board.createdAt,
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to fetch the board details!" });
  }
}

const renameBoard = async (req, res) => {
  try {
    let { name } = req.body
    const boardId = req.membership.boardId
    const io = req.app.get("io")
    
    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Name cannot be empty" })
    }

    name = name.trim()

    const board = await Board.findOneAndUpdate(
      { _id: boardId },
      { name },
      { new: true }
    )

    if (!board) {
      return res.status(404).json({ msg: "Cannot find the board" })
    }

    io.to(`board_${boardId}`).emit("board:renamed", {
      boardId,
      newName: board.name
    })

    return res.status(200).json({
      msg: "Board renamed sucessfully",
      board: {
        _id: board._id,
        name: board.name
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "Failed to rename the board" })
  }
}

const deleteBoard = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const userId = req.user._id
    const { boardId } = req.params

    const membership = await BoardMembership.findOne({
      boardId,
      userId,
      status: "APPROVED",
      isAdmin: true,
    })
      .populate("boardId", "name")
      .session(session)

    if (!membership) {
      await session.abortTransaction()
      session.endSession()
      return res.status(403).json({
        msg: "Only admin can delete the board!",
      })
    }

    await Board.deleteOne({ _id: boardId }).session(session)
    await BoardMembership.deleteMany({ boardId }).session(session)
    await List.deleteMany({ boardId }).session(session)
    await Task.deleteMany({ boardId }).session(session)
    await Message.deleteMany({ boardId }).session(session)
    await Invite.deleteMany({ boardId }).session(session)

    await session.commitTransaction()
    session.endSession()


    const io = req.app.get("io")
    io.to(`board_${boardId}`).emit("board:deleted", {
      boardId,
      boardName: membership.boardId.name,
    })

    return res.status(200).json({
      msg: "Board deleted successfully",
    })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    console.error("deleteBoard error:", err)
    return res.status(500).json({
      msg: "Failed to delete the board",
    })
  }
}

const pendingBoards = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ msg: "Please login to continue" });
    }

    const memberships = await BoardMembership.find({
      userId: user._id,
      status: "PENDING",
    }).populate({
      path: "boardId",
      populate: {
        path: "leader",
        select: "userName profilePic",
      },
    });

    const boards = memberships.map((membership) => ({
      _id: membership.boardId._id,
      name: membership.boardId.name,
      leader: {
        _id: membership.boardId.leader._id,
        userName: membership.boardId.leader.userName,
        profilePic: membership.boardId.leader.profilePic,
      },
      requestedAt: membership.createdAt,
    }));

    return res.status(200).json({ boards });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to fetch pending boards" });
  }
};




module.exports = { createBoard,myBoards,getBoardById,renameBoard,deleteBoard,pendingBoards }
