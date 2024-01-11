const express = require('express')
const router = require("express").Router();
const User = require('../../models/User.js');
const { errorHandler } = require('../../utils/error.js')
// Require the cloudinary library
const Upload = require("../../helpers/uploadFile.js");



// user Details 
router.get('/myprofile', async (req, res, next) => {
    try {
        id = await req.user._id;
        const user = await User.findById(id);
        // const user = await User.findById(req.params.id);

        if (!user) return next(errorHandler(404, 'User not found!'));

        const { password, ...rest } = user._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
});


// User profile Update
// not in use
// router.put("/myprofile", async (req, res) => {
//     try {

//         // uploading files to cloudinary
//         const file = req.files.photo;
//         // console.log(file.name)
//         const upload = await Upload.uploadFile(file);
//         const UploadedFile = upload.secure_url;
//         // console.log(upload)

//         if (file) {
//             const UploadedFileName = file.name;
//             file.mv('../../public/ProfileImages' + UploadedFileName, (err) => {
//                 if (err) {
//                     res.send(err);
//                 }else{
//                     res.send("File Uploaded")
//                 }
//             })

//         }

//         if (UploadedFile) {
//             const id = req.user._id; // getting user id form the jwt encryption

//             const updatedUser = await User.findByIdAndUpdate(id, {
//                 name: req.body.name,
//                 phoneNumber: req.body.phoneNumber,
//                 photo: UploadedFile,
//                 resume: req.body.resume,
//                 year: req.body.year,
//                 Domain: req.body.Domain,
//                 admissionNumber: req.body.admissionNumber,
//                 phoneNumber: req.body.phoneNumber,
//                 socialLinks: req.body.socialLinks
//             }, { new: true });
//             if (updatedUser) {
//                 res.status(200).json({ success: true, message: "User profile updated successfully" });
//             } else {
//                 res.status(404).json({ success: false, message: "User not found" });
//             }
//         } else {
//             res.status(404).json({ success: false, message: "User Image not Found" })
//         }

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "User profile not updated" });
//     }
// });

router.put("/myprofile", async (req, res) => {
    try {
        // Check if a file is provided
        if (!req.files || !req.files.photo) {
            return res.status(400).json({ success: false, message: "No file provided" });
        }

        const file = req.files.photo;
        const resume = req.files.resume;

        // Uploading file to Cloudinary
        const cloudinaryUpload = await Upload.uploadFile(file, 'ProfileImages');
        const uploadedFile = cloudinaryUpload.secure_url;
        const cloudinaryUploadResume = await Upload.uploadFile(resume, 'ResumeImages');
        const uploadedFileResume = cloudinaryUploadResume.secure_url;

        const uploadedProfileName = file.name;
        const uploadedResumeName = resume.name;
        if (!uploadedFile) {
            return res.status(400).json({ success: false, message: "File not uploaded" });
        }

        // Move file to local directory
        file.mv(`./public/UserProfileImages/${uploadedProfileName}`, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Error moving file to local directory" });
            }

            // Update user profile in the database
            const id = req.user._id;
            const updatedUser = await User.findByIdAndUpdate(id, {
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                photo: uploadedFile,
                resume: uploadedFileResume,
                year: req.body.year,
                domain: req.body.Domain,
                admissionNumber: req.body.admissionNumber,
                socialLinks: req.body.socialLinks
            }, { new: true });

            if (updatedUser) {
                res.status(200).json({ success: true, message: "User profile updated successfully", user: updatedUser });
            } else {
                res.status(404).json({ success: false, message: "User not found" });
            }
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "User profile not updated" });
    }
});


// user Deletion
router.get('/delete/:id', async (req, res, next) => {
    if (req.user._id !== req.params.id)
        return next(errorHandler(401, 'You can only delete your own account!'));
    try {
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie('access_token');
        res.status(200).json('User has been deleted!');
    } catch (error) {
        next(error);
    }
});
module.exports = router;