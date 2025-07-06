
import React, { useState, useEffect, useCallback } from 'react';
import { Summary } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface SummaryCardProps {
    summary: Summary;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const [maleVoice, setMaleVoice] = useState<SpeechSynthesisVoice | null>(null);

    // This effect runs only once on mount to set up speech synthesis features.
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setIsSpeechSupported(true);
            
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length === 0) return; // Voices not ready yet

                const foundVoice = voices.find(voice => 
                    voice.name.includes('David') || 
                    voice.name.includes('Google US English') || 
                    voice.name.includes('Microsoft David') || 
                    (voice.lang.startsWith('en') && voice.name.toLowerCase().includes('male'))
                ) || voices.find(v => v.lang.startsWith('en-US')) || null;
                
                setMaleVoice(foundVoice);
            };

            // Load voices immediately and also on change
            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
        
        // Cleanup function to stop speech on component unmount
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []); // Empty dependency array ensures this runs only once.

    const handlePlayPause = useCallback(() => {
        if (!isSpeechSupported) return;

        const synth = window.speechSynthesis;

        if (synth.speaking) {
            synth.cancel();
            setIsPlaying(false);
        } else {
            const textToSpeak = `
                Meeting Overview: ${summary.overview}.
                Main Points: ${summary.mainPoints.join('. ')}.
                Conclusion: ${summary.conclusion}.
                Unanswered Questions: ${summary.unansweredQuestions.join('. ')}.
            `;
            const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());
            if (maleVoice) {
                utterance.voice = maleVoice;
            }
            utterance.pitch = 1;
            utterance.rate = 1;
            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false); // Handle errors too
            
            synth.speak(utterance);
        }
    }, [isSpeechSupported, maleVoice, summary]);


    // Effect to cancel speech if the summary changes while playing.
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
                window.speechSynthesis.cancel();
                setIsPlaying(false);
            }
        };
    }, [summary]);


    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Meeting Summary</h2>
                {isSpeechSupported && (
                    <button
                        onClick={handlePlayPause}
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                        aria-label={isPlaying ? "Pause summary reading" : "Read summary aloud"}
                    >
                        {isPlaying ? <PauseIcon className="h-5 w-5 text-white" /> : <PlayIcon className="h-5 w-5 text-white" />}
                    </button>
                )}
            </div>

            <div className="space-y-4 text-gray-300">
                <div>
                    <h3 className="font-semibold text-gray-100 mb-1">Overview</h3>
                    <p className="text-sm">{summary.overview}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-100 mb-2">Main Points</h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        {summary.mainPoints.map((point, index) => <li key={index} className="text-sm">{point}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-100 mb-1">Conclusion</h3>
                    <p className="text-sm">{summary.conclusion}</p>
                </div>
                {summary.unansweredQuestions.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-yellow-400 mb-2">Unanswered Questions</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2 text-yellow-300">
                            {summary.unansweredQuestions.map((q, index) => <li key={index} className="text-sm">{q}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryCard;
