require("dotenv").config()
const Invite = require("../Models/Invite.model")
const mongoose = require("mongoose")
const crypto = require("crypto")

const createInviteLink = async(req,res)=> {
    try {
        const boardId = req.membership.boardId
        const userId = req.user._id

        const token = crypto.randomBytes(24).toString("hex")

        const invite = await Invite.create({
            boardId,
            token,
            createdBy : userId,
            expiresAt : new Date(Date.now()+ 10*24*60*60*1000)
        })

        return res.status(201).json({
            msg: "Invite link created successfully",
            inviteLink: `${process.env.CLIENT_URL}/invite/${invite.token}`,
        });
    }
    catch(err) {
        console.error(err)
        return res.status(500).json({"msg" : "Failed to create an invite link"})
    }
}

const validateInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await Invite.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate("boardId", "name");

    if (!invite) {
      return res.status(404).json({
        msg: "Invalid or expired invite link"
      });
    }

    return res.status(200).json({
      board: {
        _id: invite.boardId._id,
        name: invite.boardId.name,
        expiresAt: invite.expiresAt
      }
    });
  }
   catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to validate the invite link"
    })
  }
}

module.exports = { createInviteLink,validateInvite }