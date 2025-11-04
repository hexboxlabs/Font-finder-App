import React from 'react';
import type { FontAnalysisResult } from '../types';
import { LinkIcon, FontIcon } from './icons';

interface AnalysisResultProps {
  result: FontAnalysisResult;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
                <FontIcon className="w-8 h-8 text-indigo-400"/>
            </div>
            <div>
                 <p className="text-sm text-indigo-400 font-medium">Identified Font</p>
                 <h2 className="text-3xl font-bold text-white tracking-tight">{result.fontName}</h2>
            </div>
        </div>
      
      <p className="text-gray-300 mt-4 mb-6 leading-relaxed">{result.description}</p>
      
      <div>
        <h3 className="text-md font-semibold text-gray-200 mb-3">Find this font at:</h3>
        <ul className="space-y-3">
          {result.storeLinks.map((link, index) => (
            <li key={index}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors duration-200 group"
              >
                <LinkIcon className="w-5 h-5 text-gray-400 mr-3 group-hover:text-indigo-400 transition-colors"/>
                <span className="font-medium text-gray-200">{link.name}</span>
                <span className="ml-auto text-xs text-gray-500 transform transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
