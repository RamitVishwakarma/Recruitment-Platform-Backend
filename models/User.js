const mongoose = require('mongoose');
var validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    // minlength: [3, 'Name must be at least 3 characters long'],
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
    default: "https://i.postimg.cc/c15MbgrZ/pngwing-com.png"
  },
  domain: {
    type: String,
    required: false,
    enum: ['Programmming', 'Web Club', 'Android Club', 'Flutter Dev', 'Design Club', 'ML Club'],
  },
  year: {
    type: String,
    required: false,
    enum: ['1', '2'],
  },
  admissionNumber: {
    type: String,
    required: false,
    unique: true,
  },
  resume: {
    type: String,
    required: false
  },
  socialLinks: {
    github: {
      type: String,
      required: false
    },
    linkedin: {
      type: String,
      required: false
    },
    behance: {
      type: String,
      required: false
    },
    hackerrank: {
      type: String,
      required: false
    },
    Leetcode: {
      type: String,
      required: false
    },
    Dribble: {
      type: String,
      required: false
    },
    portfolio: {
      type: String,
      required: false
    },
  },
  ShortList: {
    type: Boolean,
    required: false,
    default: false
  },
  quizzesTaken: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    score: {
      type: Number,
      default: 0,
    },
  }],
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  }
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
