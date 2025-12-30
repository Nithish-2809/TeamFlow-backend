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



module.exports = { createBoard }
