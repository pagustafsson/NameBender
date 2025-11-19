
import React, { useState, useCallback, useEffect } from 'react';
import { generateDomainNames } from './services/geminiService';
import { checkDomainAvailability } from './services/domainService';
import { checkTrademarkAvailability } from './services/trademarkService';
import type { DomainSuggestion, TLD, BlogPostData } from './types';
import { AvailabilityStatus } from './types';
import { BLOG_POSTS } from '../constants/blogPosts';
import DomainInput from './components/DomainInput';
import DomainList from './components/DomainList';
import Loader from './components/Loader';
import TldSettingsModal from './components/TldSettingsModal';
import CheckAllModal from './components/CheckAllModal';
import BlogSection from './components/BlogSection';
import BlogPostView from './components/BlogPostView';
import RegisterBrandView from './components/RegisterBrandView';

const TLD_STORAGE_KEY = 'aiDomainGenerator_selectedTlds';

const App: React.FC = () => {
  // Domain Generator State
  const [domains, setDomains] = useState<DomainSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');
  
  // Modal & TLD State
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
    return ['.com', '.ai', '.co'];
  });
  const [isTldModalOpen, setIsTldModalOpen] = useState(false);
  const [isCheckAllModalOpen, setIsCheckAllModalOpen] = useState(false);
  const [domainForCheckAll, setDomainForCheckAll] = useState<string | null>(null);

  // View Management State
  const [currentView, setCurrentView] = useState<'search' | 'blogList' | 'blogPost' | 'register'>('search');
  const [selectedPost, setSelectedPost] = useState<BlogPostData | null>(null);
  const blogPosts = BLOG_POSTS; // Use static blog posts

  // Persist TLD selection
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
    setCurrentView('search'); // Ensure we are on the search view
    setIsLoading(true);
    setError(null);
    setDomains([]);
    setLastPrompt(prompt);

    let primarySuggestionName: string | null = null;
    const namePattern = /call(?:ed)?\s+['"]?(.+?)['"]?$/i;
    const match = prompt.match(namePattern);

    if (match && match[1]) {
      let potentialName = match[1].trim().replace(/\s+or\s+something(\s+like\s+that)?$/i, '').trim();
      primarySuggestionName = potentialName;
    } else {
      const words = prompt.trim().split(/\s+/);
      if (words.length > 0 && words.length <= 2) {
        primarySuggestionName = prompt.trim();
      }
    }
    
    const combinedName = primarySuggestionName 
      ? primarySuggestionName.toLowerCase().replace(/\s+/g, '').replace(/[\.]+/g, '') 
      : null;

    let primarySuggestion: DomainSuggestion | null = null;
    let existingNamesForAI: string[] = [];

    if (combinedName) {
      primarySuggestion = {
        id: `${combinedName}-${Date.now()}`,
        name: combinedName,
        availability: selectedTlds.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
        trademarkStatus: AvailabilityStatus.UNKNOWN,
      };
      existingNamesForAI.push(combinedName);
    }

    try {
      const names = await generateDomainNames(prompt, existingNamesForAI);
      let suggestions: DomainSuggestion[] = names.map(name => ({
        id: `${name}-${Date.now()}-${Math.random()}`,
        name,
        availability: selectedTlds.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
        trademarkStatus: AvailabilityStatus.UNKNOWN,
      }));

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
      prevDomains.map(d => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const updateDomainAvailability = useCallback((id: string, tld: TLD, status: AvailabilityStatus) => {
     setDomains(prevDomains => 
       prevDomains.map(domain => {
         const updateAvailability = (d: DomainSuggestion) => ({
           ...d,
           availability: d.availability.map(a => a.tld === tld ? { ...a, status } : a),
         });

         if (domain.id === id) return updateAvailability(domain);
         return domain;
       })
     );
   }, []);

  const handleCheckAvailability = useCallback(async (id: string, tld: TLD) => {
    const domainToCheck = domains.find(d => d.id === id);
    if (!domainToCheck) return;
    updateDomainAvailability(id, tld, AvailabilityStatus.CHECKING);
    const status = await checkDomainAvailability(domainToCheck.name, tld);
    updateDomainAvailability(id, tld, status);
  }, [updateDomainAvailability, domains]);

  const handleCheckTrademark = useCallback(async (id: string, name: string) => {
     updateDomainState(id, { trademarkStatus: AvailabilityStatus.CHECKING });
     
     // Check if API key is set by checking result of a dummy call or just use logic in service
     // We delegate fully to service
     const status = await checkTrademarkAvailability(name);
     
     if (status === AvailabilityStatus.UNKNOWN && !process.env.EUIPO_API_KEY) {
        // Fallback: If no API key is configured, open TMview in a new tab
        window.open(`https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&basicSearch=${name}`, '_blank');
        updateDomainState(id, { trademarkStatus: AvailabilityStatus.UNKNOWN });
     } else {
        updateDomainState(id, { trademarkStatus: status });
     }
  }, [updateDomainState]);

  const handleShowMore = async () => {
    setIsShowingMore(true);
    setError(null);
    try {
        const existingNames = domains.map(d => d.name);
        const newNames = await generateDomainNames(lastPrompt, existingNames);
        const newSuggestions: DomainSuggestion[] = newNames
          .filter(name => !existingNames.includes(name))
          .map(name => ({
            id: `${name}-${Date.now()}`,
            name,
            availability: selectedTlds.map(tld => ({ tld, status: AvailabilityStatus.UNKNOWN })),
            trademarkStatus: AvailabilityStatus.UNKNOWN,
        }));
        setDomains(prevDomains => [...prevDomains, ...newSuggestions]);
    } catch(e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsShowingMore(false);
    }
  };

  const handleSaveTlds = (newTlds: TLD[]) => {
    setSelectedTlds(newTlds);
    setIsTldModalOpen(false);
    if (domains.length > 0) {
      const updateAvailability = (suggestion: DomainSuggestion): DomainSuggestion => ({
        ...suggestion,
        availability: newTlds.map(tld => suggestion.availability.find(a => a.tld === tld) || { tld, status: AvailabilityStatus.UNKNOWN }),
      });
      setDomains(domains.map(d => updateAvailability(d)));
    }
  };
  
  const handleSelectPost = (post: BlogPostData) => {
    setSelectedPost(post);
    setCurrentView('blogPost');
    window.scrollTo(0, 0);
  };

  const navigateToView = (view: 'search' | 'blogList' | 'register') => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'blogPost':
        return selectedPost && <BlogPostView post={selectedPost} onBack={() => navigateToView('blogList')} onHome={() => navigateToView('search')} />;
      case 'blogList':
        return <BlogSection posts={blogPosts} onSelectPost={handleSelectPost} onHome={() => navigateToView('search')} />;
      case 'register':
        return <RegisterBrandView onHome={() => navigateToView('search')} />;
      case 'search':
      default:
        return (
          <>
            <header className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[#00ff99]">Name Bender</h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">Generate brilliant domain names with AI and check availability instantly.</p>
            </header>
            <DomainInput onGenerate={handleGenerate} isLoading={isLoading} onSettingsClick={() => setIsTldModalOpen(true)} />
            
            {error && <div className="mt-8 text-red-400 text-center"><strong>Error:</strong> {error}</div>}
            
            {!isLoading && domains.length > 0 && (
              <div className="mt-12 w-full max-w-6xl">
                  <DomainList 
                    domains={domains} 
                    selectedTlds={selectedTlds} 
                    onUpdate={updateDomainState} 
                    onCheckAvailability={handleCheckAvailability} 
                    onCheckAll={handleCheckAllTlds}
                    onCheckTrademark={handleCheckTrademark}
                  />
                  <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: `${domains.length * 50}ms`}}>
                    <button onClick={handleShowMore} disabled={isShowingMore} className="flex items-center justify-center mx-auto px-8 py-3 font-semibold text-black bg-[#00ff99] rounded-lg hover:opacity-90 disabled:bg-opacity-75 disabled:cursor-not-allowed min-w-[160px]">
                      {isShowingMore ? <Loader className="w-5 h-5 text-white" /> : <span>Show More</span>}
                    </button>
                  </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col">
      <main className="container mx-auto px-4 py-16 sm:py-24 flex flex-col items-center flex-grow">
        <TldSettingsModal isOpen={isTldModalOpen} onClose={() => setIsTldModalOpen(false)} onSave={handleSaveTlds} initialSelectedTlds={selectedTlds} />
        <CheckAllModal isOpen={isCheckAllModalOpen} onClose={() => setIsCheckAllModalOpen(false)} domainName={domainForCheckAll} />
        {renderContent()}
      </main>
      <footer className="w-full border-t border-zinc-800/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-zinc-500">
           <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-4">
              <button onClick={() => navigateToView('blogList')} className="text-base font-semibold text-zinc-300 hover:text-[#00ff99] transition-colors">
                  Why brands matter
              </button>
              <button onClick={() => navigateToView('register')} className="text-base font-semibold text-zinc-300 hover:text-[#00ff99] transition-colors">
                  Register Your Brand
              </button>
          </div>
          <p className="text-xs">Vibe coded by <a href="https://linkedin.com/in/pagustafsson" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#00ff99] transition-colors">P-A Gustafsson</a></p>
        </div>
      </footer>
    </div>
  );
};

export default App;
