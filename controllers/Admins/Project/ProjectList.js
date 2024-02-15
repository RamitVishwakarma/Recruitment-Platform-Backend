const express = require('express');
const router = express.Router();
const Admin = require('../../../models/Admin.js');
const User = require('../../../models/User.js');
const ProjectSubmission = require('../../../models/ProjectSubmission.js'); // Adjust the path as needed
const ExcelJS = require('exceljs');


//  admin to retrieve all project submissions
router.get('/SubmittedprojectsList', async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
        }

        const adminId = req.user._id;
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const domain = admin.domain;

        // Fetch users based on the admin's domain
        const userList = await User.find({ domain });

        // Extract user IDs for project submission query
        const userIds = userList.map(user => user._id);

        // Fetch submission details for users in the domain who have submitted projects
        const submissionDetails = await ProjectSubmission.find({ userId: { $in: userIds } })
            .select('userId submissionLink');

        // Filter users who have submitted projects
        const usersWithSubmissions = userList.filter(user =>
            submissionDetails.some(submission => submission.userId.equals(user._id))
        );

        // Combine user and submission details
        const userDetailsWithSubmissions = usersWithSubmissions.map(user => {
            const userSubmissions = submissionDetails
                .filter(submission => submission.userId.equals(user._id))
                .map(submission => ({
                    submissionId: submission._id,
                    submissionLink: submission.submissionLink,
                }));

            return {
                user: {
                    ...user._doc,
                    password: undefined, // Omitting password for security reasons
                },
                ProjectSubmission: userSubmissions,
            };
        });

        res.status(200).json({ success: true, userDetailsWithSubmissions })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to retrieve projects submissions' });
    }
}
);


//  admin to retrieve all project submissions by ID---- not in use
// router.get('/projectSubmission/:submissionId', async (req, res) => {
//     try {
//         if (!req.user || !req.user.isAdmin) {
//             return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
//         }

//         const { submissionId } = req.params;

//         if (!submissionId.match(/^[0-9a-fA-F]{24}$/)) {
//             return res.status(400).json({ success: false, message: 'Invalid submission ID format' });
//         }

//         // Retrieve the project submission by ID 
//         const submission = await ProjectSubmission.findById(submissionId);

//         if (!submission) {
//             return res.status(404).json({ success: false, message: 'Project submission not found' });
//         }

//         res.status(200).json({ success: true, project: submission });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Failed to retrieve project submission' });
//     }
// });


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
        const domain = admin.domain;

        const users = await User.find({ domain: domain }).lean();
        // const users = await User.find().lean();

        const projectSubmissions = await ProjectSubmission.find({
            userId: { $in: users.map(user => user._id) }, // Filter submissions by users from the specified domain
        }).populate('userId').lean();
        // console.log(projectSubmissions)
        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('UserDetailsAndSubmissions');

        // Define headers for the Excel sheet
        // worksheet.addRow(['User ID', 'Name', 'Email','phoneNumber', 'year','admissionNumber', 'Domain', 'Submission ID', 'Submission Link']);
        worksheet.addRow(['Name', 'Email', 'phoneNumber', 'year', 'admissionNumber', 'Domain', 'Submission Link']);

       // Set column widths
       worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone Number', key: 'phoneNumber', width: 15 },
        { header: 'Year', key: 'year', width: 10 },
        { header: 'Admission No.', key: 'admissionNumber', width: 15 },
        { header: 'Domain', key: 'domain', width: 15 },
        { header: 'Submission Link', key: 'submissionLink', width: 50 }
    ];

    // Populate Excel sheet
    users.forEach((user) => {
        projectSubmissions
            .filter((submission) => submission.userId._id.toString() === user._id.toString())
            .forEach((submission) => {
                worksheet.addRow({
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    year: user.year,
                    admissionNumber: user.admissionNumber,
                    domain: user.domain,
                    submissionLink: submission.submissionLink
                });
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
