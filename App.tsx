import React, { useState, useCallback } from 'react';
import { generateDomainNames, generateAlternativeNames } from './services/geminiService';
import { checkDomainAvailability } from './services/domainService';
import type { DomainSuggestion, TLD } from './types';
import { AvailabilityStatus, TLDs } from './types';
import DomainInput from './components/DomainInput';
import DomainList from './components/DomainList';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [domains, setDomains] = useState<DomainSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setDomains([]);
    setLastPrompt(prompt);

    try {
      const names = await generateDomainNames(prompt);
      const initialSuggestions: DomainSuggestion[] = names.map(name => ({
        id: `${name}-${Date.now()}-${Math.random()}`,
        name,
        availability: TLDs.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
        isGeneratingAlternatives: false,
      }));
      setDomains(initialSuggestions);
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
            availability: TLDs.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
            isGeneratingAlternatives: false,
        }));
        updateDomainState(id, { alternatives: altSuggestions, isGeneratingAlternatives: false });
    } catch (e) {
        // Handle error, maybe show a message next to the domain
        console.error("Failed to generate alternatives for", name);
        updateDomainState(id, { isGeneratingAlternatives: false });
    }
  }, [updateDomainState]);

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
            availability: TLDs.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
            isGeneratingAlternatives: false,
        }));
        setDomains(prevDomains => [...prevDomains, ...newSuggestions]);
    } catch(e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching more domains.');
    } finally {
        setIsShowingMore(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-20 flex flex-col items-center">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">
            Epic Name Generator
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Get inspired with creative domain names and check availability instantly.
          </p>
        </header>

        <DomainInput onGenerate={handleGenerate} isLoading={isLoading} />
        <p className="text-xs text-slate-500 mt-2 text-center">Vibe coded by P-A Gustafsson</p>


        {error && (
          <div className="mt-6 bg-rose-500/10 text-rose-400 p-4 rounded-lg text-center border border-rose-500/20">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="mt-16 w-full max-w-3xl">
            {domains.length > 0 && 
                <DomainList 
                    domains={domains} 
                    onUpdate={updateDomainState}
                    onCheckAvailability={handleCheckAvailability}
                    onGenerateAlternatives={handleGenerateAlternatives}
                />
            }
            {domains.length > 0 && !isLoading && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleShowMore}
                  disabled={isShowingMore}
                  className="flex items-center justify-center mx-auto px-6 py-3 font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-500 min-w-[140px]"
                >
                  {isShowingMore ? <Loader /> : <span>Show More</span>}
                </button>
              </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;
