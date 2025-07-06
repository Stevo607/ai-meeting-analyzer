
import React, { useState } from 'react';
import { Topic } from '../types';

interface TopicsCardProps {
    topics: Topic[];
}

const TopicsCard: React.FC<TopicsCardProps> = ({ topics }) => {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const handleTopicClick = (topic: Topic) => {
        // If the clicked topic is already selected, deselect it. Otherwise, select it.
        setSelectedTopic(prev => (prev && prev.name === topic.name ? null : topic));
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full">
            <h2 className="text-xl font-bold text-white mb-4">Highlighted Topics</h2>
            {topics.length > 0 ? (
                <>
                    <div className="flex flex-wrap gap-2">
                        {topics.map((topic) => {
                            const isSelected = selectedTopic?.name === topic.name;
                            return (
                                <button 
                                    key={topic.name} 
                                    onClick={() => handleTopicClick(topic)}
                                    className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
                                        isSelected 
                                        ? 'bg-blue-500 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-400' 
                                        : 'bg-blue-900/60 text-blue-300 hover:bg-blue-900/80'
                                    }`}
                                >
                                    {topic.name}
                                </button>
                            );
                        })}
                    </div>
                    {selectedTopic && (
                        <div className="mt-6 p-4 bg-gray-900/70 rounded-lg animate-fade-in">
                            <h3 className="font-semibold text-blue-300 mb-3 text-md">
                                Transcript Excerpts for "{selectedTopic.name}"
                            </h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {selectedTopic.transcriptSections.length > 0 ? selectedTopic.transcriptSections.map((section, i) => (
                                    <blockquote key={i} className="border-l-4 border-blue-600 pl-4 text-sm text-gray-400 italic">
                                       "{section}"
                                    </blockquote>
                                )) : <p className="text-gray-500">No specific excerpts were extracted for this topic.</p>}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-gray-400">No main topics were identified.</p>
            )}
        </div>
    );
};

// Simple fade-in animation
const animationStyle = document.createElement('style');
animationStyle.innerHTML = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fade-in 0.3s ease-out forwards;
    }
`;
document.head.appendChild(animationStyle);


export default TopicsCard;
