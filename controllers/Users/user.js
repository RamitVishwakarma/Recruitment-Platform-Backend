const express = require('express')
const router = require("express").Router();
const User = require('../../models/User.js');
const errorHandler = require('../../utils/error.js')
// Require the cloudinary library
const Upload = require("../../helpers/uploadFile.js");
const upload = require("../../helpers/multer.js");
const resume = require("../../helpers/Resumemulter.js");
const NodeCache = require('node-cache');
const ProjectSubmission = require('../../models/ProjectSubmission.js');

const nodeCache = new NodeCache({
    stdTTL: 100,
    checkperiod: 120
});

// user Details 
router.get('/myprofile', async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Check if user details are in the cache
        let userDetails = nodeCache.get(`userDetails:${userId}`);

        if (!userDetails) {
            // If not in the cache, fetch from the database
            const user = await User.findById(userId);

            if (!user) {
                return next(errorHandler(404, 'User not found!'));
            }

            // Fetch submission details
            const submissionDetails = await ProjectSubmission.find({ userId })
                .select('submissionLink');

            // Combine user and submission details
            const userDetailsWithSubmissions = {
                user: {
                    ...user._doc,
                    password: undefined, // Omitting password for security reasons
                },
                ProjectSubmission: submissionDetails,
            };
            // console.log("🚀 ~ router.get ~ userDetailsWithSubmissions.user:", userDetailsWithSubmissions.user);


            // Store in the cache
            nodeCache.set(`userDetails:${userId}`, JSON.stringify(userDetailsWithSubmissions));

            res.status(200).json(userDetailsWithSubmissions);
        } else {
            // If in the cache, return cached data
            const cachedUserDetails = JSON.parse(userDetails);
            res.status(200).json(cachedUserDetails);
        }
    } catch (error) {
        next(error);
    }
});




// User profile Update
router.put("/Updateprofile", upload.single('photo'), async (req, res) => {
    try {
        // let uploadedFile = req.user.photo;
        // console.log(uploadedFile)
        var tempPath = req.file
        if (tempPath) {
            const file = req.file.path
            // console.log(file);

            // Uploading file to Cloudinary
            const cloudinaryUpload = await Upload.uploadFile(file, 'ProfileImages');
            // console.log(cloudinaryUpload)
            // console.log(cloudinaryUpload)
            if (!cloudinaryUpload) {
                return res.status(400).json({ success: false, message: "File not uploaded" });
            }
            const uploadedFile = cloudinaryUpload.secure_url;
            // console.log(uploadedFile)
            // Update user profile in the database
            const id = req.user._id;
            const updatedUser = await User.findByIdAndUpdate(id, {
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                photo: uploadedFile,
                year: req.body.year,
                domain: req.body.domain,
                admissionNumber: req.body.admissionNumber,
                socialLinks: req.body.socialLinks
            }, { new: true, select: '-password' });

            if (updatedUser) {
                res.status(200).json({ success: true, message: "User profile updated successfully", user: updatedUser });
                nodeCache.del("userDetails"); // Delete user details from the cache

            } else {
                res.status(404).json({ success: false, message: "User not found" });
            }
        } else {
            // Update user profile in the database
            const id = req.user._id;
            const updatedUser = await User.findByIdAndUpdate(id, {
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                year: req.body.year,
                domain: req.body.domain,
                admissionNumber: req.body.admissionNumber,
                socialLinks: req.body.socialLinks
            }, { new: true, select: '-password' });

            if (updatedUser) {
                res.status(200).json({ success: true, message: "User profile updated successfully", user: updatedUser });
                nodeCache.del("userDetails"); // Delete user details from the cache
            } else {
                res.status(404).json({ success: false, message: "User not found" });
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "User profile not updated" });
    }
});


// update users resume
router.put("/Updateresume", resume.single('resume'), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ success: false, message: "File not present" });
        }

        const file = req.file.path
        console.log(file);

        // Uploading file to Cloudinary
        const cloudinaryUpload = await Upload.uploadFile(file, 'ResumeImages');
        if (!cloudinaryUpload) {
            return res.status(400).json({ success: false, message: "File not uploaded" });
        }
        const uploadedFile = cloudinaryUpload.secure_url;

        const id = req.user._id;
        if (!id) {
            return res.status(400).json({ success: false, message: "User Not Found" });
        }
        // Update user resume in the database
        const updatedUser = await User.findByIdAndUpdate(id, {
            resume: uploadedFile,

        }, { new: true, select: '-password' });

        if (updatedUser) {
            res.status(200).json({ success: true, message: "User Resume updated successfully", user: updatedUser });
            nodeCache.del("userDetails"); // Delete user details from the cache
        } else {
            res.status(404).json({ success: false, message: "User not found" });

        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "User Resume not updated" });
    }
});


// user Deletion
router.delete('/delete/:id', async (req, res, next) => {
    // Ensure that the route is only accessible to authenticated users
    if (!req.user) {
        return next(errorHandler(401, 'Unauthorized. Please log in.'));
    }

    try {
        // Check if the authenticated user is trying to delete their own account
        if (req.user._id !== req.params.id) {
            return next(errorHandler(403, 'Forbidden. You can only delete your own account.'));
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return next(errorHandler(404, 'User not found.'));
        }
        // Clear the Authorization token from headers
        res.removeHeader('Authorization');
        res.status(204).json({ success: true, message: 'User has been deleted successfully.' });
    } catch (error) {
        next(errorHandler(500, `Internal Server Error: ${error.message}`));
    }
});


module.exports = router;