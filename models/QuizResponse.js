const mongoose = require('mongoose');

const quizResponseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming userId is an ObjectId
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
    quizType: {
        type: String, // Assuming quizType is a string, and it's optional
        default: null
    },
    takenOn: {
        type: Date,
        default: Date.now
    },
    questionsSolved: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId, // Assuming questionId is an ObjectId
                ref: 'Quiz',
                required: true
            },
            optionMarked: {
                type: String, // Assuming optionMarked is a string
                required: true
            },
            correct: {
                type: Boolean,
                required: true
            }
        }
    ],
    score: {
        type: Number,
        default: 0,
    },
},{ timestamps: true });

const QuizResponse = mongoose.model('QuizResponse', quizResponseSchema);

module.exports = QuizResponse;
