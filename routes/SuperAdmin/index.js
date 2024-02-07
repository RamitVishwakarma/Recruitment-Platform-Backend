const express = require('express');
const SuperAdminAuthRoute = require("../../controllers/Admins/Auth/Auth.js");
const verifyToken = require('../../middleware/verifyTokenAdmin.js');

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Welcome to SuperAdmin Panel 🚗🚗");
})

router.use("/auth", SuperAdminAuthRoute);



module.exports = router;