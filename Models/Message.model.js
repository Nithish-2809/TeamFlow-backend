const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
  {
    msg: {
      type: String,
      required: true,
      trim: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
  },
  { timestamps: true }
)

messageSchema.index({ boardId: 1, createdAt: -1 })
messageSchema.index({ receiverId: 1, createdAt: -1 })

module.exports =
  mongoose.models.Message || mongoose.model("Message", messageSchema)
