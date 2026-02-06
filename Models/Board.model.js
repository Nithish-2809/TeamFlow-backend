const mongoose = require("mongoose")

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    emoji: {
      type: String,
      default: "📋",
    }
  },
  { timestamps: true }
)



module.exports = 
  mongoose.models.Board || mongoose.model("Board", boardSchema)
