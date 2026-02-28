// Sockets/Chat.markRead.socket.js
const Message = require("../Models/Message.model")
const BoardMembership = require("../Models/BoardMembership.model")

const messageSeenSocket = (io, socket) => {

  socket.on("chat:markRead", async (data) => {
    try {
      const { messageIds, boardId, userId, receiverId } = data

      if (!messageIds?.length || !boardId || !userId) return

      const membership = await BoardMembership.findOne({
        userId,
        boardId,
        status: "APPROVED",
      })
      if (!membership) return

      await Message.updateMany(
        { _id: { $in: messageIds }, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      )

      // Notify everyone in the board room
      io.to(`board_${boardId}`).emit("chat:updateRead", {
        messageIds,
        readerId: userId,
      })

    } catch (err) {
      console.error("chat:markRead error:", err)
    }
  })
}

module.exports = messageSeenSocket