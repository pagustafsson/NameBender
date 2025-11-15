import type { TLD } from '../types';
import { AvailabilityStatus } from '../types';

// RCODE 3 from DNS response, indicating the domain does not exist.
const NXDOMAIN_STATUS = 3;

/**
 * Converts a domain name to its Punycode representation if it contains non-ASCII characters.
 * This is necessary for Internationalized Domain Name (IDN) lookups.
 * @param domain The domain name (e.g., "nätmat.com").
 * @returns The Punycode version of the domain (e.g., "xn--ntmat-5qa.com").
 */
const toPunycode = (domain: string): string => {
  try {
    // The URL constructor is a standard browser API that correctly handles IDN (Punycode) conversion.
    // We create a dummy URL and extract the hostname, which will be the Punycode-encoded version.
    return new URL(`https://` + domain).hostname;
  } catch (e) {
    // If the domain is invalid (e.g., contains characters that can't be in a URL),
    // return it as is and let the DNS query likely fail, which is a safe fallback.
    console.error(`Could not convert domain to Punycode: ${domain}`, e);
    return domain;
  }
};


export const checkDomainAvailability = async (domain: string, tld: TLD): Promise<AvailabilityStatus> => {
  const fullDomain = `${domain}${tld}`;
  // Use the Punycode version for the DNS query to support international characters.
  const punycodeDomain = toPunycode(fullDomain);
  
  try {
    // Switched to Cloudflare's DNS-over-HTTPS API, which supports CORS for browser-side requests.
    // This fixes the "Failed to fetch" errors caused by cross-origin restrictions on Google's API.
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${punycodeDomain}`, {
      headers: {
        'accept': 'application/dns-json',
      },
    });
    
    if (!response.ok) {
      // If the API call itself fails, we can't be sure.
      // Defaulting to TAKEN is a safe bet.
      console.error(`DNS lookup failed for ${punycodeDomain}: ${response.statusText}`);
      return AvailabilityStatus.TAKEN;
    }

    const data = await response.json();

    // Both Google and Cloudflare use DNS RCODE 3 (NXDOMAIN) to indicate a domain does not exist.
    if (data.Status === NXDOMAIN_STATUS) {
      return AvailabilityStatus.AVAILABLE;
    }
    
    // Any other status, including 0 (NOERROR), indicates the domain is registered,
    // even if it doesn't have A/AAAA records. It's not available for registration.
    return AvailabilityStatus.TAKEN;

  } catch (error) {
    // This catch block handles network errors, including the original CORS 'Failed to fetch' error.
    console.error(`Error checking domain availability for ${punycodeDomain}:`, error);
    // In case of a network error or other exception, assume it's taken.
    return AvailabilityStatus.TAKEN;
  }
};
