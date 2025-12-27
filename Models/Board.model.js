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
    }
  },
  { timestamps: true }
)

const Board = mongoose.model("Board", boardSchema)

module.exports = Board
