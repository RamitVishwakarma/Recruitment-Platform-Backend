const express = require('express');
const router = express.Router();
const Admin = require('../../../models/Admin.js');
const ProjectSubmission = require('../../../models/ProjectSubmission.js'); // Adjust the path as needed

//  admin to retrieve all project submissions
router.get('/projectsList', async (req, res) => {
    try {
        const adminId = req.user._id;
        const admin = await Admin.findById(adminId);
        console.log(req.user)
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        if (!req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
        }

        // Retrieve all project submissions from the database
        const allSubmissions = await ProjectSubmission.find();

        res.status(200).json({ success: true, projects: allSubmissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to retrieve projects submissions' });
    }
});


//  admin to retrieve all project submissions by ID
router.get('/projectSubmission/:submissionId', async (req, res) => {
    try {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
        }

        const { submissionId } = req.params;

        if (!submissionId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid submission ID format' });
        }

        // Retrieve the project submission by ID 
        const submission = await ProjectSubmission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Project submission not found' });
        }

        res.status(200).json({ success: true, project: submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to retrieve project submission' });
    }
});

module.exports = router;
