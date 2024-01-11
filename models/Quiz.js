const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [{
    optionText: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean, 
      required: true,
    },
  }],
}, { timestamps: true });

// ------------------------------------------------
// const quizData = {
//     title: "JavaScript Basics Quiz",
//     description: "Test your knowledge of fundamental JavaScript concepts.",
//     questions: [
//       // ... (array of questions)
//     ],
//     duration: 30, // (example duration in minutes)
//     projectLink: "https://example.com/quiz-project",
//   };
// ------------------------------------------------

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: [questionSchema],

  duration: {
    type: Number,
    required: true,
  },

});

const QuizModel = mongoose.model('Quiz', quizSchema);

module.exports = QuizModel;

