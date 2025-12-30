const Board = require("../Models/Board.model")
const BoardMembership = require("../Models/BoardMembership.model")

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

    // Source of truth: BoardMembership
    const memberships = await BoardMembership.find({
      userId: user._id,
      status: "APPROVED",
    }).populate("boardId");

    
    const boards = memberships.map((membership) => ({
      _id: membership.boardId._id,
      name: membership.boardId.name,
      leader: membership.boardId.leader,
      isAdmin: membership.isAdmin,
      createdAt: membership.boardId.createdAt,
    }));

    return res.status(200).json({ boards });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to fetch boards" });
  }
};



module.exports = { createBoard,myBoards }
