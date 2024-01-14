const express = require('express');
const Admin = require('../../models/Admin');
const User = require('../../models/User');
const ProjectSubmission = require('../../models/ProjectSubmission.js');
const router = express.Router();
const Upload = require("../../helpers/uploadFile.js");
// multer
const multer = require('multer')
// disk storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './Uploads/AdminImages/')
  },
  filename: function (req, file, cb) {

    // cb(null, file.originalname)
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB limit
  },
});

//add these 2 lines to make sure the parsing functionality is passed on to access body
router.use(require('express').json());
router.use(require('express').urlencoded({ extended: true }));


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

router.put("/myprofile", upload.single('photo'), async (req, res) => {
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
        Domain: req.body.Domain
      }, { new: true });

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
        Domain: req.body.Domain
      }, { new: true });

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
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const domain = admin.Domain;
    // const domain = "Programmming";
    // console.log(domain)

    // Fetch users based on the admin's domain
    // const userList = await User.find();
    const userList = await User.find({ Domain: domain });
    // console.log(userList)

    res.status(200).json(userList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error retrieving user list" });
  }
});


// list of all users by year and domain
// router.get('/listUsers/:id', async (req, res) => {  // passing year in id
//   try {

//     if (!req.user.isAdmin) {
//       return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
//     }

//     const adminId = req.user._id;
//     const admin = await Admin.findById(adminId);

//     if (!admin) {
//       return res.status(404).json({ success: false, message: "Admin not found" });
//     }

//     const domain = admin.Domain;
//     // const domain = "Programmming";
//     // console.log(domain)
//     const userId = req.params.id;
//     // Fetch users based on the admin's domain
//     // const userList = await User.find();
//     const userList = await User.find({ Domain: domain, year: userId });
//     // console.log(userList)

//     res.status(200).json(userList);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error retrieving user list" });
//   }
// });



// Filtering list of all users by year  
//   GET /listUsers?year=2022
router.get('/listUsers', async (req, res) => {  // passing year in id
  try {
    const userId = parseInt(req.query.year, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid year provided.' });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
    }

    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const domain = admin.Domain;
    // const domain = "Programmming";
    // console.log(domain)
    // const userId = req.params.id;

    // const userList = await User.find();
    const userList = await User.find({ Domain: domain, year: userId });
    // console.log(userList)

    res.status(200).json(userList);
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

    res.status(200).json({ success: true, user });
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
    let Updateuser = await User.findByIdAndUpdate(userId, {
      ShortList: ShortListed
    }, {
      new: true
    })
    const { password, ...others } = Updateuser._doc;

    // res.status(200).json({ success: true, message: "User shortlisted successfully" });
    res.status(200).json({ success: true, message: `user account verified set to ${ShortListed}`, result: others });
    // console.log(Updateuser)
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error shortlisting user" });
  }
});



// list of all shortlisted users of its Domain
router.get('/shortlistUser', async (req, res) => {
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
    // Fetch all shortlisted users
    const shortlistedUsers = await User.find({ Domain: domain, ShortList: true });

    res.status(200).json(shortlistedUsers);
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

    const domain = admin.Domain;
    // number of submitted projects
    const submittedProject = await ProjectSubmission.find({}).populate({ path: "userId", select: "name Domain" });
    const submittedProjectsCount = submittedProject.filter(project => project.userId.Domain === domain).length;
    // console.log('Submitted Projects Count:', submittedProjectsCount);
    // console.log(submittedProject)

    //number of registered users
    const registeredUsersCount = await User.find({ Domain: domain }).countDocuments();

    const shortlistedUsersCount = await User.find({ Domain: domain }).countDocuments({ ShortList: true });

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