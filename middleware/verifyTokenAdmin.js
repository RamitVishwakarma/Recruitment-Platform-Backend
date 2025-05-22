const express = require("express");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer");

  if (authHeader) {
    token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    jwt.verify(token, process.env.JWT_SECRET_ADMIN, (error, user) => {
      if (error) {
        res.status(400).json({ success: false, message: "Token is not valid" });
      } else {
        req.user = user;
        // console.log(req.user)
        // console.log(req.user.isAdmin)
        next();
      }
    });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "you are not authenticated" });
  }
};

module.exports = verifyToken;
