
import React, { useState, useCallback, useEffect } from 'react';
import { generateDomainNames, generateAlternativeNames } from './services/geminiService';
import { checkDomainAvailability } from './services/domainService';
import type { DomainSuggestion, TLD } from './types';
import { AvailabilityStatus } from './types';
import DomainInput from './components/DomainInput';
import DomainList from './components/DomainList';
import Loader from './components/Loader';
import TldSettingsModal from './components/TldSettingsModal';
import CheckAllModal from './components/CheckAllModal';

const TLD_STORAGE_KEY = 'aiDomainGenerator_selectedTlds';

const App: React.FC = () => {
  const [domains, setDomains] = useState<DomainSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');
  
  const [selectedTlds, setSelectedTlds] = useState<TLD[]>(() => {
    try {
      const savedTlds = localStorage.getItem(TLD_STORAGE_KEY);
      if (savedTlds) {
        const parsedTlds = JSON.parse(savedTlds);
        if (Array.isArray(parsedTlds) && parsedTlds.length > 0 && parsedTlds.every(item => typeof item === 'string')) {
          return parsedTlds;
        }
      }
    } catch (error) {
      console.error('Failed to parse TLDs from localStorage', error);
    }
    // Default for first-time users or if localStorage is invalid
    return ['.com', '.ai', '.co'];
  });

  const [isTldModalOpen, setIsTldModalOpen] = useState(false);
  const [isCheckAllModalOpen, setIsCheckAllModalOpen] = useState(false);
  const [domainForCheckAll, setDomainForCheckAll] = useState<string | null>(null);

  // Persist TLD selection to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(TLD_STORAGE_KEY, JSON.stringify(selectedTlds));
    } catch (error) {
      console.error('Failed to save TLDs to localStorage', error);
    }
  }, [selectedTlds]);

  const handleCheckAllTlds = (domainName: string) => {
    setDomainForCheckAll(domainName);
    setIsCheckAllModalOpen(true);
  };

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setDomains([]);
    setLastPrompt(prompt);

    const trimmedPrompt = prompt.trim().toLowerCase();
    const isSingleWord = !trimmedPrompt.includes(' ') && trimmedPrompt.length > 0;

    try {
      // Pass the single word to the AI to avoid it being suggested again.
      const existingNamesForAI = isSingleWord ? [trimmedPrompt] : [];
      const names = await generateDomainNames(prompt, existingNamesForAI);

      let suggestions: DomainSuggestion[] = names.map(name => ({
        id: `${name}-${Date.now()}-${Math.random()}`,
        name,
        availability: selectedTlds.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
        isGeneratingAlternatives: false,
      }));

      // If it's a single word search, add it to the top of the list.
      if (isSingleWord) {
        const singleWordSuggestion: DomainSuggestion = {
          id: `${trimmedPrompt}-${Date.now()}-${Math.random()}`,
          name: trimmedPrompt.replace(/[\s.]+/g, ''), // Sanitize just in case
          availability: selectedTlds.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
          isGeneratingAlternatives: false,
        };
        suggestions.unshift(singleWordSuggestion);
      }

      setDomains(suggestions);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDomainState = useCallback((id: string, updates: Partial<DomainSuggestion>) => {
    setDomains(prevDomains =>
      prevDomains.map(d => (d.id === id ? { ...d, ...updates } : {
        ...d,
        alternatives: d.alternatives?.map(alt => alt.id === id ? { ...alt, ...updates } : alt)
      }))
    );
  }, []);

   const updateDomainAvailability = useCallback((id: string, tld: TLD, status: AvailabilityStatus) => {
     setDomains(prevDomains => 
       prevDomains.map(domain => {
         const updateAvailability = (d: DomainSuggestion) => ({
           ...d,
           availability: d.availability.map(a => a.tld === tld ? { ...a, status } : a),
         });

         if (domain.id === id) {
           return updateAvailability(domain);
         }
         
         if (domain.alternatives) {
           return {
             ...domain,
             alternatives: domain.alternatives.map(alt => alt.id === id ? updateAvailability(alt) : alt)
           };
         }
         return domain;
       })
     );
   }, []);


  const handleCheckAvailability = useCallback(async (id: string, tld: TLD) => {
    let domainToCheck: DomainSuggestion | undefined;
    for (const d of domains) {
        if (d.id === id) {
            domainToCheck = d;
            break;
        }
        if (d.alternatives) {
            domainToCheck = d.alternatives.find(alt => alt.id === id);
            if (domainToCheck) break;
        }
    }

    if (!domainToCheck) {
        console.error("Could not find domain with id:", id);
        return;
    }

    updateDomainAvailability(id, tld, AvailabilityStatus.CHECKING);
    const status = await checkDomainAvailability(domainToCheck.name, tld);
    updateDomainAvailability(id, tld, status);
  }, [updateDomainAvailability, domains]);

  const handleGenerateAlternatives = useCallback(async (id: string, name: string) => {
    updateDomainState(id, { isGeneratingAlternatives: true });
    try {
        const altNames = await generateAlternativeNames(name);
        const altSuggestions: DomainSuggestion[] = altNames.map(altName => ({
            id: `${altName}-${Date.now()}-${Math.random()}`,
            name: altName,
            availability: selectedTlds.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
            isGeneratingAlternatives: false,
        }));
        updateDomainState(id, { alternatives: altSuggestions, isGeneratingAlternatives: false });
    } catch (e) {
        // Handle error, maybe show a message next to the domain
        console.error("Failed to generate alternatives for", name);
        updateDomainState(id, { isGeneratingAlternatives: false });
    }
  }, [updateDomainState, selectedTlds]);

  const handleShowMore = async () => {
    setIsShowingMore(true);
    setError(null);

    try {
        const existingNames = domains.flatMap(d => [d.name, ...(d.alternatives?.map(a => a.name) || [])]);
        const newNames = await generateDomainNames(lastPrompt, existingNames);
        const newSuggestions: DomainSuggestion[] = newNames
          .filter(name => !existingNames.includes(name)) // Ensure no duplicates are added
          .map(name => ({
            id: `${name}-${Date.now()}-${Math.random()}`,
            name,
            availability: selectedTlds.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
            isGeneratingAlternatives: false,
        }));
        setDomains(prevDomains => [...prevDomains, ...newSuggestions]);
    } catch(e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching more domains.');
    } finally {
        setIsShowingMore(false);
    }
  };

  const handleSaveTlds = (newTlds: TLD[]) => {
    setSelectedTlds(newTlds);
    setIsTldModalOpen(false);

    if (domains.length > 0) {
      const updateAvailabilityForSuggestion = (suggestion: DomainSuggestion): DomainSuggestion => ({
        ...suggestion,
        availability: newTlds.map(tld => {
          const existing = suggestion.availability.find(a => a.tld === tld);
          return existing ? existing : { tld, status: AvailabilityStatus.UNKNOWN };
        }),
      });

      const updatedDomains = domains.map(domain => ({
        ...updateAvailabilityForSuggestion(domain),
        alternatives: domain.alternatives?.map(updateAvailabilityForSuggestion)
      }));
      
      setDomains(updatedDomains);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col">
      <main className="container mx-auto px-4 py-16 sm:py-24 flex flex-col items-center flex-grow">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[#00ff99]">
            AI Domain Generator
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Generate brilliant domain names with AI and check availability instantly.
          </p>
        </header>

        <DomainInput 
          onGenerate={handleGenerate} 
          isLoading={isLoading} 
          onSettingsClick={() => setIsTldModalOpen(true)}
        />

        <TldSettingsModal 
          isOpen={isTldModalOpen}
          onClose={() => setIsTldModalOpen(false)}
          onSave={handleSaveTlds}
          initialSelectedTlds={selectedTlds}
        />

        <CheckAllModal 
            isOpen={isCheckAllModalOpen}
            onClose={() => setIsCheckAllModalOpen(false)}
            domainName={domainForCheckAll}
        />

        {error && (
          <div className="mt-8 text-red-400 text-center">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="mt-16 w-full max-w-6xl">
            {domains.length > 0 && 
                <DomainList 
                    domains={domains}
                    selectedTlds={selectedTlds}
                    onUpdate={updateDomainState}
                    onCheckAvailability={handleCheckAvailability}
                    onGenerateAlternatives={handleGenerateAlternatives}
                    onCheckAll={handleCheckAllTlds}
                />
            }
            {domains.length > 0 && !isLoading && (
              <div 
                className="mt-12 text-center animate-fade-in"
                style={{ animationDelay: `${domains.length * 50}ms`}}
              >
                <button
                  onClick={handleShowMore}
                  disabled={isShowingMore}
                  className="flex items-center justify-center mx-auto px-8 py-3 font-semibold text-black bg-[#00ff99] rounded-lg hover:opacity-90 disabled:bg-opacity-75 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#00ff99] min-w-[160px]"
                >
                  {isShowingMore ? <Loader className="w-5 h-5 text-white" /> : <span>Show More</span>}
                </button>
              </div>
            )}
        </div>
      </main>
      <footer className="text-center py-8 text-xs text-zinc-500">
        Vibe coded by{' '}
        <a
          href="https://linkedin.com/in/pagustafsson"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-[#00ff99] transition-colors"
        >
          P-A Gustafsson
        </a>
      </footer>
    </div>
  );
};

export default App;