
import { AvailabilityStatus } from '../types';

const EUIPO_API_KEY = process.env.EUIPO_API_KEY;

// PLACEHOLDER: Update this URL to the specific EUIPO Word Mark Search API endpoint you have access to.
// The link provided (Design Search) is different from Trademark/Word Mark search.
// A common endpoint structure for searching might look like this, but depends on your specific API product subscription.
const EUIPO_API_URL = 'https://api.euipo.europa.eu/tunnel-web/secure/webapi/service/tm/search';

export const checkTrademarkAvailability = async (text: string): Promise<AvailabilityStatus> => {
  if (!EUIPO_API_KEY) {
    console.warn("EUIPO_API_KEY is not set. Using fallback behavior (opening search in new tab).");
    return AvailabilityStatus.UNKNOWN;
  }

  try {
    // This is a generic implementation pattern.
    // You may need to adjust the request body or parameters based on the specific API documentation for Word Marks.
    const response = await fetch(`${EUIPO_API_URL}?criteria=${encodeURIComponent(text)}`, {
      method: 'GET', 
      headers: {
        'Authorization': `Bearer ${EUIPO_API_KEY}`, // Adjust auth header format as needed (e.g., 'api-key', 'Ocp-Apim-Subscription-Key')
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`EUIPO API request failed: ${response.status} ${response.statusText}`);
      return AvailabilityStatus.UNKNOWN;
    }

    const data = await response.json();
    
    // Logic to determine availability based on response
    // If results array has items, the trademark is likely taken.
    if (data.results && data.results.length > 0) {
      return AvailabilityStatus.TAKEN;
    }

    return AvailabilityStatus.AVAILABLE;

  } catch (error) {
    console.error("Error checking trademark:", error);
    return AvailabilityStatus.UNKNOWN;
  }
};
