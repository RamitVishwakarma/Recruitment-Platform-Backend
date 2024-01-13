const cloudinary = require("cloudinary").v2;
const { promisify } = require("util");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
});

const uploadFile = async (file, FolderName) => {

    try {

        const uploadAsync = promisify(cloudinary.uploader.upload);
        const options = {
            folder: `${FolderName}`, //  folder name h
        };
        
        const result = await uploadAsync(file, options);
        const uploadedFile = result;
        // console.log(uploadedFile)
        return uploadedFile;

    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    uploadFile
}

