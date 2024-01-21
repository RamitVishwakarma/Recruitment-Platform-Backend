const router = require("express").Router();
const User = require('../../../models/User.js');
const errorHandler = require('../../../utils/error.js')
const bcryptjs = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require('validator');
const sendResetEmail = require("../../../helpers/sendgrid.js");
const crypto = require('crypto');
const tokenBlacklist = new Set();


router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, admissionNumber, year, domain } = req.body;

    // Validate email 
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      admissionNumber,
      year,
      domain
    });


    await newUser.save();


    // Send reset instructions via email
    sendResetEmail(
      email,
      process.env.SENDGRID_SENDER_EMAIL,
      // 'noreply@gdscjssaten.com',
      'Welcome to GDSC! Complete Your Registration and Start Your Tech Journey',
      `
      <p>Dear ${name},</p>

      <p>Welcome to the GDSC Recruitment Platform! We are thrilled to have you on board. 🚀</p>

      <p>Congratulations on taking the first step towards joining our community of passionate individuals dedicated to technology and innovation.</p>

      <p>Here's what you can expect from your GDSC journey:</p>
      <ul>
         <li>Exciting opportunities to learn and grow in the tech industry.</li>
          <li>Exclusive access to workshops, events, and mentorship programs.</li>
          <li>A chance to collaborate with like-minded individuals on impactful projects.</li>
      </ul>

      <p>To get started, please complete your profile on our platform and explore the available resources. Stay tuned for upcoming events and recruitment updates!</p>

      <p>Ready to dive in? <a href="[Your Platform Link]" target="_blank">Login to your GDSC account</a> and let the adventure begin!</p>

      <p>If you have any questions or need assistance, feel free to reach out to our team at <b>dscjssnoida@gmail.com</b>. We're here to support you every step of the way.</p>

      <p>Thank you for joining GDSC! We look forward to shaping the future of technology together.</p>

      <p>Best regards,<br/>gdscjssaten</p>
      `
    );

    res.status(201).json({ success: true, message: 'User created successfully!' });
  } catch (error) {
    next(error);
  }
});


// Google auth
router.post("/google", async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const validUser = await User.findOne({ email });

    if (validUser) {
      const token = jwt.sign({ _id: validUser._id }, process.env.JWT_SECRETUser, {
        expiresIn: "3d"
      });
      const { password: pass, ...rest } = validUser._doc;
      res
        .header('Authorization', 'Bearer ' + token)
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });
      await newUser.save();

      // Send reset instructions via email
      sendResetEmail(
        email,
        process.env.SENDGRID_SENDER_EMAIL,
        // 'noreply@gdscjssaten.com',
        'Welcome to GDSC! Complete Your Registration and Start Your Tech Journey',
        `
      <p>Dear ${name},</p>

      <p>Welcome to the GDSC Recruitment Platform! We are thrilled to have you on board. 🚀</p>

      <p>Congratulations on taking the first step towards joining our community of passionate individuals dedicated to technology and innovation.</p>

      <p>Here's what you can expect from your GDSC journey:</p>
      <ul>
         <li>Exciting opportunities to learn and grow in the tech industry.</li>
          <li>Exclusive access to workshops, events, and mentorship programs.</li>
          <li>A chance to collaborate with like-minded individuals on impactful projects.</li>
      </ul>

      <p>To get started, please complete your profile on our platform and explore the available resources. Stay tuned for upcoming events and recruitment updates!</p>

      <p>Ready to dive in? <a href="[Your Platform Link]" target="_blank">Login to your GDSC account</a> and let the adventure begin!</p>

      <p>If you have any questions or need assistance, feel free to reach out to our team at <b>dscjssnoida@gmail.com</b>. We're here to support you every step of the way.</p>

      <p>Thank you for joining GDSC! We look forward to shaping the future of technology together.</p>

      <p>Best regards,<br/>gdscjssaten</p>
      `
      );

      const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRETUser, {
        expiresIn: "3d"
      });
      const { password: pass, ...rest } = newUser._doc;

      res.header('Authorization', 'Bearer ' + token)
      // Expose the 'Authorization' header to the client
      res.header('Access-Control-Expose-Headers', 'Authorization');
      res.status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email using 
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user with the given email exists
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, 'User not found!'));
    }

    // Check if the password is valid
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, 'Wrong credentials!'));
    }

    // Generate JWT token for authentication
    const token = jwt.sign({ _id: validUser._id }, process.env.JWT_SECRETUser, {
      expiresIn: "3d"
    });


    // Remove password from the user data 
    const { password: _, ...userData } = validUser._doc;


    res.header('Authorization', 'Bearer ' + token)
    // Expose the 'Authorization' header to the client
    res.header('Access-Control-Expose-Headers', 'Authorization');
    res.status(200)
      .json(userData);

  } catch (error) {
    next(error);
  }

});


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

// Route to update the user's password
router.put('/updatePassword/:id', async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    user.password = hashedPassword;

    // Save the updated user object
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// forget password (send a reset email)
router.post('/forget-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Checking if the email exists in the users array 
    const user = await User.findOne({ email });

    if (user) {
      // Generate and store a reset token 
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set the reset token and expiration in the user document
      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

      // Save the user document with reset token information
      await user.save();

      const link = `${req.protocol}://localhost:3000/api/user/auth/reset_password/${resetToken}`;

      // Send reset instructions via email
      sendResetEmail(
        email,
        process.env.SENDGRID_SENDER_EMAIL,
        'noreply@gdscjssaten.com',
        `
        <p>Dear user,</p>
        <p>We received a request to reset your password for Best To Do account associated with this email address.</p>
        <p>Please click the link below to reset your password. This link will be valid for the next 15 minutes:</p>
        <p><a href="${link}" target="_blank">${link}</a></p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br/>Team gdscjssaten</p>
        `
      );

      res.status(200).json({
        success: true,
        message: 'Password reset instructions have been sent to your email address. Please check your inbox and follow the provided link to reset your password.',
      });
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    console.error('Error in forget-password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route for handling password reset
router.put('/reset_password/:token', async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    const resetToken = req.params.token;

    // Hash the reset token to match the stored hash
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find the user with the matching email and reset token
    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token is invalid or has been expired' });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Reset the password
    user.password = await bcryptjs.hash(newPassword, 10);
    user.resetPasswordToken = null; // Reset the reset token after the password reset
    user.resetPasswordExpires = null; // Reset the reset token expiration

    // Save the updated user to the database
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error in password reset:', error);
    return next(error);
  }
});


module.exports = router;