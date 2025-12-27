require("dotenv").config()
const cloudinary = require("cloudinary").v2


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});



const uploadOnCloudinary = async (fileBuffer) => {
  try {
    if (!fileBuffer) return null

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "teamflow/profile_pics",
          resource_type: "image"
        },
        (error, response) => {
          if (error) return reject(error)
          resolve(response)
        }
      ).end(fileBuffer)
    })

    console.log("file uploaded on cloudinary:", result.secure_url)
    return result

  } catch (error) {
    console.error("Cloudinary upload error:", error.message)
    return null
  }
}

module.exports = uploadOnCloudinary
