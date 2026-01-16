const isBoardAdmin = (req, res, next) => {
  try {
    const membership = req.membership

    if (!membership) {
      return res.status(500).json({
        msg: "Board membership not found in request"
      })
    }

    if (!membership.isAdmin) {
      return res.status(403).json({
        msg: "Access denied: Only board leader can perform this action"
      })
    }

    next()

  } 
  catch (error) {
    console.error("Board admin authorization error:", error)
    return res.status(500).json({
      msg: "Authorization failed"
    })
  }
}

module.exports = isBoardAdmin
