const mongoose = require("mongoose")

const BoardMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
)

BoardMembershipSchema.index(
  { userId: 1, boardId: 1 },
  { unique: true }
)



module.exports  = 
  mongoose.models.BoardMembership || mongoose.model("BoardMembership", BoardMembershipSchema)
