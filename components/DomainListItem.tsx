import React, { useEffect } from 'react';
import type { DomainSuggestion, TLD } from '../types';
import { AvailabilityStatus, TLDs } from '../types';
import StatusPill from './StatusPill';
import Loader from './Loader';
import DomainList from './DomainList';

interface DomainListItemProps {
  domain: DomainSuggestion;
  onUpdate: (id: string, updates: Partial<DomainSuggestion>) => void;
  onCheckAvailability: (id: string, tld: TLD) => Promise<void>;
  onGenerateAlternatives: (id: string, name: string) => Promise<void>;
  isAlternative?: boolean;
}

const DomainListItem: React.FC<DomainListItemProps> = ({
  domain,
  onUpdate,
  onCheckAvailability,
  onGenerateAlternatives,
  isAlternative = false,
}) => {
  useEffect(() => {
    const performChecks = async () => {
      const checkPromises = TLDs.map(tld => onCheckAvailability(domain.id, tld));
      await Promise.all(checkPromises);
    };
    
    // Only check if status is UNKNOWN for any TLD
    if (domain.availability.some(a => a.status === AvailabilityStatus.UNKNOWN)) {
        performChecks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.id]);

  useEffect(() => {
     // Check if .com is taken and alternatives haven't been generated/are not generating
     const comStatus = domain.availability.find(a => a.tld === '.com')?.status;
     // Only generate alternatives for top-level suggestions if .com is taken
     if (!isAlternative && comStatus === AvailabilityStatus.TAKEN && !domain.alternatives && !domain.isGeneratingAlternatives) {
        onGenerateAlternatives(domain.id, domain.name);
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.availability, domain.id, domain.name, domain.alternatives, domain.isGeneratingAlternatives, isAlternative]);

  const domainInfo = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <p className="font-semibold text-lg text-slate-100 break-all">{domain.name}</p>
      <div className="flex items-center gap-4 shrink-0">
        {TLDs.map(tld => {
          const availability = domain.availability.find(a => a.tld === tld) || { status: AvailabilityStatus.UNKNOWN, tld };
          return (
            <div key={tld} className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-400">{tld}</span>
              <StatusPill status={availability.status} domainName={domain.name} tld={tld} />
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isAlternative) {
    // For alternatives, render just the info without any boxing/background.
    // The parent DomainList provides the vertical spacing.
    return domainInfo;
  }

  // For primary suggestions, render the full component with a box and the alternatives section.
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      {domainInfo}
      {domain.isGeneratingAlternatives && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader />
          <span>Finding creative alternatives...</span>
        </div>
      )}
      {domain.alternatives && domain.alternatives.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
           <h4 className="text-sm font-semibold text-sky-400 mb-2">Alternatives:</h4>
           <DomainList 
             domains={domain.alternatives}
             onUpdate={onUpdate}
             onCheckAvailability={onCheckAvailability}
             onGenerateAlternatives={onGenerateAlternatives}
             isAlternative={true}
           />
        </div>
      )}
    </div>
  );
};

export default DomainListItem;
