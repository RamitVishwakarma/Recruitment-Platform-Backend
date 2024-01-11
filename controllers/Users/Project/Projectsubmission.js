const router = require("express").Router();
const ProjectSubmissionModel = require('../../../models/ProjectSubmission.js');



// submitting a project
router.post('/submission/:id', async (req, res) => {
    try {
        const id = req.user._id;
        if (!id) {
            return res.status(400).json({ success: false, message: 'User Not Found' });
        }
        const { submissionLink } = req.body;

        // Validate required fields
        if (!submissionLink) {
            return res.status(400).json({ success: false, message: 'submissionLink are required fields' });
        }

        // Create a new project submission
        const projectSubmission = new ProjectSubmissionModel({
            userId: id,
            submissionLink,
        });

        const savedSubmission = await projectSubmission.save();

        res.status(201).json({ success: true, message: 'Project submitted successfully', submission: savedSubmission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to submit project' });
    }
});






module.exports = router;