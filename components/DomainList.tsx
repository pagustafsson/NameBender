
import React from 'react';
import type { DomainSuggestion, TLD } from '../types';
import DomainListItem from './DomainListItem';

interface DomainListProps {
  domains: DomainSuggestion[];
  selectedTlds: TLD[];
  onUpdate: (id: string, updates: Partial<DomainSuggestion>) => void;
  onCheckAvailability: (id: string, tld: TLD) => Promise<void>;
  onCheckAll: (name: string) => void;
  onCheckTrademark: (id: string, name: string) => void;
}

const DomainList: React.FC<DomainListProps> = ({ domains, selectedTlds, ...rest }) => {
  return (
    <div className="w-full space-y-4">
      {domains.map((domain, index) => (
        <div key={domain.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms`}}>
            <DomainListItem domain={domain} selectedTlds={selectedTlds} {...rest} />
        </div>
      ))}
    </div>
  );
};

export default DomainList;
