const BoardMembership = require("../Models/BoardMembership.model")

const typingSocket = (io, socket) => {

  
  socket.on("chat:typing:start", async (data) => {
    try {
      const userId = socket.user._id
      const { boardId, receiverId } = data

      if (!boardId) return

      const membership = await BoardMembership.findOne({
        boardId,
        userId,
        status: "APPROVED",
      })

      if (!membership) return

    
      if (receiverId) {
        io.to(`user_${receiverId}`).emit("chat:typing", {
          userId,
          isTyping: true,
        })
      }
    
      else {
        socket.to(`board_${boardId}`).emit("chat:typing", {
          userId,
          isTyping: true,
        })
      }
    } catch (err) {
      console.error("chat:typing:start error", err)
    }
  })

  
  socket.on("chat:typing:stop", async (data) => {
    try {
      const userId = socket.user._id
      const { boardId, receiverId } = data

      if (!boardId) return

      const membership = await BoardMembership.findOne({
        boardId,
        userId,
        status: "APPROVED",
      })

      if (!membership) return

      
      if (receiverId) {
        io.to(`user_${receiverId}`).emit("chat:typing", {
          userId,
          isTyping: false,
        })
      }
      
      else {
        socket.to(`board_${boardId}`).emit("chat:typing", {
          userId,
          isTyping: false,
        })
      }
    } catch (err) {
      console.error("chat:typing:stop error", err)
    }
  })
}

module.exports = typingSocket
