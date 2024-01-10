const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
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
  photo:{
    type:String,
    required:false
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
  admissionNo: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    required: false
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
    },
    linkedin: {
      type: String,
    },
    behance: {
      type: String,
    },
    hackerrank: {
      type: String,
    },
    Leetcode: {
      type: String,
    },
    Dribble: {
      type: String,
    },
    portfolio: {
      type: String,
    },
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
},{ timestamps: true });

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
