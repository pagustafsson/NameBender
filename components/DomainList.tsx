import React from 'react';
import type { DomainSuggestion, TLD } from '../types';
import DomainListItem from './DomainListItem';

interface DomainListProps {
  domains: DomainSuggestion[];
  selectedTlds: TLD[];
  onUpdate: (id: string, updates: Partial<DomainSuggestion>) => void;
  onCheckAvailability: (id: string, tld: TLD) => Promise<void>;
  onGenerateAlternatives: (id: string, name: string) => Promise<void>;
  onCheckAll: (name: string) => void;
  isAlternative?: boolean;
}

const DomainList: React.FC<DomainListProps> = ({ domains, selectedTlds, isAlternative = false, ...rest }) => {
  return (
    <div className={`w-full ${isAlternative ? 'space-y-3' : 'space-y-4'}`}>
      {domains.map((domain, index) => (
        <div key={domain.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms`}}>
            <DomainListItem domain={domain} selectedTlds={selectedTlds} isAlternative={isAlternative} {...rest} />
        </div>
      ))}
    </div>
  );
};

export default DomainList;