const express = require('express')
const router = require("express").Router();
// multer
const multer = require('multer')
// disk storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './Uploads/AdminImages/')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB limit
    },
});

//add these 2 lines to make sure the parsing functionality is passed on to access body
router.use(require('express').json());
router.use(require('express').urlencoded({ extended: true }));


module.exports = upload;