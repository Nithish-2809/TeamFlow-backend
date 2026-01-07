require("dotenv").config()
const Invite = require("../Models/Invite.model")
const mongoose = require("mongoose")
const crypto = require("crypto")
const BoardMembership = require("../Models/BoardMembership.model")


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

const joinViaLink = async (req, res) => {
  try {
    const { token } = req.params
    const userId = req.user._id

    const invite = await Invite.findOne({
      token,
      expiresAt: { $gt: new Date() },
      isActive: true
    })

    if (!invite) {
      return res.status(400).json({
        msg: "Invalid or expired invite link"
      })
    }

    const boardId = invite.boardId

    const existingMembership = await BoardMembership.findOne({ boardId, userId })

    if (existingMembership) {
      if (existingMembership.status === "APPROVED") {
        return res.status(400).json({ msg: "You are already part of this board" })
      }
      if (existingMembership.status === "PENDING") {
        return res.status(400).json({ msg: "Your request is pending approval" })
      }
    }

    const membership = await BoardMembership.create({
      userId,
      boardId,
      isAdmin: false,
      status: "PENDING"
    })

    
    const io = req.app.get("io")

    const adminMembership = await BoardMembership.findOne({
      boardId,
      isAdmin: true,
      status: "APPROVED"
    })

    if (adminMembership) {
      io.to(`user_${adminMembership.userId}`).emit("member:join-request", {
        boardId,
        userId
      })
    }

    return res.status(200).json({
      msg: "Join request sent. Waiting for admin approval."
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      msg: "Failed to join the board"
    })
  }
}




module.exports = { createInviteLink,validateInvite,joinViaLink }