const mongoose = require("mongoose")

const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tokenHash: {
    type: String,
    required: true,
    index: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true })




module.exports = 
  mongoose.models.PasswordResetToken || mongoose.model("PasswordResetToken",passwordResetTokenSchema)