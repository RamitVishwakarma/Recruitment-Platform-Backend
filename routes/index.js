const express = require("express");
const router = express.Router();

// adding routes to files
router.get("/", (req, res) => {
    res.send("Welcome to Recruitment Platform 🎉🎉");
    console.log("Welcome to Recruitment Platform 🎉🎉")
})


module.exports = router;