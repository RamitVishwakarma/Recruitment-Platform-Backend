const express = require('express');
const router = express.Router();
const Admin = require('../../../models/Admin.js');
const User = require('../../../models/User.js');
const ProjectSubmission = require('../../../models/ProjectSubmission.js'); // Adjust the path as needed
const ExcelJS = require('exceljs');


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


router.get('/export-to-excel', async (req, res) => {
    try {

        // Admin Access Required
        if (!req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
        }

        const adminId = req.user._id;
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        const domain = admin.Domain;

        const users = await User.find({ Domain: domain }).lean();

        const projectSubmissions = await ProjectSubmission.find({
            userId: { $in: users.map(user => user._id) }, // Filter submissions by users from the specified domain
        }).populate('userId').lean();
        // console.log(projectSubmissions)
        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('UserDetailsAndSubmissions');

        // Define headers for the Excel sheet
        worksheet.addRow(['User ID', 'Name', 'Email', 'year', 'Domain', 'Submission ID', 'Submission Link']);

        // Populate Excel sheet
        users.forEach((user) => {
            projectSubmissions
                .filter((submission) => submission.userId._id.toString() === user._id.toString())
                .forEach((submission) => {
                    worksheet.addRow([
                        user._id,
                        user.name,
                        user.email,
                        user.year,
                        user.Domain,
                        submission._id,
                        submission.submissionLink
                    ]);
                });
        });

        // Set headers and response type 
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=UserDetailsAndSubmissions.xlsx');

        // Write the workbook to the response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting to Excel:', error);
        res.status(500).json({ success: false, message: 'Failed to export data to Excel' });
    }
});


module.exports = router;
