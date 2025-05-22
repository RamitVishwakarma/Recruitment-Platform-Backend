const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
var morgan = require("morgan");
dotenv.config();

const PORT = process.env.PORT || 80;
const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://gdsc-recruitment-2024.vercel.app",
  "https://recplatform.ramitvishwakarma.in",
  "https://recruitment-platform.ramitvishwakarma.in",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

// database start
const mongoose = require("mongoose");
const DATABASE_URL = process.env.DATABASE_URL;
const connectdb = require("./database/database.js");
connectdb(DATABASE_URL);
// database end

app.use("/public", express.static("Uploads"));
app.use(express.json());
app.use(morgan("tiny")); //  morgan(':method :url :status :res[content-length] - :response-time ms')
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions)); // Use the cors middleware with options);

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// using routes
const homeRoute = require("./routes/index.js");
app.use("/", homeRoute);

// Global error handling middleware - should be last middleware
const globalErrorHandler = require("./utils/error");
const AppError = require("./utils/appError");
app.use(globalErrorHandler);

// Handle 404 errors - this should be placed after all your routes and before the global error handler if you want to customize 404s specifically
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.listen(PORT, (error) => {
  if (error) {
    console.log("server not started");
  } else {
    console.log(`server running at http://localhost:${PORT}`);
  }
});
