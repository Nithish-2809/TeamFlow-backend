const express = require("express")
const {
  userSignup,
  userLogin,
  forgotPassword,
  resetPassword,
  userProfile,
  googleSignup,
  googleLogin
} = require("../Controllers/User.controller")

const upload = require("../Middlewares/FileUpload.middleware")
const restrictToLoggedinUserOnly = require("../Middlewares/AuthZ.middleware")

const userRouter = express.Router()

userRouter
  
  .post(
    "/signup",
    upload.single("profilePic"),
    userSignup
  )
  .post("/login", userLogin)

  
  .post("/google-signup", googleSignup)
  .post("/google-login", googleLogin)

  
  .post("/forgot-password", forgotPassword)
  .patch("/reset-password/:token", resetPassword)

  
  .get("/profile", restrictToLoggedinUserOnly, userProfile)

module.exports = userRouter
