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


// show all quizzes
router.get('/allQuizzes', async (req, res, next) => {
    try {
        // Fetch all quizzes
        const quizzes = await QuizModel.find();

        if (!quizzes || quizzes.length === 0) {
            return res.status(404).json({ message: 'No quizzes available.' });
        }

        res.json({ quizzes });
    } catch (error) {
        next(error);
    }
});


// showAll quizzes Domain wise
router.get('/quizzesByDomain/:domain', async (req, res, next) => {
    try {
        const userDomain = req.params.domain; // Assuming domain is passed in the query parameters

        // Fetch quizzes based on the specified user domain
        const quizzes = await QuizModel.find({ domain: userDomain });

        if (!quizzes || quizzes.length === 0) {
            return res.status(404).json({ message: `No quizzes available for the specified domain: ${userDomain}` });
        }

        res.json({ quizzes });
    } catch (error) {
        next(error);

    }
});



// showAll quizzes Domain&year wise
router.get('/quizzesByDomain&year/:domain/:year', async (req, res, next) => {
    try {
        const userDomain = req.params.domain; // Assuming domain is passed in the query parameters
        const useryear = req.params.year; // Assuming domain is passed in the query parameters

        // Fetch quizzes based on the specified user domain
        const quizzes = await QuizModel.find({ domain: userDomain, year: useryear });

        if (!quizzes || quizzes.length === 0) {
            return res.status(404).json({ message: `No quizzes available for the specified domain: ${userDomain} and year: ${useryear}` });
        }

        res.json({ quizzes });
    } catch (error) {
        next(error);

    }
});


// Endpoint to get a paginated list of questions with full details including options
router.get('/showQuestions', async (req, res, next) => {
    try {
        const quizId = req.query.quizId; // Assuming quizId is passed in the query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = 1; // Show only one question at a time

        // Count the total number of questions in the specified quiz
        const quiz = await QuizModel.findById(quizId).select('questions');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }
        const totalQuestions = quiz.questions.length;

        // Handle cycling back to the first question if on the last question
        const normalizedPage = (page - 1) % totalQuestions + 1;

        // Fetch paginated questions with full details including options
        const questions = quiz.questions.slice((normalizedPage - 1) * limit, normalizedPage * limit);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'No questions available for the specified quiz.' });
        }

        res.json({ question: questions[0] });
    } catch (error) {
        next(error);
    }
});







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