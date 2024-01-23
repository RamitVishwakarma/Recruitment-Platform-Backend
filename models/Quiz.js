const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [optionSchema],
    required: true,
    validate: [arrayLimit, '{PATH} exceeds the limit of 4'],
  },
  explanation: {
    type: String,
    default: '',
  },
}, { timestamps: true });

function arrayLimit(val) {
  return val.length <= 4;
}

const quizSchema = new mongoose.Schema({
  title: {
    type: String,   // ex. recruitments
    required: false,
  },
  domain: {
    type: String,   // web, programmin ...
    required: false,
  },
  questions: [questionSchema], // Change here to accept an array of questions
  duration: {
    type: Number,
    default: 30,
  },
}, { timestamps: true });

const QuizModel = mongoose.model('Quiz', quizSchema);

module.exports = QuizModel;
