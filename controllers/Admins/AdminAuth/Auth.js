const router = require("express").Router();
const Admin = require("../../../models/Admin.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenBlacklist = new Set();



// admins will be created by the super admin
// router.post("/signup", async (req, res, next) => {
//     try {
//       const { name, email, password } = req.body;

//       // Check if user with the same email already exists
//       const existingUser = await Admin.findOne({ email });

//       if (existingUser) {
//         return res.status(409).json({ error: 'User with this email already exists' });
//       }

//       // Hash the password before saving to the database
//       const hashedPassword = bcrypt.hashSync(password, 10);

//       // Create a new user instance
//       const newUser = new Admin({ name, email, password: hashedPassword, phoneNumber });

//       // Save the new user to the database
//       await newUser.save();

//       // Respond with a success message
//       res.status(201).json({ success: true, message: 'User created successfully!' });
//     } catch (error) {
//       // Handle errors using the provided error handler
//       next(errorHandler(500, 'Error during user registration'));
//     }
//   });

// login
router.post('/login', async (req, res) => {
  try {
    const user = await Admin.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User Not Registered" });
    }

    const isValidPassword = bcrypt.compareSync(req.body.password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: "Wrong Email or password" });
    }

    const accessToken = jwt.sign({
      _id: user._id, // adding id to the jwt for further access
    }, process.env.JWT_SECRETAdmin, {
      expiresIn: "3d"
    });

    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken }); // sending all data except the password
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

//Logout
router.post("/logout", (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    // Extract the token from the Authorization header
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({ success: false, msg: 'No token provided' });
    }

    // Add the token to the blacklist
    tokenBlacklist.add(token);

    res.status(200).json({ success: true, msg: 'You have been logged out' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: 'Error during logout' });
  }
});



module.exports = router;