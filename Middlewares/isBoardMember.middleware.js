const BoardMembership = require("../Models/BoardMembership.model")

const isBoardMember = async (req, res, next) => {
  try {
    const { boardId } = req.params
    const userId = req.user._id

    if(!boardId) return res.status(400).json({"msg":"BoardId is required!!"})

    const membership = await BoardMembership.findOne({
      boardId,
      userId,
      status: "APPROVED"
    })

    if (!membership) {
      return res.status(403).json({
        msg: "Access denied: You are not a member of this board"
      })
    }

    
    req.membership = membership

    next()

  } catch (error) {
    console.error("Board member authorization error:", error)
    return res.status(500).json({
      msg: "Authorization failed"
    })
  }
}

module.exports = isBoardMember
