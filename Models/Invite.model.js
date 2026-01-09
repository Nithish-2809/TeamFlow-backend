const mongoose = require("mongoose")


const inviteSchema = new mongoose.Schema({
    boardId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Board",
        required : true
    },
    token : {
        type : String,
        unique : true,
        required : true,
        index : true
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
},{timestamps : true})


module.exports = 
  mongoose.models.Invite || mongoose.model("Invite",inviteSchema)