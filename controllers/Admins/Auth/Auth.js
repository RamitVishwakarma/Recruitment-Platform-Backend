const router = require("express").Router();
const Admin = require("../../../models/Admin.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require('validator');
const tokenBlacklist = new Set();


// admins will be created by the super admin
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, domain } = req.body;

    // Validate email 
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user with the same email already exists
    const existingUser = await Admin.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new Admin({ name, email, password: hashedPassword, domain });
    await newUser.save();

    res.status(201).json({ success: true, message: 'User created successfully!' });
  } catch (error) {

    next(error);
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email 
    if (!validator.isEmail(email)) {
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


    res.header('Authorization', 'Bearer ' + token)
    // Expose the 'Authorization' header to the client
    res.header('Access-Control-Expose-Headers', 'Authorization');
    res.status(200)
      .json({ ...others });
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

router.put('/updatePassword/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.params.id; 
    console.log("🚀 ~ router.put ~ userId:", userId);

    const user = await Admin.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the provided old password matches the one stored in the database
    const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Invalid old password' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;

    // Save the updated user object
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;