require("dotenv").config()
const jwt = require("jsonwebtoken")
const User = require("../Models/User.Model")

const restrictToLoggedinUserOnly = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        msg: "Unauthorized: Token missing"
      })
    }
    
    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(401).json({
        msg: "Unauthorized: User not found"
      })
    }

    req.user = user

    next()

  } catch (e) {
    console.error("Auth middleware error:", e)
    return res.status(401).json({
      msg: "Unauthorized: Invalid or expired token"
    })
  }
}

module.exports = restrictToLoggedinUserOnly
