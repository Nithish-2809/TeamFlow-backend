const Message = require("../Models/Message.model")
const BoardMembership = require("../Models/BoardMembership.model")

const chatSocket = (io, socket) => {

  socket.on("chat:send", async (data) => {
    try {
      const userId = socket.user._id
      const { content, boardId } = data

      if (!content || !content.trim() || !boardId) {
        return
      }

      const membership = await BoardMembership.findOne({
        userId,
        boardId,
        status: "APPROVED",
      })

      if (!membership) return

    
      const message = await Message.create({
        msg: content.trim(),
        sender: userId,
        boardId,
        readBy: [userId], 
      })

    
      io.to(`board_${boardId}`).emit("chat:newMessage", {
        message,
      })

    } catch (err) {
      console.error("chat:send (board) error:", err)
    }
  })
}

module.exports = chatSocket
