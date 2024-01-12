const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    required: false,
  },
  Domain:{
    type: String,
    required: true,
    enum: ['Programmming', 'Web Club', 'Android Club', 'Flutter Dev', 'Design Club', 'ML Club'],
  },
  isAdmin:{
    type: Boolean,
    default: false, 
  },
  createdQuizzes: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
  }],
  shortlistedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
});

const AdminModel = mongoose.model('Admin', adminSchema);

module.exports = AdminModel;

