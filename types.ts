
export enum AvailabilityStatus {
  UNKNOWN = 'UNKNOWN',
  CHECKING = 'CHECKING',
  AVAILABLE = 'AVAILABLE',
  TAKEN = 'TAKEN',
}

export type TLD = '.com' | '.co' | '.ai';

export const TLDs: TLD[] = ['.com', '.co', '.ai'];

export interface DomainAvailability {
  tld: TLD;
  status: AvailabilityStatus;
}

export interface DomainSuggestion {
  id: string;
  name: string;
  availability: DomainAvailability[];
  alternatives?: DomainSuggestion[];
  isGeneratingAlternatives: boolean;
}
