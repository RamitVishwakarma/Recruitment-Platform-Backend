const express = require('express');
const QuizModel = require('../../models/Quiz');
const router = express.Router();


// todo : expire in in schema



// API to create a new quiz
router.post('/createQuiz', async (req, res) => {
    try {
        const { questionText, options, explanation } = req.body;

        // Admin Access Required
        if (!req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
        }

        // Create a new quiz
        const newQuiz = new QuizModel({
            question: {
                questionText,
                options,
                explanation,
            },
            duration: 30,
        });

        const savedQuiz = await newQuiz.save();
        res.status(201).json(savedQuiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Admin API to update a specific question within a quiz
// http://localhost:3000/api/admin/Quiz//updateQuiz/:quizId/question/:questionId
router.put('/updateQuiz/:quizId', async (req, res) => {
    try {
        const { quizId } = req.params;
        const { updatedQuestion } = req.body;

        // Admin Access Required
        if (!req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
        }

        // Check if the quiz exists
        const existingQuiz = await QuizModel.findById(quizId);

        if (!existingQuiz) {
            return res.status(404).json({ error: 'Quiz not found.' });
        }

        // Find and update the specific question
        const existingQuestion = existingQuiz.question;

        if (!existingQuestion) {
            return res.status(404).json({ error: 'Question not found.' });
        }

        // Update the question fields
        existingQuestion.questionText = updatedQuestion.questionText;
        existingQuestion.options = updatedQuestion.options;
        existingQuestion.explanation = updatedQuestion.explanation;
        existingQuestion.updatedAt = new Date();

        // Save the updated quiz
        const savedQuiz = await existingQuiz.save();

        res.status(200).json(savedQuiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// GET all questions
router.get('/showAllQuestions', async (req, res) => {
    try {

        // Admin Access Required
        if (!req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Permission denied. Admin access required.' });
        }

        const questions = await QuizModel.find();
        res.status(200).json(questions);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;