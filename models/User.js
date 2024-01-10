const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: false,
  },
  photo: {
    type: String,
    required: false
    // default:"no photo"
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
    type: String, // Assuming you store the resume file path
    validate: {
      validator: function (value) {
        // Regular expression for checking file extensions (PDF or DOCX)
        return /\.(pdf|docx)$/i.test(value);
      },
      message: 'Resume must be in PDF or DOCX format',
    },
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
  ShortList:{
    type: Boolean,
    required: false,
    default:  false
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
