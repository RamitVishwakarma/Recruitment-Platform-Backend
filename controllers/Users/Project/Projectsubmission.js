const router = require("express").Router();
const ProjectSubmissionModel = require('../../../models/ProjectSubmission.js');



// submitting a project
router.post('/submission/:id', async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User Not Found' });
        }

        // Check if the user has already submitted a project
        const existingSubmission = await ProjectSubmissionModel.findOne({ userId });

        if (existingSubmission) {
            return res.status(400).json({ success: false, message: 'User has already submitted a project' });
        }

        const { submissionLink } = req.body;

        // Validate required fields
        if (!submissionLink) {
            return res.status(400).json({ success: false, message: 'submissionLink is a required field' });
        }

        // Create a new project submission
        const projectSubmission = new ProjectSubmissionModel({
            userId,
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