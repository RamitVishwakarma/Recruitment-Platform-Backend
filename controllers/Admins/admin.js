const express = require('express');
const Admin = require('../../models/Admin');
const router = express.Router();

// get Admin Details
router.get('/myprofile', async (req, res, next) => {
    try {
        id = await req.user._id;
        const user = await Admin.findById(id);
        // const user = await User.findById(req.params.id);

        if (!user) return next(errorHandler(404, 'User not found!'));

        const { password, ...rest } = user._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
});


// User profile Update

router.put("/myprofile", async (req, res) => {
    try {
        const id = req.user._id; // getting user id form the jwt encryption

        const updatedUser = await Admin.findByIdAndUpdate(id, {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            photo: req.body.photo,
            resume: req.body.resume,
            github: req.body.github,
            linkedin: req.body.linkedin,
            admissionNumber: req.body.admissionNumber,
            phoneNumber: req.body.phoneNumber,
        });

        if (updatedUser) {
            res.status(200).json({ success: true, message: "User profile updated successfully" });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "User profile not updated" });
    }
});

module.exports = router;