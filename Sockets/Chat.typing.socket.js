// Sockets/Chat.typing.socket.js
const BoardMembership = require("../Models/BoardMembership.model")

const typingSocket = (io, socket) => {

  socket.on("chat:typing:start", async (data) => {
    try {
      const { boardId, userId } = data
      if (!boardId || !userId) return

      // Broadcast to others in the board room (not the sender)
      socket.to(`board_${boardId}`).emit("chat:typing", { userId, isTyping: true })
    } catch (err) {
      console.error("chat:typing:start error:", err)
    }
  })

  socket.on("chat:typing:stop", async (data) => {
    try {
      const { boardId, userId } = data
      if (!boardId || !userId) return

      socket.to(`board_${boardId}`).emit("chat:typing", { userId, isTyping: false })
    } catch (err) {
      console.error("chat:typing:stop error:", err)
    }
  })
}

module.exports = typingSocket