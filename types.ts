
export enum AvailabilityStatus {
  UNKNOWN = 'UNKNOWN',
  CHECKING = 'CHECKING',
  AVAILABLE = 'AVAILABLE',
  TAKEN = 'TAKEN',
}

export type TLD = string;

export interface DomainAvailability {
  tld: TLD;
  status: AvailabilityStatus;
}

export interface DomainSuggestion {
  id: string;
  name: string;
  availability: DomainAvailability[];
  trademarkStatus: AvailabilityStatus;
}

export interface BlogPostContentSection {
  heading: string;
  body: string; // Supports markdown for lists
}

export interface BlogPostData {
  id: string;
  title: string;
  intro: string;
  sections: BlogPostContentSection[];
  takeaway: string;
}