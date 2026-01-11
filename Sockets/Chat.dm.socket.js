const Message = require("../Models/Message.model")
const BoardMembership = require("../Models/BoardMembership.model")

const personalChatSocket = (io,socket)=> {
    socket.on("chat:send:dm",async (data)=> {
        try {
            const senderId = socket.user._id
            const {content,receiverId,boardId}= data

            if(!content || !content.trim() || !receiverId || !boardId) return 
            
            const senderMembership = await BoardMembership.findOne({
                _id : senderId,
                boardId,
                status : "APPROVED"
            })

            if(!senderMembership) return

            const receiverMembership = await BoardMembership.findOne({
                _id : receiverId,
                boardId,
                status : "APPROVED"
            })

            if(!receiverMembership) return 

            const message = await Message.create({
                msg : content.trim(),
                sender : senderId,
                readBy : [senderId],
                boardId
            })

            io.to(`user_${receiverId}`,{
                message
            })
        }
        catch(err) {
            console.error(err)
        }
        

    })
}

module.exports = personalChatSocket