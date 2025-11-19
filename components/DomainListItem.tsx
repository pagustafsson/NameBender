
import React, { useEffect } from 'react';
import type { DomainSuggestion, TLD } from '../types';
import { AvailabilityStatus } from '../types';
import StatusPill from './StatusPill';

interface DomainListItemProps {
  domain: DomainSuggestion;
  selectedTlds: TLD[];
  onUpdate: (id: string, updates: Partial<DomainSuggestion>) => void;
  onCheckAvailability: (id: string, tld: TLD) => Promise<void>;
  onCheckAll: (name: string) => void;
}

const DomainListItem: React.FC<DomainListItemProps> = ({
  domain,
  selectedTlds,
  onCheckAvailability,
  onCheckAll,
}) => {
  useEffect(() => {
    const performChecks = async () => {
      const checkPromises = selectedTlds.map(tld => {
        const availability = domain.availability.find(a => a.tld === tld);
        // Only check if status is UNKNOWN for the selected TLD
        if (!availability || availability.status === AvailabilityStatus.UNKNOWN) {
          return onCheckAvailability(domain.id, tld);
        }
        return Promise.resolve();
      });
      await Promise.all(checkPromises);
    };
    
    performChecks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.id, domain.availability, selectedTlds, onCheckAvailability]);

  return (
    <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/50 transition-all hover:border-zinc-700/80">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="font-semibold text-slate-100 whitespace-nowrap truncate md:pr-4 text-xl">{domain.name}</p>
          <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
              <div className="w-[calc(50%-0.25rem)] sm:w-auto sm:min-w-[100px]">
                  <button
                      onClick={() => onCheckAll(domain.name)}
                      className="group flex items-center justify-center w-full px-3 py-2 text-sm rounded-md font-semibold text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 transition-all"
                  >
                      Check all
                  </button>
              </div>
              {selectedTlds.map(tld => {
                  const availability = domain.availability.find(a => a.tld === tld) || { status: AvailabilityStatus.UNKNOWN, tld };
                  return (
                      <div key={tld} className="w-[calc(50%-0.25rem)] sm:w-auto sm:min-w-[100px]">
                          <StatusPill status={availability.status} domainName={domain.name} tld={tld} />
                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default DomainListItem;