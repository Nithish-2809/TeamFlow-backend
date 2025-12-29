const express = require("express")
const { userSignup } = require("../Controllers/User.controller")
const upload = require("../Middlewares/FileUpload.middleware")

const userRouter = express.Router()

userRouter.post(
  "/signup",
  upload.single("profilePic"), 
  userSignup
)

module.exports = userRouter
