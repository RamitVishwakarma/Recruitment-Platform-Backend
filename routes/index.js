const express = require("express");
const router = express.Router();

// adding routes to files
router.get("/", (req, res) => {
    res.send("Welcome to Recruitment Platform 🎉🎉");
    console.log("Welcome to Recruitment Platform 🎉🎉")
})


// importing files.
const UserRoute = require("./User/index.js");
const AdminRoute = require("./Admin/index.js");


// user
router.use("/api/user", UserRoute)
// auth
router.use("/api/admin", AdminRoute);


module.exports = router;