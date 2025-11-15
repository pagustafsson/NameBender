import React, { useState, useCallback, useEffect } from 'react';
import { generateDomainNames, generateAlternativeNames, generateRelevantQuote } from './services/geminiService';
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
  const [inspirationalQuote, setInspirationalQuote] = useState<string | null>(null);
  
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
    setInspirationalQuote(null);

    // Generate the quote in parallel, don't wait for it.
    // It will appear when ready, without a dedicated spinner.
    generateRelevantQuote(prompt)
      .then(setInspirationalQuote)
      .catch(err => {
        console.error("Quote generation failed:", err);
        // Set a default fallback quote on error
        setInspirationalQuote(`"The journey of a thousand miles begins with a single step."
- Lao Tzu`);
      });

    let primarySuggestionName: string | null = null;
    const generationPrompt = prompt; // Use the full prompt for AI context

    // Pattern to find user-specified names, e.g., "... call it 'Bottom Up'"
    const namePattern = /call(?:ed)?\s+['"]?(.+?)['"]?$/i;
    const match = prompt.match(namePattern);

    if (match && match[1]) {
      // Case 1: User explicitly stated a name.
      let potentialName = match[1].trim();
      
      // Clean up conversational fluff like "or something like that" from the end of the extracted name.
      potentialName = potentialName.replace(/\s+or\s+something(\s+like\s+that)?$/i, '').trim();

      primarySuggestionName = potentialName;
      
    } else {
      // Case 2: No explicit name. Check if the prompt is a short, combinable phrase (1-2 words).
      const words = prompt.trim().split(/\s+/);
      if (words.length > 0 && words.length <= 2) {
        primarySuggestionName = prompt.trim();
      }
      // For longer sentences without an explicit name, we won't create a combined version.
    }
    
    const combinedName = primarySuggestionName 
      ? primarySuggestionName.toLowerCase().replace(/\s+/g, '').replace(/[\.]+/g, '') 
      : null;

    let primarySuggestion: DomainSuggestion | null = null;
    let existingNamesForAI: string[] = [];

    if (combinedName) {
      primarySuggestion = {
        id: `${combinedName}-${Date.now()}-${Math.random()}`,
        name: combinedName,
        availability: selectedTlds.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
        isGeneratingAlternatives: false,
      };
      existingNamesForAI.push(combinedName);
    }

    try {
      const names = await generateDomainNames(generationPrompt, existingNamesForAI);

      let suggestions: DomainSuggestion[] = names.map(name => ({
        id: `${name}-${Date.now()}-${Math.random()}`,
        name,
        availability: selectedTlds.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
        isGeneratingAlternatives: false,
      }));

      // If a primary suggestion was created, add it to the top of the list,
      // avoiding duplicates if the AI suggested the same name.
      if (primarySuggestion && !suggestions.some(s => s.name === primarySuggestion!.name)) {
        suggestions.unshift(primarySuggestion);
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

        {inspirationalQuote && (
          <div className="mt-16 w-full max-w-3xl text-center animate-fade-in">
            {(() => {
              const parts = inspirationalQuote.split('\n');
              // Handle case where there might be no newline (e.g., API error fallback)
              if (parts.length < 2) {
                return <p className="text-xl italic text-zinc-400 leading-relaxed whitespace-pre-wrap">{inspirationalQuote}</p>;
              }
              const author = parts.pop();
              const quoteText = parts.join('\n');
              return (
                <figure>
                  <blockquote className="text-xl italic text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {quoteText}
                  </blockquote>
                  {author && (
                    <figcaption className="mt-4 text-xs text-zinc-500">
                      {author}
                    </figcaption>
                  )}
                </figure>
              );
            })()}
          </div>
        )}

        {error && (
          <div className="mt-8 text-red-400 text-center">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {!isLoading && domains.length > 0 && (
          <div className="mt-12 w-full max-w-6xl">
              <DomainList 
                  domains={domains}
                  selectedTlds={selectedTlds}
                  onUpdate={updateDomainState}
                  onCheckAvailability={handleCheckAvailability}
                  onGenerateAlternatives={handleGenerateAlternatives}
                  onCheckAll={handleCheckAllTlds}
              />
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
          </div>
        )}
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
