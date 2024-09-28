'use client'
// Host.js
import { useState, useEffect } from 'react';

const Host = ({ onStartQuiz }) => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const webSocket = new WebSocket('ws://localhost:3001');
    setWs(webSocket);

    webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle messages from the server if needed
    };

    return () => {
      webSocket.close();
    };
  }, []);

  const handleStartQuiz = () => {
    // Notify all connected users that the quiz is starting
    ws.send(JSON.stringify({ type: 'START_QUIZ' }));
    if (onStartQuiz) {
      onStartQuiz(); // Call function passed from parent to start the quiz in the app
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-md">
        <h1 className="text-2xl text-black font-bold text-center mb-4">Host Page</h1>
        <button
          onClick={handleStartQuiz}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default Host;