const express = require('express');
const AdminAuthRoute = require("../../controllers/Admins/Auth/Auth.js");
const AdminProfileRoute = require("../../controllers/Admins/admin.js");
const AdminQuizRoute = require("../../controllers/Admins/Quiz.js");
const ProjectRoute = require("../../controllers/Admins/Project/ProjectList.js");
const verifyToken = require('../../middleware/verifyTokenAdmin.js');

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Welcome to Admin Panel 🚗🚗");
})

router.use("/auth", AdminAuthRoute);
router.use("/profile", verifyToken, AdminProfileRoute);
router.use("/project", verifyToken, ProjectRoute);
router.use("/Quiz", verifyToken, AdminQuizRoute);




module.exports = router;