const mongoose = require("mongoose")
const Message = require("../Models/Message.model")
const BoardMembership = require("../Models/BoardMembership.model")

const getChatHistory = async (req, res) => {
  try {
    const { boardId } = req.params
    const { limit = 40, cursor } = req.query
    const userId = req.user._id

    const membership = await BoardMembership.findOne({
      userId,
      boardId,
      status: "APPROVED",
    })

    if (!membership)
      return res.status(403).json({ msg: "Access denied" })

    const query = {
      boardId,
      ...(cursor && { createdAt: { $lt: new Date(cursor) } }),
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) 
      .limit(Number(limit))
      .populate("sender", "profilePic userName")

    const approvedMembersCount = await BoardMembership.countDocuments({
      boardId,
      status: "APPROVED",
    })

    return res.status(200).json({
      messages,
      approvedMembersCount,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: "Failed to get chat history" })
  }
}

const getBoardChats = async (req, res) => {
  try {
    const userId = req.user._id

  
    const memberships = await BoardMembership.find({
      userId,
      status: "APPROVED",
    }).populate("boardId", "name")

    if (memberships.length === 0) {
      return res.status(200).json({ chats: [] })
    }

    const chats = []

    
    for (const membership of memberships) {
      const board = membership.boardId

      
      const lastMessage = await Message.findOne({
        boardId: board._id,
        receiver: null, 
      })
        .sort({ createdAt: -1 })
        .populate("sender", "userName")

      if (!lastMessage) continue

      const unreadCount = await Message.countDocuments({
        boardId: board._id,
        receiver: null,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      })

      chats.push({
        boardId: board._id,
        board: board.name,
        lastMessage: lastMessage.msg,
        sender: lastMessage.sender?.userName || "Unknown",
        time: lastMessage.createdAt,
        unreadCount
      })
    }

    return res.status(200).json({ chats })
  } catch (err) {
      console.error(err)
      return res.status(500).json({ msg: "Failed to fetch the chats" })
  }
}


module.exports = { getChatHistory,getBoardChats }