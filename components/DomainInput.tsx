
import React, { useState, useEffect, useRef } from 'react';
import SparklesIcon from './icons/SparklesIcon';
import Loader from './Loader';
import SettingsIcon from './icons/SettingsIcon';

interface DomainInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  onSettingsClick: () => void;
}

const suggestions = [
  'Names inspired by the movie Tron',
  'A crypto startup name',
  'Future Memories',
  'Names based on songs by Daft Punk',
  'A platform for economists',
  'Fashion brand suggestions',
  'A name for a coffee shop',
  'Tech blog name ideas',
  'A fitness app',
  'Eco-friendly product brand',
  'Travel agency name',
];

const DomainInput: React.FC<DomainInputProps> = ({ onGenerate, isLoading, onSettingsClick }) => {
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
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className={`flex-grow w-full px-6 py-4 bg-[#111] text-lg text-slate-100 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-[#00ff99] focus:outline-none transition-all placeholder:text-zinc-600 placeholder:transition-opacity placeholder:duration-500 ${isFading ? 'placeholder:opacity-0' : 'placeholder:opacity-100'}`}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="flex items-center justify-center px-8 py-4 font-semibold text-black bg-[#00ff99] rounded-lg hover:opacity-90 disabled:bg-opacity-75 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#00ff99]"
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 text-white" />
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              <span>Generate</span>
            </>
          )}
        </button>
        <button
            type="button"
            onClick={onSettingsClick}
            disabled={isLoading}
            aria-label="Customize TLD settings"
            className="flex items-center justify-center p-4 bg-[#111] text-slate-100 border border-zinc-800 rounded-lg hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#00ff99]"
        >
            <SettingsIcon className="w-6 h-6" />
            <span className="sm:hidden ml-2 font-semibold">Settings</span>
        </button>
      </div>
    </form>
  );
};

export default DomainInput;
