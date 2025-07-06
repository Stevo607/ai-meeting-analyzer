import React from 'react';

interface TranscriptInputProps {
    transcript: string;
    onTranscriptChange: (value: string) => void;
    onAnalyze: () => void;
    isLoading: boolean;
    isApiKeySet: boolean;
}

const TranscriptInput: React.FC<TranscriptInputProps> = ({ transcript, onTranscriptChange, onAnalyze, isLoading, isApiKeySet }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <label htmlFor="transcript" className="block text-lg font-semibold text-gray-200 mb-2">
                Paste Your Meeting Transcript
            </label>
            <p className="text-sm text-gray-400 mb-4">
                Provide the full text of your meeting. The more detail, the better the analysis.
            </p>
            <textarea
                id="transcript"
                value={transcript}
                onChange={(e) => onTranscriptChange(e.target.value)}
                placeholder="e.g., John: Okay team, let's kick off. The main goal today is to finalize the Q3 marketing budget..."
                className="w-full h-48 p-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                disabled={isLoading}
            />
            <div className="mt-4 flex justify-end">
                <button
                    onClick={onAnalyze}
                    disabled={isLoading || !transcript.trim() || !isApiKeySet}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                    title={!isApiKeySet ? 'Please enter your API key first' : !transcript.trim() ? 'Please paste a transcript first' : ''}
                >
                    {isLoading ? 'Analyzing...' : 'Start Analysis'}
                </button>
            </div>
        </div>
    );
};

export default TranscriptInput;