const router = require("express").Router();
const User = require("../../../models/User.js");
const errorHandler = require("../../../utils/error.js");
const bcryptjs = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const sendEmail = require("../../../helpers/zeptomail.js"); // Updated import
const crypto = require("crypto");
const tokenBlacklist = new Set();

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, admissionNumber, year, domain } = req.body;

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      admissionNumber,
      year,
      domain,
    });

    await newUser.save();

    // Send reset instructions via email
    sendEmail(
      email,
      "Welcome to GDSC! Lets Get Started: Complete Your Registration and Embark on Your Tech Adventure 🚀",
      `
      
       <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; width: 600px; margin: 0 auto;">
            <img src="https://i.postimg.cc/13JXgXwd/banner.png" alt="GDSC logo" width="100%" height="80%">
        <h2 style="font-weight: 700; font-size: larger;">Dear ${name},</h2>
        <p style="font-size: large">
          Welcome to the Gateway of Innovation at GDSC! Let the journey begin! 🚀
        </p>
        <p>
          Congratulations on embarking on the exciting adventure of joining our
          vibrant community where passion meets technology. 🌐
        </p>
        <p>Get ready for an odyssey filled with:</p>
        <ul>
          <li>
            🌟 Thrilling opportunities to not just learn, but to soar in the dynamic
            tech industry. 💡
          </li>
          <br />
          <li>
            🎓 Exclusive backstage passes to mind-expanding workshops, electrifying
            events, and personalized mentorship programs. 🚀
          </li>
          <br />
          <li>
            👥 A front-row seat to collaborate with brilliant minds on projects that
            make a real impact. Get ready to amplify your teamwork skills! 💻
          </li>
        </ul>
        <p>We're thrilled to have you on board! 🤩</p>
        <p>
          Unlock the door to your GDSC experience by completing your profile on our
          platform. Dive into a treasure trove of resources designed to fuel your
          curiosity and passion. Stay tuned for the symphony of upcoming events and
          recruitment updates! ⏰
        </p>
        <p>
          Your journey with GDSC is not just a step; it's a leap into a world where
          innovation knows no bounds. Let the adventure unfold! 🌈✨
        </p>

        <div style="font-size: large;">
            <p>Ready to dive in?</p>
            <button style="background-color: #ABD700; padding: .9rem 1rem; border-radius: 0.7rem; color: rgb(37, 37, 37); border: none;">
                  <a style="background-color: #ABD700;  font-weight: bolder; text-decoration: none;" href="https://gdscrecruitments.in" target="_blank">Log in to your GDSC account</a>
                  </button>
            <br>
            <p>and let the adventures begin!🌟</p>
        </div>

        <hr style="opacity: 0.5;">
        <p>If you have any questions or ened assistance, feel free to reach out to our team at <a href="mailto:gdsc@jssaten.ac.in">gdsc@jssaten.ac.in</a> We're here to support you every step of the way.🤝</p>

        <p>Thank you for joining GDSC! We look forward to shaping the future of technology together.🌐</p>
      <br>
        <p>Best Regards, <br>Team GDSC JSSATEN</p>
        <br>
        <br>
        <div style="background-color: #f5f5f5; padding: 2px 20px;">
            <h4>Follow us on:</h4>
            <div style="display: flex; gap: 45px;">
                <a href="https://www.linkedin.com/company/dsc-jssaten/" target="_blank"><img style="width: 35px; margin-right: 2rem;" src="https://i.postimg.cc/ryfy1Jjw/icons8-linkedin-100.png" alt=""></a>
                <a href="https://www.instagram.com/gdscjssaten/" target="_blank"><img style="width: 35px; margin-right: 2rem;" src="https://i.postimg.cc/mk76LVmW/icons8-instagram-96.png" alt=""></a>
                <a href="https://twitter.com/dscjssaten?lang=en" target="_blank"><img style="width: 35px; margin-right: 2rem;" src="https://i.postimg.cc/nr77NP0B/icons8-twitter-100.png" alt=""></a>
                <a href="https://github.com/DSC-JSS-NOIDA" target="_blank"><img style="width: 35px;" src="https://i.postimg.cc/ZnhFYm9V/icons8-github-128.png" alt=""></a>
            </div>
            <p>&#169; GDSC JSSATEN  2024</p>
      </div>
      `
    );

    res
      .status(201)
      .json({ success: true, message: "User created successfully!" });
  } catch (error) {
    next(error);
  }
});

// Google auth
router.post("/google", async (req, res, next) => {
  const { name, email, photo } = req.body;
  try {
    const validUser = await User.findOne({ email });

    if (validUser) {
      const token = jwt.sign(
        { _id: validUser._id },
        process.env.JWT_SECRET_USER,
        {
          expiresIn: "3d",
        }
      );
      const { password: pass, ...rest } = validUser._doc;
      res.header("Authorization", "Bearer " + token);
      res
        .header("Access-Control-Expose-Headers", "Authorization")
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
        photo,
        password: hashedPassword,
      });
      await newUser.save();

      // Send reset instructions via email
      sendEmail(
        email,
        "Welcome to GDSC! Lets Get Started: Complete Your Registration and Embark on Your Tech Adventure 🚀",
        `
              <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; width: 600px; margin: 0 auto;">
              <img src="https://i.postimg.cc/13JXgXwd/banner.png" alt="GDSC logo" width="100%" height="80%">
              <h2 style="font-weight: 700; font-size: larger;">Dear ${name},</h2>
              <br>
              <p style="font-size: large">
                Welcome to the Gateway of Innovation at GDSC! Let the journey begin! 🚀
              </p>
              <p>
                Congratulations on embarking on the exciting adventure of joining our
                vibrant community where passion meets technology. 🌐
              </p>
              <p>Get ready for an odyssey filled with:</p>
              <ul>
                <li>
                  🌟 Thrilling opportunities to not just learn, but to soar in the dynamic
                  tech industry. 💡
                </li>
                <br />
                <li>
                  🎓 Exclusive backstage passes to mind-expanding workshops, electrifying
                  events, and personalized mentorship programs. 🚀
                </li>
                <br />
                <li>
                  👥 A front-row seat to collaborate with brilliant minds on projects that
                  make a real impact. Get ready to amplify your teamwork skills! 💻
                </li>
              </ul>
              <p>We're thrilled to have you on board! 🤩</p>
              <p>
                Unlock the door to your GDSC experience by completing your profile on our
                platform. Dive into a treasure trove of resources designed to fuel your
                curiosity and passion. Stay tuned for the symphony of upcoming events and
                recruitment updates! ⏰
              </p>
              <p>
                Your journey with GDSC is not just a step; it's a leap into a world where
                innovation knows no bounds. Let the adventure unfold! 🌈✨
              </p>
        
              <div style="font-size: large;">
                  <p>Ready to dive in?</p>
                  <button style="background-color: #ABD700; padding: .9rem 1rem; border-radius: 0.7rem; color: rgb(37, 37, 37); border: none;">
                        <a style="background-color: #ABD700;  font-weight: bolder; text-decoration: none;" href="https://gdscrecruitments.in" target="_blank">Log in to your GDSC account</a>
                        </button>
                  <br>
                  <p>and let the adventures begin!🌟</p>
              </div>
        
          <hr style="opacity: 0.5;">
          <p>If you have any questions or ened assistance, feel free to reach out to our team at <a href="mailto:gdsc@jssaten.ac.in">gdsc@jssaten.ac.in</a> We're here to support you every step of the way.🤝</p>
        
          <p>Thank you for joining GDSC! We look forward to shaping the future of technology together.🌐</p>
        <br>
          <p>Best Regards, <br>Team GDSC JSSATEN</p>
          <br>
          <br>
          <div style="background-color: #f5f5f5; padding: 2px 20px;">
              <h4>Follow us on:</h4>
              <div style="display: flex; gap: 45px;">
                  <a href="https://www.linkedin.com/company/dsc-jssaten/" target="_blank"><img style="width: 35px; margin-right: 2rem;" src="https://i.postimg.cc/ryfy1Jjw/icons8-linkedin-100.png" alt=""></a>
                  <a href="https://www.instagram.com/gdscjssaten/" target="_blank"><img style="width: 35px; margin-right: 2rem;" src="https://i.postimg.cc/mk76LVmW/icons8-instagram-96.png" alt=""></a>
                  <a href="https://twitter.com/dscjssaten?lang=en" target="_blank"><img style="width: 35px; margin-right: 2rem;" src="https://i.postimg.cc/nr77NP0B/icons8-twitter-100.png" alt=""></a>
                  <a href="https://github.com/DSC-JSS-NOIDA" target="_blank"><img style="width: 35px;" src="https://i.postimg.cc/ZnhFYm9V/icons8-github-128.png" alt=""></a>
              </div>
              <p>&#169; GDSC JSSATEN  2024</p>
          </div>
      `
      );

      const token = jwt.sign(
        { _id: newUser._id },
        process.env.JWT_SECRET_USER,
        {
          expiresIn: "3d",
        }
      );
      const { password: pass, ...rest } = newUser._doc;

      res.header("Authorization", "Bearer " + token);
      // Expose the 'Authorization' header to the client
      res.header("Access-Control-Expose-Headers", "Authorization");
      res.status(200).json(rest);
    }
  } catch (error) {
    console.error("Error in Google auth:", error);
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email using
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user with the given email exists
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, "User not found!"));
    }

    // Check if the password is valid
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, "Wrong credentials!"));
    }

    // Generate JWT token for authentication
    const token = jwt.sign(
      { _id: validUser._id },
      process.env.JWT_SECRET_USER,
      {
        expiresIn: "3d",
      }
    );

    // Remove password from the user data
    const { password: _, ...userData } = validUser._doc;

    res.header("Authorization", "Bearer " + token);
    // Expose the 'Authorization' header to the client
    res.header("Access-Control-Expose-Headers", "Authorization");
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    // Extract the token from the Authorization header
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json({ success: false, msg: "No token provided" });
    }

    // Add the token to the blacklist
    tokenBlacklist.add(token);

    res.status(200).json({ success: true, msg: "You have been logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Error during logout" });
  }
});

// Route to update the user's password
router.put("/updatePassword/:id", async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    user.password = hashedPassword;

    // Save the updated user object
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// forget password (send a reset email)
router.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Checking if the email exists in the users array
    const user = await User.findOne({ email });

    if (user) {
      // Generate and store a reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set the reset token and expiration in the user document
      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

      // Save the user document with reset token information
      await user.save();

      // Set a timeout to clear the token after 15 minutes
      setTimeout(async () => {
        if (user.resetPasswordToken) {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          await user.save();
        }
      }, 15 * 60 * 1000);

      const link = `${req.protocol}://localhost:3000/api/user/auth/reset_password/${resetToken}`;

      // Send reset instructions via email
      sendEmail(
        email,
        "Reset Your Best To Do Password: Your Key to Seamless Task Management 🗝️",
        `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; width: 600px; margin: 0 auto;">
        <img src="https://i.postimg.cc/13JXgXwd/banner.png" alt="GDSC logo" width="100%" height="80%">
        <br>
        <br>
        <p>Hope you're doing awesome! 🌟</p>
        <p>We've received a request to reset the password for your Best To Do account associated with this email address. Your security is our priority, and we're here to assist you in this process.</p>
        <p>To initiate the password reset, simply follow the link provided below:</p>
        <br>
        <button style="background-color: #ABD700; padding: .9rem 1rem; border-radius: 0.7rem; color: rgb(37, 37, 37); border: none;">
            <a style="background-color: #ABD700; font-weight: bolder; text-decoration: none;" href="${link}" target="_blank">Reset Password</a>
        </button>
        <br>
        <br>
        <p>Please note that the link will expire in 15 minutes for security reasons.</p>
        <p>Didn't request a password reset? No biggie, just hit delete. We've got everything under control!</p>
        <p>Any worries or need a hand? Drop us a line; we've got your back!</p>
        <p>Cheers!<br/>Team GDSC JSSATEN</p>
        <div style="background-color: #f5f5f5; padding: 2px 20px;">
        <h4>Follow us on:</h4>
        <div style="display: flex; gap: 45px;">
            <a href="https://www.linkedin.com/company/dsc-jssaten/" target="_blank"><img style="width: 35px; margin-right: 2rem;" src="https://i.postimg.cc/ryfy1Jjw/icons8-linkedin-100.png" alt=""></a>
            <a href="https://www.instagram.com/gdscjssaten/" target="_blank"><img style="width: 35px; margin-right: 2rem;" src="https://i.postimg.cc/mk76LVmW/icons8-instagram-96.png" alt=""></a>
            <a href="https://twitter.com/dscjssaten?lang=en" target="_blank"><img style="width: 35px; margin-right: 2rem;" src="https://i.postimg.cc/nr77NP0B/icons8-twitter-100.png" alt=""></a>
            <a href="https://github.com/DSC-JSS-NOIDA" target="_blank"><img style="width: 35px;" src="https://i.postimg.cc/ZnhFYm9V/icons8-github-128.png" alt=""></a>
        </div>
        <p>&#169; GDSC JSSATEN  2024</p>
        </div>
        </div>
        `
      );

      res.status(200).json({
        success: true,
        message:
          "Password reset instructions have been sent to your email address. Please check your inbox and follow the provided link to reset your password.",
      });
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error in forget-password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for handling password reset
router.put("/reset_password/:token", async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const resetToken = req.params.token;

    // Hash the reset token to match the stored hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find the user with the matching email and reset token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Token is invalid or has been expired" });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // Reset the password
    user.password = await bcryptjs.hash(newPassword, 10);
    user.resetPasswordToken = null; // Reset the reset token after the password reset
    user.resetPasswordExpires = null; // Reset the reset token expiration

    // Save the updated user to the database
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error in password reset:", error);
    return next(error);
  }
});

module.exports = router;
