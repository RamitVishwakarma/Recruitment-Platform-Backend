
const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require('express-fileupload')
dotenv.config();

const PORT = process.env.PORT || 80;
const app = express();
// database start
const mongoose = require("mongoose");
const DATABASE_URL = process.env.DATABASE_URL;
const connectdb = require("./database/database.js");
connectdb(DATABASE_URL);
// database end

//
app.use(fileUpload({
    useTempFiles : true,
    limits: { fileSize: 2 * 1024 * 1024 }, // Set the limit to 2MB
}));

app.use("/public",express.static("public"));
app.use(express.json());
// Include express.urlencoded() middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// using routes
const homeRoute = require("./routes/index.js");
app.use("/", homeRoute);

app.listen(PORT, (error) => {
    if (error) {
        console.log("server not started");
    } else {
        console.log(`server running at http://localhost:${PORT}`);


    }
})


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errorDetails = process.env.NODE_ENV === 'development' ? err.stack : null;

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        error: errorDetails,
    });
});
