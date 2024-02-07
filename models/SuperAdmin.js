const mongoose = require('mongoose');
var validator = require('validator');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, 'Please provide a email'],
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Invalid email address',
    },
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: false,
    validate: {
      validator: (value) => value.toString().length <= 10,
      message: 'Phone number must be at most 10 digits',
    },
  },
  photo: {
    type: String,
    required: false,
    Default: "https://i.postimg.cc/c15MbgrZ/pngwing-com.png"
  },
  domain: {
    type: String,
    required: false,
    enum: ['Programmming', 'Web Club', 'Android Club', 'Flutter Dev', 'Design Club', 'ML Club'],
  },
  isSuperAdmin: {
    type: Boolean,
    default: true,
  },
  interviewCleared: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
});

const AdminModel = mongoose.model('Admin', adminSchema);

module.exports = AdminModel;