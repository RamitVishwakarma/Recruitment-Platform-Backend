const express = require('express');
const userAuthRoute = require("../../controllers/Users/Auth/auth.js")
// const userListingRoute = require("../../Controllers/User/listing");
const userProfileRoute = require("../../controllers/Users/user.js");
const verifyToken = require('../../middleware/verifyTokenUser.js');

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to User Panel 🚗🚗");
})

router.use("/auth", userAuthRoute);
// router.use("/listing", verifyToken, userListingRoute);
router.use("/profile",verifyToken,userProfileRoute);


module.exports = router;