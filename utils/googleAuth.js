const { OAuth2Client } = require("google-auth-library")
configDotenv.config()

const client = OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const verifyGoogleToken = async (idToken)=> {
    const ticket = await client.verifyIdToken({
        idToken,
        audience : process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    return {
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name,
        profilePic: payload.picture,
        emailVerified: payload.email_verified
    }
}

module.exports = verifyGoogleToken