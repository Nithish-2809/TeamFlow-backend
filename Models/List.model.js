const mongoose = require("mongoose")

const listSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true
    },

    position: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)



module.exports = 
  mongoose.models.List || mongoose.model("List", listSchema)
