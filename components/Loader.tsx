import React from 'react';
import { SparklesIcon } from './icons';

interface LoaderProps {
    message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
        <SparklesIcon className="w-12 h-12 text-indigo-400 animate-pulse"/>
        <p className="mt-4 text-lg font-semibold text-white">{message}</p>
        <p className="mt-1 text-sm text-gray-400">This may take a moment...</p>
    </div>
  );
};
