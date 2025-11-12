import type { TLD } from '../types';
import { AvailabilityStatus } from '../types';

// RCODE 3 from DNS response, indicating the domain does not exist.
const NXDOMAIN_STATUS = 3;

export const checkDomainAvailability = async (domain: string, tld: TLD): Promise<AvailabilityStatus> => {
  const fullDomain = `${domain}${tld}`;
  try {
    const response = await fetch(`https://dns.google/resolve?name=${fullDomain}`);
    if (!response.ok) {
      // If the API call itself fails, we can't be sure.
      // Defaulting to TAKEN is a safe bet.
      console.error(`DNS lookup failed for ${fullDomain}: ${response.statusText}`);
      return AvailabilityStatus.TAKEN;
    }

    const data = await response.json();

    // According to Google's DoH API, a status of 3 (NXDOMAIN) means the domain does not exist.
    if (data.Status === NXDOMAIN_STATUS) {
      return AvailabilityStatus.AVAILABLE;
    }
    
    // Any other status, including 0 (NOERROR), indicates the domain is registered,
    // even if it doesn't have A/AAAA records. It's not available for registration.
    return AvailabilityStatus.TAKEN;

  } catch (error) {
    console.error(`Error checking domain availability for ${fullDomain}:`, error);
    // In case of a network error or other exception, assume it's taken.
    return AvailabilityStatus.TAKEN;
  }
};
