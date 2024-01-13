const mongoose = require('mongoose');
var validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
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
    default:"https://i.postimg.cc/c15MbgrZ/pngwing-com.png"
  },
  Domain: {
    type: String,
    required: true,
    enum: ['Programmming', 'Web Club', 'Android Club', 'Flutter Dev', 'Design Club', 'ML Club'],
  },
  year: {
    type: String,
    required: true,
    enum: ['1', '2'],
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  resume: {
    type: String,
    required: false
  },
  // resume: {
  //   type: String, // Assuming you store the resume file path
  //   validate: {
  //     validator: function (value) {
  //       // Regular expression for checking file extensions (PDF or DOCX)
  //       return /\.(pdf|docx)$/i.test(value);
  //     },
  //     message: 'Resume must be in PDF or DOCX format',
  //   },
  // },
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
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
