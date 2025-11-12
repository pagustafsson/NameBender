
import React from 'react';
import type { DomainSuggestion, TLD } from '../types';
import DomainListItem from './DomainListItem';

interface DomainListProps {
  domains: DomainSuggestion[];
  onUpdate: (id: string, updates: Partial<DomainSuggestion>) => void;
  onCheckAvailability: (id: string, tld: TLD) => Promise<void>;
  onGenerateAlternatives: (id: string, name: string) => Promise<void>;
  isAlternative?: boolean;
}

const DomainList: React.FC<DomainListProps> = ({ domains, ...rest }) => {
  return (
    <div className="w-full max-w-3xl space-y-4">
      {domains.map(domain => (
        <DomainListItem key={domain.id} domain={domain} {...rest} />
      ))}
    </div>
  );
};

export default DomainList;
