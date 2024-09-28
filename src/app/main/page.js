'use client'
import { useState, useEffect } from 'react';

const Main = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [ws, setWs] = useState(null);
    const [locked, setLocked] = useState(false);
    const [username, setUsername] = useState('');
    const [showUsernameInput, setShowUsernameInput] = useState(true);
    const [showWaitingArea, setShowWaitingArea] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [timer, setTimer] = useState(10); // Timer state
    const [intervalId, setIntervalId] = useState(null); // For storing interval ID
    const [players, setPlayers] = useState([]); // State for storing all player scores

    useEffect(() => {
        const webSocket = new WebSocket('wss://live-quiz-backend.onrender.com');
        setWs(webSocket);

        webSocket.onopen = () => {
            webSocket.send(JSON.stringify({ type: 'GET_QUESTIONS' }));
        };

        webSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'QUESTIONS') {
                setQuestions(data.payload);
            } else if (data.type === 'UPDATE_SCORES') {
                // Update the leaderboard with the list of players and their scores
                setPlayers(data.players);
            } else if (data.type === 'START_QUIZ') {
                handleStartQuizFromWaitingArea();
            }
        };

        return () => {
            webSocket.close();
        };
    }, []);

    useEffect(() => {
        if (currentQuestionIndex < questions.length) {
            const id = setInterval(() => {
                setTimer((prev) => {
                    if (prev > 0) {
                        return prev - 1;
                    } else {
                        clearInterval(id); // Clear the interval when the timer hits 0
                        handleNextQuestion(); // Proceed to the next question
                        return 10; // Reset the timer for the next question
                    }
                });
            }, 1000);

            // Store the interval ID so we can clear it when moving to the next question
            setIntervalId(id);

            return () => clearInterval(id); // Clear interval on component unmount or question change
        }
    }, [currentQuestionIndex, questions.length]);

    const handleAnswer = (answer) => {
        if (!locked) {
            setSelectedAnswer(answer); // Set the selected answer
            setLocked(true); // Lock the question after an answer is selected

            // Update score only, but don't move to the next question until timer collapses
            if (answer === questions[currentQuestionIndex].correct) {
                setScore(score + 1); // Increase score if the answer is correct
                // Send score update to the server
                ws.send(JSON.stringify({
                    type: 'UPDATE_SCORE',
                    username: username,
                    score: score + 1
                }));
            }
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setSelectedAnswer(null);
            setCurrentQuestionIndex((prev) => prev + 1);
            setLocked(false); // Unlock for the next question
            setTimer(10); // Reset the timer for the next question
        } else {
            // Quiz finished
            clearInterval(intervalId); // Clear any remaining intervals
        }
    };

    const handleStartQuiz = () => {
        if (username) {
            setShowUsernameInput(false);
            setShowWaitingArea(true);
        }
 };

    const handleStartQuizFromWaitingArea = () => {
        setShowWaitingArea(false);
        setShowQuiz(true);
        setCurrentQuestionIndex(0);
        setTimer(10);
    };

    return (
        <div className="flex items-start justify-center min-h-screen bg-gray-100">
            {/* Main Quiz Section */}
            {showUsernameInput ? (
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-md">
                    <h1 className="text-2xl text-black font-bold text-center mb-4">Enter Your Username</h1>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full text-black p-2 border rounded mb-4"
                        placeholder="Username"
                    />
                    <button
                        onClick={handleStartQuiz}
                        className="w-full bg-blue-500 text-white p-2 rounded"
                    >
                        Start Quiz
                    </button>
                </div>
            ) : showWaitingArea ? (
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-md">
                    <h1 className="text-2xl text-black font-bold text-center mb-4">Waiting for the quiz to start...</h1>
                    {/* <button
                        onClick={handleStartQuizFromWaitingArea}
                        className="w-full bg-blue-500 text-white p-2 rounded"
                    >
                        Start Quiz
                    </button> */}
                </div>
            ) : showQuiz && questions.length > 0 && currentQuestionIndex < questions.length ? (
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-md ml-6">
                    <h2 className='text-black mb-1'>Your Score: {score}</h2>
                    <h1 className="text-2xl text-black font-bold text-center mb-4">{questions[currentQuestionIndex].question}</h1>
                    <div className="text-center mb-4 text-red-500">Time Left: {timer}s</div> {/* Timer Display */}
                    <div className="mt-4">
                        {questions[currentQuestionIndex].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                disabled={locked} // Disable buttons when locked
                                className={`w-full m-2 text-black p-2 border rounded ${
                                    selectedAnswer === option
                                        ? (option === questions[currentQuestionIndex].correct ? 'bg-green-500' : 'bg-red-500')
                                        : ''
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <h1 className="text-2xl text-black font-bold text-center">Quiz Finished! Your Score: {score}</h1>
            )}

            {/* Leaderboard Section */}
            <div className="bg-gray-200 p-6 rounded-lg shadow-lg ml-6 w-1/4 max-w-sm self-start">
    <h1 className="text-2xl font-bold mb-4 text-center text-black">Leaderboard</h1>
    <ul className="list-none pl-0">
        {players.map((player, index) => (
            <li key={index} className="text-black border-b border-gray-300 pb-2 mb-2">
                <div className="flex justify-between">
                    <span className="text-lg">{player.username}</span>
                    <span className="text-lg">{player.score} points</span>
                </div>
            </li>
        ))}
    </ul>
</div>
        </div>
    );
};

export default Main;
