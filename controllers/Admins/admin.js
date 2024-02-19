const express = require('express');
const Admin = require('../../models/Admin');
const User = require('../../models/User');
const ProjectSubmission = require('../../models/ProjectSubmission.js');
const router = express.Router();
const Upload = require("../../helpers/uploadFile.js");
const upload = require("../../helpers/adminMulter.js");
const errorHandler = require('../../utils/error.js');

// show Admin Profile
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

// Admin Profile Update

router.put("/Updateprofile", upload.single('photo'), async (req, res) => {
  try {
    // Admin Access Required
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
    }
    if (req.file) {
      // uploading files to cloudinary
      const file = req.file.path;
      const upload = await Upload.uploadFile(file, 'AdminImages');
      const UploadedFile = upload.secure_url;
      // console.log(UploadedFile);
      if (!UploadedFile) {
        return res.status(400).json({ success: false, message: "File not uploaded" });
      }
      const id = req.user._id; // getting user id form the jwt encryption
      // console.log(UploadedFile)
      const updatedUser = await Admin.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        photo: UploadedFile,
        phoneNumber: req.body.phoneNumber,
        domain: req.body.domain
      }, { new: true, select: '-password' });

      if (updatedUser) {
        res.status(200).json({ success: true, message: "User profile updated successfully", user: updatedUser });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } else {
      const id = req.user._id; // getting user id form the jwt encryption
      // console.log(UploadedFile)
      const updatedUser = await Admin.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        domain: req.body.domain
      }, { new: true, select: '-password' });

      if (updatedUser) {
        res.status(200).json({ success: true, message: "User profile updated successfully", user: updatedUser });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "User profile not updated" });
  }
});


// list of all users of its Domain
router.get('/listUsers', async (req, res) => {
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
    const userList = await User.find({ domain: domain });

    // // Extract user IDs for project submission query
    // const userIds = userList.map(user => user._id);

    // // Fetch submission details for all users in the domain
    // const submissionDetails = await ProjectSubmission.find({ userId: { $in: userIds } })
    //   .select('userId submissionLink');

    // // Combine user and submission details
    // const userDetailsWithSubmissions = userList.map(user => {
    //   const userSubmissions = submissionDetails.filter(submission => submission.userId.equals(user._id));
    //   return {
    //     user: {
    //       ...user._doc,
    //       password: undefined, // Omitting password for security reasons
    //     },
    //     ProjectSubmission: userSubmissions.map(submission => ({
    //       submissionId: submission._id,
    //       submissionLink: submission.submissionLink,
    //     })),
    //   };
    // });

    res.status(200).json({ success: true, userList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error retrieving user list' });
  }
});


// search Api
router.get('/search', async (req, res) => {
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

    const { name } = req.query;
    const queryObject = {
      domain: domain // Only search for users with the same domain as the admin
    };

    if (name) {
      queryObject.name = { $regex: name, $options: 'i' };
    }

    const userList = await User.find(queryObject).select('_id name year ShortList quizzesTaken projectStatus interviewStatus');
    res.status(200).json(userList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error retrieving user list" });
  }
});




// Filtering list of all users by year  
//   GET /listUsers?year=2022  --   Query
router.get('/listUsersByYear', async (req, res) => {
  try {
    const userId = parseInt(req.query.year, 10);
    // console.log(userId);



    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
    }

    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const domain = admin.domain;
    if (userId) {

      const userList = await User.find({ domain: domain, year: userId }).select(' _id name year ShortList quizzesTaken projectStatus interviewStatus');

      res.status(200).json({ success: true, userList });

    } else {

      const userList = await User.find({ domain: domain }).select(' _id name year ShortList quizzesTaken projectStatus interviewStatus');;

      res.status(200).json({ success: true, userList });

    }
    // const userList = await User.find();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error retrieving user list" });
  }
});



// list of users by id for populating its details
// show particular user
router.get("/findUser/:id", async (req, res) => {
  try {
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch submission details
    const submissionDetails = await ProjectSubmission.find({ userId })
      .select('submissionLink');

    // Combine user and submission details
    const userProfileDetails = {
      user: {
        ...user._doc,
        password: undefined, // Omitting password for security reasons
      },
      ProjectSubmission: submissionDetails,
    };

    res.status(200).json({ success: true, userProfileDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server data not found" });
  }
});

// shorlisting user
router.put('/shortlistUser/:id', async (req, res) => {
  try {

    // Admin Access Required
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
    }

    // Check if the logged-in user is an admin
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Get the user ID from the request parameters
    const userId = req.params.id;
    const user = await User.findById(userId);


    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    // Update the 'shortlisted' field to true
    ShortListed = req.body.ShortList;
    // Save the updated user
    await User.findByIdAndUpdate(userId, {
      ShortList: ShortListed
    }, {
      new: true
    })


    // const { password, ...others } = Updateuser._doc;


    // // Toggle the 'ShortList' field
    // user.ShortList = !user.ShortList;
    // await user.save();

    // // Update the admin's shortlisted users list accordingly
    // if (user.ShortList) {
    //   // If user is shortlisted, add user ID to the admin's shortlisted users
    //   admin.shortlistedUsers.push(userId);
    // } else {
    //   // If user is not shortlisted, remove user ID from the admin's shortlisted users
    //   admin.shortlistedUsers = admin.shortlistedUsers.filter(id => id.toString() !== userId);
    // }
    // await admin.save();


     // Update the admin's shortlisted users list accordingly
     if (ShortListed) {
      // If user is shortlisted and ShortListed is true, add user ID to the admin's shortlisted users
      if (!admin.shortlistedUsers.includes(userId)) {
        admin.shortlistedUsers.push(userId);
      }
    } else {
      admin.shortlistedUsers = admin.shortlistedUsers.filter(id => id.toString() !== userId);
    }
    // admin.shortlistedUsers.push({ userId });
    await admin.save();

    // res.status(200).json({ success: true, message: "User shortlisted successfully" });
    // res.status(200).json({ success: true, message: `user is sortlisted and set to ${ShortListed}`, result: others });
    res.status(200).json({ success: true, message: `user is sortlisted and set to ${ShortListed}` });
    // console.log(Updateuser)
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error shortlisting user" });

  }
});



// list of all shortlisted users of its Domain
router.get('/shortlistedUsers', async (req, res) => {
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
    // Fetch all shortlisted users
    const shortlistedUsers = await User.find({ domain: domain, ShortList: true }).select(' _id name year ShortList quizzesTaken projectStatus interviewStatus');

    res.status(200).json({ success: true, shortlistedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error retrieving shortlisted users" });
  }
});

// Starmarking user
router.put('/reviewmark/:id', async (req, res) => {
  try {

    // Admin Access Required
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
    }

    // Check if the logged-in user is an admin
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Get the user ID from the request parameters
    const userId = req.params.id;
    const user = await User.findById(userId);


    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    // Update the 'reviewStatus' field
    // const reviewMarked = req.body.reviewMark === "true"; // Convert string to boolean
    // user.reviewStatus = reviewMarked;
    user.reviewStatus = !user.reviewStatus;                 // review status true/false
    await user.save();

    res.status(200).json({ success: true, message: `user is marked for further review` });
    // console.log(Updateuser)
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error shortlisting user" });
  }
});



// list of all Starmarked users of its Domain
router.get('/reviewmarkedUsers', async (req, res) => {
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
    // Fetch all shortlisted users
    const reviewmarkedUsers = await User.find({ domain: domain, reviewStatus: true }).select(' _id name year ShortList quizzesTaken projectStatus interviewStatus');

    res.status(200).json({ success: true, message: "List of sortlisted user's", reviewmarkedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error retrieving shortlisted users" });
  }
});


// to get statistics
router.get('/statistics', async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
    }

    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const domain = admin.domain;
    // number of submitted projects
    const submittedProject = await ProjectSubmission.find({}).populate({ path: "userId", select: "name domain" });
    const submittedProjectsCount = submittedProject.filter(project => project.userId.domain === domain).length;

    // console.log('Submitted Projects Count:', submittedProjectsCount);
    // console.log(submittedProject)

    //number of registered users
    const registeredUsersCount = await User.find({ domain: domain }).countDocuments();

    const shortlistedUsersCount = await User.find({ domain: domain }).countDocuments({ ShortList: true });

    res.status(200).json({
      success: true,
      submittedProjectsCount,
      registeredUsersCount,
      shortlistedUsersCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});


module.exports = router;