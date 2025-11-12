import React from 'react';
import { AvailabilityStatus, TLD } from '../types';
import Loader from './Loader';

interface StatusPillProps {
  status: AvailabilityStatus;
  domainName: string;
  tld: TLD;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, domainName, tld }) => {
  const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full flex items-center justify-center min-w-[70px] transition-colors";
  
  const url = status === AvailabilityStatus.TAKEN
    ? `https://${domainName}${tld}`
    : `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domainName}${tld}`;
  
  const ariaLabel = status === AvailabilityStatus.TAKEN
    ? `Visit the live website for ${domainName}${tld}`
    : `Check registration availability for ${domainName}${tld} on GoDaddy`;


  const PillContent = () => {
      switch (status) {
        case AvailabilityStatus.CHECKING:
          return (
            <div className={`${baseClasses} bg-slate-700 text-slate-300`}>
              <Loader className="w-3 h-3" />
            </div>
          );
        case AvailabilityStatus.AVAILABLE:
          return (
            <div className={`${baseClasses} bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500/20`}>
              Available
            </div>
          );
        case AvailabilityStatus.TAKEN:
          return (
            <div className={`${baseClasses} bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20`}>
              Taken
            </div>
          );
        case AvailabilityStatus.UNKNOWN:
        default:
          return (
            <div className={`${baseClasses} bg-slate-700 text-slate-500`}>
              ...
            </div>
          );
      }
  }


  if (status === AvailabilityStatus.AVAILABLE || status === AvailabilityStatus.TAKEN) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label={ariaLabel}
        className="group"
      >
        <PillContent />
      </a>
    );
  }

  return <PillContent />;
};

export default StatusPill;