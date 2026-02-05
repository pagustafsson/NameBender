import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onSave: (key: string) => void;
    onClose: () => void;
    initialKey?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, initialKey = '' }) => {
    const [key, setKey] = useState(initialKey);

    useEffect(() => {
        setKey(initialKey);
    }, [initialKey]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#111] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-6"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-slate-100 mb-4">Set Gemini API Key</h2>
                <p className="text-zinc-400 mb-4 text-sm">
                    To use this app publicly, you need a Gemini API Key.
                    Get one for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[#00ff99] hover:underline">Google AI Studio</a>.
                </p>

                <input
                    type="password"
                    placeholder="Paste your API Key here"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 text-slate-200 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-[#00ff99] mb-6"
                />

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                    <button
                        onClick={() => onSave(key)}
                        disabled={!key.trim()}
                        className="px-6 py-2 bg-[#00ff99] text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                        Save Key
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
