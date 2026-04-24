export type LeadStatus = 'new' | 'contacted' | 'proposal' | 'closed';
export const experienceLevels = ['Iniciante', 'Intermediario', 'PRO'] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];

export interface ProviderAccount {
  email: string;
  password: string;
}

export interface ProviderContact {
  whatsapp: string;
  instagram?: string;
  email: string;
  website?: string;
}

export interface ProviderMetrics {
  profileViews: number;
  portfolioViews: number;
}

export interface PortfolioProject {
  id: string;
  providerId: string;
  title: string;
  category: string;
  location: string;
  year: string;
  coverUrl: string;
  videoUrl?: string;
  summary: string;
  deliverables: string[];
  tags: string[];
  clientName?: string;
  durationLabel?: string;
  featured?: boolean;
}

export interface ProviderProfile {
  id: string;
  name: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  coverImage: string;
  location: string;
  experienceLevel: ExperienceLevel;
  specialties: string[];
  contact: ProviderContact;
  startingPrice: number;
  responseTime: string;
  availabilityLabel: string;
  featuredQuote: string;
  accentColor: string;
  yearsExperience: number;
  completedProjects: number;
  satisfactionRate: number;
  projects: PortfolioProject[];
  metrics: ProviderMetrics;
  account?: ProviderAccount;
  isPro?: boolean;
}

export interface LeadRequest {
  id: string;
  providerId: string;
  projectId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  eventDate?: string;
  location?: string;
  budget?: string;
  brief: string;
  status: LeadStatus;
  createdAt: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  location: string;
  specialties: string[];
  experienceLevel: ExperienceLevel;
}

export interface NewProjectPayload {
  title: string;
  category: string;
  location: string;
  year: string;
  coverUrl: string;
  videoUrl?: string;
  summary: string;
  deliverables: string[];
  tags: string[];
  clientName?: string;
  durationLabel?: string;
}

export interface LeadPayload {
  providerId: string;
  projectId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  eventDate?: string;
  location?: string;
  budget?: string;
  brief: string;
}

export interface MarketplaceState {
  providers: ProviderProfile[];
  favoriteProviderIds: string[];
  leads: LeadRequest[];
}
