const Message = require("../Models/Message.model")
const BoardMembership = require("../Models/BoardMembership.model")

const messageSeenSocket = (io, socket) => {

  socket.on("chat:markRead", async (data) => {
    try {
      const readerId = socket.user._id
      const { messageIds, boardId, receiverId } = data

      if (!Array.isArray(messageIds) || messageIds.length === 0 || !boardId) {
        return
      }
      
      const membership = await BoardMembership.findOne({
        userId: readerId,
        boardId,
        status: "APPROVED",
      })

      if (!membership) return

      
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          boardId,
          sender: { $ne: readerId },     
          readBy: { $ne: readerId },     
        },
        {
          $addToSet: { readBy: readerId },
        }
      )

    
      if (receiverId) {
        io.to(`user_${receiverId}`).emit("chat:updateRead", {
          messageIds,
          readerId,
        })

        io.to(`user_${readerId}`).emit("chat:updateRead", {
          messageIds,
          readerId,
        })
      } else {
        io.to(`board_${boardId}`).emit("chat:updateRead", {
          messageIds,
          readerId,
        })
      }

    } catch (err) {
      console.error("chat:markRead error:", err)
    }
  })
}

module.exports = messageSeenSocket
