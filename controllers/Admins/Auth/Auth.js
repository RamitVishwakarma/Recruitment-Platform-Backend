const router = require("express").Router();
const Admin = require("../../../models/Admin.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenBlacklist = new Set();

const emailValidatorRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// admins will be created by the super admin
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, Domain } = req.body;

    // Check email Validation
    if (!emailValidatorRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user with the same email already exists
    const existingUser = await Admin.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash the password before saving to the database
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create a new user instance
    const newUser = new Admin({ name, email, password: hashedPassword, Domain });

    // Save the new user to the database
    await newUser.save();

    // Respond with a success message
    res.status(201).json({ success: true, message: 'User created successfully!' });
  } catch (error) {
    // Handle errors using the provided error handler
    next(error);
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email Validation
    if (!emailValidatorRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const validUser = await Admin.findOne({ email });

    if (!validUser) {
      return res.status(400).json({ success: false, message: "User Not Registered" });
    }

    const isValidPassword = bcrypt.compareSync(password, validUser.password);

    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: "Wrong Email or password" });
    }

    const token = jwt.sign({
      _id: validUser._id, // Corrected from 'user' to 'validUser'
      isAdmin: validUser.isAdmin
    }, process.env.JWT_SECRETAdmin, {
      expiresIn: "3d"
    });

    const { password: _, ...others } = validUser._doc;

    // Use the spread operator to include properties from the 'others' object
    res
      .header('Authorization', 'Bearer ' + token)
      .status(200)
      .json({ ...others }); // Corrected to include 'accessToken'
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