const cloudinary = require("cloudinary").v2;
const { promisify } = require("util");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
});

const uploadFile = async (file) => {

    try {

        const uploadAsync = promisify(cloudinary.uploader.upload);
        const result = await uploadAsync(file.tempFilePath);
        // const uploadedFile = result.secure_url;
        const uploadedFile = result;
        return uploadedFile;

    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    uploadFile
}

