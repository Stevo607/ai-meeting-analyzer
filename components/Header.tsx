
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-6 py-4 flex items-center">
                <SparklesIcon className="h-8 w-8 text-blue-400 mr-3" />
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Gemini Meeting Analyzer
                </h1>
            </div>
        </header>
    );
};

export default Header;
