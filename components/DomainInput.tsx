import React, { useState, useEffect, useRef } from 'react';
import SparklesIcon from './icons/SparklesIcon';
import Loader from './Loader';

interface DomainInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const suggestions = [
  'a collaborative whiteboard for teams',
  'Music app for discovering new artists',
  'Name for a crypto startup',
  'Social media domain names',
  'Fashion brand inspiration',
  'A meal delivery service for pets',
  'AI-powered personal finance tracker',
  'Eco-friendly packaging solutions',
  'Online platform for local artisans',
];

const DomainInput: React.FC<DomainInputProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [placeholder, setPlaceholder] = useState(suggestions[0]);
  const [isFading, setIsFading] = useState(false);
  const placeholderIndexRef = useRef(0);

  useEffect(() => {
    if (prompt) {
      setIsFading(false); // Ensure placeholder is visible when typing
      return;
    }

    const intervalId = setInterval(() => {
      setIsFading(true); // Trigger fade out

      setTimeout(() => {
        placeholderIndexRef.current = (placeholderIndexRef.current + 1) % suggestions.length;
        setPlaceholder(suggestions[placeholderIndexRef.current]);
        setIsFading(false); // Trigger fade in
      }, 500); // This duration should match the CSS transition for fade-out
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(intervalId);
  }, [prompt]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className={`flex-grow w-full px-4 py-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition placeholder:text-slate-500 placeholder:transition-opacity placeholder:duration-500 ${isFading ? 'placeholder:opacity-0' : 'placeholder:opacity-100'}`}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="flex items-center justify-center px-6 py-3 font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-500"
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default DomainInput;