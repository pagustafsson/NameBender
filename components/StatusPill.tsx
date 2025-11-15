import React from 'react';
import { AvailabilityStatus, TLD } from '../types';
import Loader from './Loader';

interface StatusPillProps {
  status: AvailabilityStatus;
  domainName: string;
  tld: TLD;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, domainName, tld }) => {
  const url = status === AvailabilityStatus.TAKEN
    ? `https://${domainName}${tld}`
    : `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domainName}${tld}`;
  
  const ariaLabel = status === AvailabilityStatus.TAKEN
    ? `Visit the live website for ${domainName}${tld}`
    : `Check registration availability for ${domainName}${tld} on GoDaddy`;

  let content: React.ReactNode;
  let pillClasses = "flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-md border transition-colors duration-150";

  switch (status) {
    case AvailabilityStatus.CHECKING:
      pillClasses += " bg-zinc-800 border-zinc-700 text-zinc-400 cursor-wait";
      content = (
        <>
          <Loader className="w-3 h-3" />
          <span>{tld}</span>
        </>
      );
      break;
    case AvailabilityStatus.AVAILABLE:
      pillClasses += " bg-[#00ff99]/10 border-[#00ff99]/50 text-[#00ff99] hover:bg-[#00ff99]/20 hover:border-[#00ff99]/70";
      content = <span>{tld}</span>;
      break;
    case AvailabilityStatus.TAKEN:
      pillClasses += " bg-zinc-800 border-zinc-700 text-zinc-400 group-hover:border-zinc-600 group-hover:text-zinc-300";
      content = <span>{tld}</span>;
      break;
    case AvailabilityStatus.UNKNOWN:
    default:
      pillClasses += " bg-yellow-900/50 border-yellow-700/60 text-yellow-400 cursor-default";
      content = <span>{tld}</span>;
      break;
  }

  const PillContent = <div className={pillClasses}>{content}</div>;

  if (status === AvailabilityStatus.AVAILABLE || status === AvailabilityStatus.TAKEN) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label={ariaLabel}
        className="group w-full"
      >
        {PillContent}
      </a>
    );
  }

  return <div className="w-full">{PillContent}</div>;
};

export default StatusPill;