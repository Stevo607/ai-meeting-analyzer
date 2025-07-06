import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import TranscriptInput from './components/TranscriptInput';
import TopicsCard from './components/TopicsCard';
import SummaryCard from './components/SummaryCard';
import QACard from './components/QACard';
import ActionsDashboard from './components/ActionsDashboard';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { analyzeTranscript, answerQuestion } from './services/geminiService';
import { AnalysisResult } from './types';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [transcript, setTranscript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isQaLoading, setIsQaLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [qaAnswer, setQaAnswer] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (!apiKey.trim()) {
            setError("Please provide your Gemini API key.");
            return;
        }
        if (!transcript.trim()) {
            setError("Please paste a transcript before starting.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setQaAnswer(null);

        try {
            const result = await analyzeTranscript(transcript, apiKey);
            setAnalysisResult(result);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Analysis failed: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [transcript, apiKey]);

    const handleQuestionSubmit = useCallback(async (question: string) => {
        if (!apiKey.trim()) {
            setError("Please provide your Gemini API key to ask a question.");
            return;
        }
        if (!transcript.trim()) {
            setError("Cannot ask a question without a transcript.");
            return;
        }
        setIsQaLoading(true);
        setQaAnswer(null);
        setError(null);

        try {
            const answer = await answerQuestion(transcript, question, apiKey);
            setQaAnswer(answer);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Q&A failed: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsQaLoading(false);
        }
    }, [transcript, apiKey]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
                <div className="mb-6 bg-gray-800 p-6 rounded-xl shadow-lg">
                    <label htmlFor="api-key" className="block text-lg font-semibold text-gray-200 mb-2">
                        Your Gemini API Key
                    </label>
                    <p className="text-sm text-gray-400 mb-4">
                        To use this app, please provide your Google Gemini API key. It's stored only in your browser and is required for analysis.
                    </p>
                    <input
                        id="api-key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Gemini API Key"
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                </div>

                <TranscriptInput
                    transcript={transcript}
                    onTranscriptChange={setTranscript}
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                    isApiKeySet={!!apiKey.trim()}
                />

                {error && (
                    <div className="my-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {isLoading && (
                    <div className="my-6 flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-lg">
                        <SparklesIcon className="h-12 w-12 text-blue-400 animate-pulse" />
                        <p className="mt-4 text-lg font-semibold text-gray-300">Analyzing your transcript...</p>
                        <p className="text-gray-400">This may take a moment. Gemini is reading, summarizing, and identifying action items.</p>
                    </div>
                )}

                {analysisResult && (
                    <div className="mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <TopicsCard topics={analysisResult.topics} />
                            </div>
                            <div className="lg:col-span-2">
                                <SummaryCard summary={analysisResult.summary} />
                            </div>
                        </div>

                        <div className="mt-6">
                           <QACard onQuestionSubmit={handleQuestionSubmit} answer={qaAnswer} isLoading={isQaLoading} />
                        </div>
                        
                        <div className="mt-8">
                           <ActionsDashboard initialItems={analysisResult.actionItems} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;