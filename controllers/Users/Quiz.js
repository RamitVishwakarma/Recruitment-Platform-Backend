// todo: through pagination
// ? fetching data trough pagination
// ? quiz submit response api 
//* ? collection -- array of objects -{  
// 1-{
//     userId ,
//     quiztyp {optional} ,
//     takenon, {present date},
//     question solved  :[
//         {
//             questionId,
//             optionmarked,
//             correct: boolean ,


//         }
//     ],
// }

const express = require('express');
const QuizModel = require('../../models/Quiz.js');
const User = require('../../models/User.js');
const QuizResponse = require('../../models/QuizResponse.js');
const router = express.Router();

// Assuming you have a static total number of questions
const totalQuestions = 20;

// Endpoint to get a paginated list of questions with full details including options
router.get('/questions', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 1; // Show only one question at a time

        // Fetch paginated questions with full details including options
        const questions = await QuizModel
            .find()
            .skip((page - 1) * limit)
            .limit(limit);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'No questions available.' });
        }

        // If it's the last question, redirect to the first question
        if (page * limit >= totalQuestions) {
            const firstQuestion = await QuizModel.findOne().limit(1);
            if (!firstQuestion) {
                return res.status(404).json({ message: 'No questions available.' });
            }
            return res.json({ question: firstQuestion });
        }

        res.json({ question: questions[0] });
    } catch (error) {
        next(error);
    }
});


// Endpoint to submit quiz responses
// Endpoint to submit quiz responses
router.post('/submit-quiz', async (req, res, next) => {
    try {
        const userId = req.user._id; // Assuming you have the authenticated user object

        // Assuming the request body has the following structure:
        // { quizId: '123', responses: [{ optionMarked: 'A' }, ...] }
        const { quizId, responses } = req.body;

        // Check if the user has already submitted responses for this quiz
        const existingResponse = await QuizResponse.findOne({ userId, quizId });
        if (existingResponse) {
            return res.status(400).json({ message: 'Quiz already submitted by the user.' });
        }

        // Fetch the correct answers for the quiz
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // Match user responses against correct answers
        // Mapping responses to align with questionsSolved structure
        const scoredResponses = responses.map(userResponse => {
            const question = quiz.questions.find(q =>
                q._id.toString() === userResponse.questionId.toString()
            );

            if (!question) {
                return null; // Handle the case where the question is not found
            }

            const correctAnswer = question.options.find(option =>
                option.isCorrect
            );

            const isCorrect = userResponse.optionMarked === correctAnswer.optionText;

            return {
                questionId: question._id,
                optionMarked: userResponse.optionMarked,
                correct: isCorrect,
            };
        });

        // Filter out null values (questions not found)
        const validScoredResponses = scoredResponses.filter(response => response !== null);

        // Calculate the user's score
        const score = validScoredResponses.filter(response => response.correct).length;

        // Update the user's score and save the quiz responses
        const quizResponse = new QuizResponse({
            userId,
            quizId,
            questionsSolved: validScoredResponses,
            score,
        });

        await quizResponse.save();

        // Update the user's total score
        // Update the user's total score and quiz-specific score
    const user = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            quizzesTaken: {
              quizId,
              totalScore: score,
            },
          },
        },
        { new: true }
      );

        res.json({
            message: 'Quiz submitted successfully.',
            userScore: user.totalScore,
            quizResponse,
        });
    } catch (error) {
        next(error);
    }
});




module.exports = router;