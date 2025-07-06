
import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface QACardProps {
    onQuestionSubmit: (question: string) => void;
    answer: string | null;
    isLoading: boolean;
}

const QACard: React.FC<QACardProps> = ({ onQuestionSubmit, answer, isLoading }) => {
    const [question, setQuestion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && !isLoading) {
            onQuestionSubmit(question);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-white mb-3">Ask a Question</h2>
            <p className="text-sm text-gray-400 mb-4">
                Get specific details from the transcript.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What was the final decision on the budget?"
                    className="flex-grow p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                    className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? 'Thinking...' : 'Ask'}
                </button>
            </form>

            {isLoading && (
                <div className="mt-4 p-4 text-center text-gray-400">
                    <p>Finding the answer in the transcript...</p>
                </div>
            )}

            {answer && !isLoading && (
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h3 className="font-semibold text-gray-100 flex items-center gap-2 mb-2">
                        <SparklesIcon className="h-5 w-5 text-indigo-400"/>
                        Answer
                    </h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{answer}</p>
                </div>
            )}
        </div>
    );
};

export default QACard;
