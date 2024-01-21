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
  question: questionSchema, // Change here to accept a single question or an array of questions
});

const QuizModel = mongoose.model('Quiz', quizSchema);

module.exports = QuizModel;




// ------------------------------------------------
// const newQuiz = new QuizModel({
//   questions: [
//     {
//       questionText: "What is JavaScript?",
//       options: [
//         { optionText: "A programming language", isCorrect: true },
//         { optionText: "A markup language", isCorrect: false },
//         // ... other options
//       ],
//     },
//     // ... other questions
//   ],
//   duration: 30,
// });
// ------------------------------------------------


