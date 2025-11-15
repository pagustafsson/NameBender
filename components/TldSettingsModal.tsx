import React, { useState, useMemo, useEffect } from 'react';
import type { TLD } from '../types';
import { ALL_TLDS } from '../../constants/tlds';

interface TldSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tlds: TLD[]) => void;
  initialSelectedTlds: TLD[];
}

const TldSettingsModal: React.FC<TldSettingsModalProps> = ({ isOpen, onClose, onSave, initialSelectedTlds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<Set<TLD>>(new Set(initialSelectedTlds));

  // Reset internal state when the modal is opened with new initial TLDs
  useEffect(() => {
    if (isOpen) {
      setCurrentSelection(new Set(initialSelectedTlds));
    }
  }, [isOpen, initialSelectedTlds]);

  const handleToggleTld = (tld: TLD) => {
    setCurrentSelection(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tld)) {
        newSelection.delete(tld);
      } else {
        if (newSelection.size < 6) {
          newSelection.add(tld);
        }
      }
      return newSelection;
    });
  };

  const handleSave = () => {
    // FIX: Use spread syntax to convert Set to array to ensure proper type inference.
    onSave([...currentSelection]);
  };
  
  const filteredTlds = useMemo(() => {
    return ALL_TLDS.filter(tld => tld.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tld-modal-title"
    >
      <div className="bg-[#111] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <header className="p-6 border-b border-zinc-800 shrink-0">
          <h2 id="tld-modal-title" className="text-xl font-bold text-slate-100">Customize TLDs</h2>
          <p className="text-sm text-zinc-400 mt-1">Select up to 6 top-level domains to check.</p>
        </header>

        <div className="p-6 shrink-0">
          <input
            type="text"
            placeholder="Search TLDs (e.g. .dev, .store)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 text-slate-200 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-[#00ff99] focus:outline-none"
          />
        </div>

        <div className="px-6 pb-4 shrink-0">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Selected ({currentSelection.size}/6)</h3>
            <div className="flex flex-wrap gap-2 min-h-[36px]">
                {/* FIX: Use spread syntax to convert Set to array to ensure proper type inference. */}
                {[...currentSelection].map(tld => (
                    <div key={tld} className="flex items-center gap-2 bg-zinc-800 text-slate-100 px-3 py-1 rounded-md">
                        <span>{tld}</span>
                        <button onClick={() => handleToggleTld(tld)} className="text-zinc-500 hover:text-white">&times;</button>
                    </div>
                ))}
            </div>
        </div>

        <main className="px-6 pb-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredTlds.map(tld => {
              const isSelected = currentSelection.has(tld);
              const isDisabled = !isSelected && currentSelection.size >= 6;
              return (
                <label
                  key={tld}
                  className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-zinc-800'} ${isSelected ? 'bg-[#00ff99]/10' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleToggleTld(tld)}
                    className="h-5 w-5 rounded bg-zinc-700 border-zinc-600 text-[#00ff99] focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent focus:ring-[#00ff99]"
                  />
                  <span className={`font-medium ${isSelected ? 'text-[#00ff99]' : 'text-slate-300'}`}>{tld}</span>
                </label>
              );
            })}
          </div>
        </main>

        <footer className="p-6 border-t border-zinc-800 flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 font-semibold text-slate-200 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-zinc-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 font-semibold text-black bg-[#00ff99] rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#00ff99]"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TldSettingsModal;