
import React, { useState, useEffect, useMemo } from 'react';
import { ALL_TLDS } from '../../constants/tlds';
import { checkDomainAvailability } from '../../services/domainService';
import { AvailabilityStatus, TLD } from '../types';

interface CheckAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainName: string | null;
}

interface CheckResult {
  tld: TLD;
  status: AvailabilityStatus;
}

const BATCH_SIZE = 20;

const CheckAllModal: React.FC<CheckAllModalProps> = ({ isOpen, onClose, domainName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || !domainName) {
      return;
    }

    const checkAll = async () => {
      setIsLoading(true);
      setProgress(0);
      setResults([]);
      
      for (let i = 0; i < ALL_TLDS.length; i += BATCH_SIZE) {
        const batch = ALL_TLDS.slice(i, i + BATCH_SIZE);
        const promises = batch.map(tld => 
          checkDomainAvailability(domainName, tld).then(status => ({ tld, status }))
        );

        const batchResults = await Promise.all(promises);
        setResults(prev => [...prev, ...batchResults]);
        setProgress((i + batch.length) / ALL_TLDS.length);
      }

      setIsLoading(false);
    };

    checkAll();
  }, [isOpen, domainName]);

  const { available, taken } = useMemo(() => {
    const available = results
      .filter(r => r.status === AvailabilityStatus.AVAILABLE)
      .sort((a, b) => a.tld.localeCompare(b.tld));
    const taken = results
      .filter(r => r.status !== AvailabilityStatus.AVAILABLE)
      .sort((a, b) => a.tld.localeCompare(b.tld));
    return { available, taken };
  }, [results]);

  if (!isOpen) return null;

  const totalChecked = Math.round(progress * ALL_TLDS.length);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="check-all-modal-title"
      onClick={onClose}
    >
      <div 
        className="bg-[#111] border border-zinc-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[calc(100vh-2rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-zinc-800 shrink-0">
          <h2 id="check-all-modal-title" className="text-xl font-bold text-slate-100">
            Checking all TLDs for: <span className="text-[#00ff99]">{domainName}</span>
          </h2>
        </header>

        {isLoading && (
          <div className="p-6 flex-grow flex flex-col items-center justify-center">
            <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-4">
              <div className="bg-[#00ff99] h-2.5 rounded-full transition-all duration-300" style={{ width: `${Math.round(progress * 100)}%` }}></div>
            </div>
            <p className="text-zinc-400">{totalChecked} of {ALL_TLDS.length} TLDs checked...</p>
          </div>
        )}
        
        {!isLoading && (
          <main className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="pb-6 md:pb-0">
              <h3 className="text-lg font-semibold text-green-400 mb-4 sticky top-0 bg-[#111] py-2 z-10 border-b border-zinc-800/50">Available ({available.length})</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {available.map(({ tld }) => (
                  <li key={tld}>
                    <a 
                      href={`https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domainName}${tld}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${domainName}${tld}`}
                      className="block truncate text-slate-300 hover:text-[#00ff99] transition-colors"
                    >
                      {domainName}<span className="opacity-75">{tld}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-4 sticky top-0 bg-[#111] py-2 z-10 border-b border-zinc-800/50">Taken ({taken.length})</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {taken.map(({ tld }) => (
                  <li key={tld}>
                    <a 
                      href={`https://${domainName}${tld}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${domainName}${tld}`}
                      className="block truncate text-zinc-500 hover:text-zinc-400 transition-colors line-through"
                    >
                      {domainName}<span className="opacity-75">{tld}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </main>
        )}
        
        <footer className="p-6 border-t border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 font-semibold text-black bg-[#00ff99] rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#00ff99]"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CheckAllModal;
