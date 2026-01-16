require("dotenv").config()
const User = require("../Models/User.Model.js")
const bcrypt = require("bcrypt")
const uploadOnCloudinary = require("../utils/Cloudinary.js")
const jwt = require("jsonwebtoken")
const sendEmail = require("../utils/sendEmail")
const PasswordResetToken = require("../Models/PasswordResetToken.model.js")
const crypto = require("crypto")

const userSignup = async (req, res) => {
  try {
    const { userName, email, fullName, password } = req.body

    if (!userName || !email || !fullName || !password) {
      return res.status(400).json({
        msg: "All fields are required"
      })
    }

    const existingUser = await User.findOne({
      $or: [{ userName }, { email }]
    })

    if (existingUser) {
      return res.status(409).json({
        msg: "User already exists"
      })
    }

    
    let profilePicUrl = ""

    if (req.file) {
      const uploadedImage = await uploadOnCloudinary(req.file.buffer)
      if (!uploadedImage) {
        return res.status(500).json({
          msg: "Profile image upload failed"
        })
      }
      profilePicUrl = uploadedImage.secure_url
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      userName,
      email,
      fullName,
      password: hashedPassword,
      profilePic: profilePicUrl
    })

    const newUser = await User.findById(user._id).select("-password")

    return res.status(201).json({
      msg: "Signup successful",
      user: newUser
    })

  } catch (error) {
    console.error("Signup error:", error)
    return res.status(500).json({
      msg: "Signup failed"
    })
  }
}

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        msg: "All fields are required"
      })
    }

    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      return res.status(401).json({
        msg: "Invalid email or password"
      })
    }

    const isValid = await bcrypt.compare(password, existingUser.password)

    if (!isValid) {
      return res.status(401).json({
        msg: "Invalid email or password"
      })
    }


    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    return res.status(200).json({
      msg: "Login successful",
      token,
      user: {
         _id: existingUser._id,
        userName: existingUser.userName,
        email: existingUser.email,
        fullName: existingUser.fullName,
        profilePic: existingUser.profilePic
      }
    })

  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      msg: "Login failed"
    })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const genericResponse = {
      msg: "A password reset link has been sent to this email"
    }

    
    if (!email) {
      return res.status(200).json(genericResponse)
    }

    const user = await User.findOne({ email })

    
    if (!user) {
      return res.status(200).json(genericResponse)
    }


    await PasswordResetToken.deleteMany({ userId: user._id })

    
    const rawToken = crypto.randomBytes(32).toString("hex")

  
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex")

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) 

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      isUsed: false
    })

    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`

    
    await sendEmail({
      to: user.email,
      subject: "Reset your TeamFlow password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    })

    return res.status(200).json(genericResponse)

  } catch (err) {
    console.error("Forgot password error:", err)
    return res.status(500).json({
      msg: "Something went wrong. Please try again later."
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { newPassword, confirmPassword } = req.body

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        msg: "Invalid request"
      })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        msg: "Passwords do not match"
      })
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    
    const resetToken = await PasswordResetToken.findOne({
      tokenHash,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    })

    if (!resetToken) {
      return res.status(400).json({
        msg: "Reset link is invalid or expired"
      })
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10)

    
    await User.findByIdAndUpdate(resetToken.userId, {
      password: hashedPassword
    })

  
    resetToken.isUsed = true
    await resetToken.save()

    return res.status(200).json({
      msg: "Password reset successful"
    })

  } catch (err) {
    console.error("Reset password error:", err)
    return res.status(500).json({
      msg: "Something went wrong"
    })
  }
}

const userProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" })
    }

    const { userName, email, fullName, profilePic } = req.user

    return res.status(200).json({
      userName,
      email,
      fullName,
      profilePic,
    })
  } catch (err) {
    console.error("userProfile error:", err)
    return res.status(500).json({ msg: "Unable to fetch profile" })
  }
}



module.exports = { userSignup,userLogin,forgotPassword,resetPassword,userProfile }
