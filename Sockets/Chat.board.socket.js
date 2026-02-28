// Sockets/Chat.board.socket.js
const Message = require("../Models/Message.model")
const BoardMembership = require("../Models/BoardMembership.model")

const boardChatSocket = (io, socket) => {

  socket.on("chat:send", async (data) => {
    try {
      const { content, boardId, userId } = data

      if (!content || !content.trim() || !boardId || !userId) return

      const membership = await BoardMembership.findOne({
        userId,
        boardId,
        status: "APPROVED",
      })

      if (!membership) return

      const created = await Message.create({
        msg: content.trim(),
        sender: userId,
        boardId,
        readBy: [userId],
      })

      // Populate sender so client gets { _id, userName, profilePic }
      const message = await Message.findById(created._id)
        .populate("sender", "userName profilePic")

      io.to(`board_${boardId}`).emit("chat:newMessage", { message })

    } catch (err) {
      console.error("chat:send error:", err)
    }
  })
}

module.exports = boardChatSocket