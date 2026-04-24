import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { seedState } from '../data/mockMarketplace';
import {
  MARKETPLACE_STORAGE_KEY,
  SCHEMA_STORAGE_KEY,
  SCHEMA_VERSION,
  SESSION_STORAGE_KEY,
} from '../lib/storage';
import {
  LeadPayload,
  LeadRequest,
  LeadStatus,
  MarketplaceState,
  NewProjectPayload,
  PortfolioProject,
  ProviderProfile,
  RegisterPayload,
} from '../types/marketplace';
import { slugId } from '../utils/format';

interface MarketplaceContextValue {
  loading: boolean;
  signedIn: boolean;
  currentProvider: ProviderProfile | null;
  providers: ProviderProfile[];
  favoriteProviderIds: string[];
  favoriteProviders: ProviderProfile[];
  leads: LeadRequest[];
  currentProviderLeads: LeadRequest[];
  categories: string[];
  locations: string[];
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  registerProvider: (payload: RegisterPayload) => Promise<void>;
  updateCurrentProvider: (payload: Partial<ProviderProfile>) => Promise<void>;
  upgradeCurrentProviderToPro: () => Promise<void>;
  addProject: (payload: NewProjectPayload) => Promise<void>;
  submitLeadRequest: (payload: LeadPayload) => Promise<LeadRequest>;
  updateLeadStatus: (leadId: string, status: LeadStatus) => Promise<void>;
  toggleFavorite: (providerId: string) => Promise<void>;
  isFavorite: (providerId: string) => boolean;
  getProviderById: (providerId: string) => ProviderProfile | undefined;
  getProjectById: (providerId: string, projectId: string) => PortfolioProject | undefined;
  trackProfileView: (providerId: string) => Promise<void>;
  trackProjectView: (providerId: string, projectId: string) => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined);

async function persistMarketplaceState(state: MarketplaceState) {
  await AsyncStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(state));
}

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [marketplace, setMarketplace] = useState<MarketplaceState>(seedState);
  const [signedProviderId, setSignedProviderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      try {
        const [storedVersion, storedState, storedSession] = await Promise.all([
          AsyncStorage.getItem(SCHEMA_STORAGE_KEY),
          AsyncStorage.getItem(MARKETPLACE_STORAGE_KEY),
          AsyncStorage.getItem(SESSION_STORAGE_KEY),
        ]);

        if (storedVersion !== SCHEMA_VERSION || !storedState) {
          await AsyncStorage.multiSet([
            [SCHEMA_STORAGE_KEY, SCHEMA_VERSION],
            [MARKETPLACE_STORAGE_KEY, JSON.stringify(seedState)],
          ]);
          setMarketplace(seedState);
          setSignedProviderId(null);
        } else {
          setMarketplace(JSON.parse(storedState));
          setSignedProviderId(storedSession || null);
        }
      } catch (error) {
        console.log('Erro ao hidratar marketplace:', error);
        setMarketplace(seedState);
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, []);

  useEffect(() => {
    if (loading) return;

    persistMarketplaceState(marketplace).catch((error) => {
      console.log('Erro ao salvar marketplace:', error);
    });
  }, [marketplace, loading]);

  useEffect(() => {
    if (loading) return;

    if (signedProviderId) {
      AsyncStorage.setItem(SESSION_STORAGE_KEY, signedProviderId).catch(() => undefined);
      return;
    }

    AsyncStorage.removeItem(SESSION_STORAGE_KEY).catch(() => undefined);
  }, [signedProviderId, loading]);

  const currentProvider = useMemo(
    () => marketplace.providers.find((provider) => provider.id === signedProviderId) || null,
    [marketplace.providers, signedProviderId],
  );

  const favoriteProviders = useMemo(
    () =>
      marketplace.providers.filter((provider) =>
        marketplace.favoriteProviderIds.includes(provider.id),
      ),
    [marketplace.favoriteProviderIds, marketplace.providers],
  );

  const currentProviderLeads = useMemo(() => {
    if (!currentProvider) return [];

    return marketplace.leads
      .filter((lead) => lead.providerId === currentProvider.id)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [currentProvider, marketplace.leads]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          marketplace.providers.flatMap((provider) => [
            ...provider.specialties,
            ...provider.projects.map((project) => project.category),
          ]),
        ),
      ),
    [marketplace.providers],
  );

  const locations = useMemo(
    () => Array.from(new Set(marketplace.providers.map((provider) => provider.location))),
    [marketplace.providers],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const provider = marketplace.providers.find(
        (item) => item.account?.email.toLowerCase() === normalizedEmail,
      );

      if (!provider || provider.account?.password !== password) {
        throw new Error(
          'Email ou senha invalidos. Use videomaker@videomap.local / 123456 para testar.',
        );
      }

      setSignedProviderId(provider.id);
    },
    [marketplace.providers],
  );

  const signOut = useCallback(async () => {
    setSignedProviderId(null);
  }, []);

  const registerProvider = useCallback(
    async (payload: RegisterPayload) => {
      const normalizedEmail = payload.email.trim().toLowerCase();
      const alreadyExists = marketplace.providers.some(
        (provider) => provider.account?.email.toLowerCase() === normalizedEmail,
      );

      if (alreadyExists) {
        throw new Error('Ja existe um videomaker com esse email.');
      }

      const newProvider: ProviderProfile = {
        id: slugId('provider'),
        name: payload.name.trim(),
        headline: 'Videomaker disponivel para novos projetos e colabs.',
        bio: 'Perfil criado agora. Atualize sua descricao, portfolio e contatos para comecar a receber solicitacoes.',
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
        coverImage:
          'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80',
        location: payload.location.trim(),
        experienceLevel: payload.experienceLevel,
        specialties: payload.specialties,
        contact: {
          whatsapp: '',
          email: normalizedEmail,
        },
        startingPrice: 1800,
        responseTime: 'Responde no mesmo dia',
        availabilityLabel: 'Disponivel para novos projetos',
        featuredQuote: 'Cada portfolio comeca com um bom primeiro projeto.',
        accentColor: '#42685b',
        yearsExperience: 1,
        completedProjects: 0,
        satisfactionRate: 96,
        projects: [],
        metrics: {
          profileViews: 0,
          portfolioViews: 0,
        },
        isPro: false,
        account: {
          email: normalizedEmail,
          password: payload.password,
        },
      };

      setMarketplace((current) => ({
        ...current,
        providers: [newProvider, ...current.providers],
      }));
      setSignedProviderId(newProvider.id);
    },
    [marketplace.providers],
  );

  const updateCurrentProvider = useCallback(
    async (payload: Partial<ProviderProfile>) => {
      if (!signedProviderId) return;

      setMarketplace((current) => ({
        ...current,
        providers: current.providers.map((provider) => {
          if (provider.id !== signedProviderId) return provider;

          return {
            ...provider,
            ...payload,
            contact: {
              ...provider.contact,
              ...(payload.contact || {}),
            },
            specialties: payload.specialties || provider.specialties,
            projects: payload.projects || provider.projects,
            metrics: payload.metrics || provider.metrics,
            account: provider.account,
          };
        }),
      }));
    },
    [signedProviderId],
  );

  const upgradeCurrentProviderToPro = useCallback(async () => {
    if (!currentProvider) return;

    await updateCurrentProvider({
      isPro: true,
      featuredQuote: 'Agora com destaque no catalogo e ferramentas extras de studio.',
    });
  }, [currentProvider, updateCurrentProvider]);

  const addProject = useCallback(
    async (payload: NewProjectPayload) => {
      if (!currentProvider) {
        throw new Error('Faca login como videomaker para publicar um portfolio.');
      }

      const project: PortfolioProject = {
        id: slugId('project'),
        providerId: currentProvider.id,
        title: payload.title.trim(),
        category: payload.category.trim(),
        location: payload.location.trim(),
        year: payload.year.trim(),
        coverUrl: payload.coverUrl.trim(),
        videoUrl: payload.videoUrl?.trim() || undefined,
        summary: payload.summary.trim(),
        deliverables: payload.deliverables,
        tags: payload.tags,
        clientName: payload.clientName?.trim() || undefined,
        durationLabel: payload.durationLabel?.trim() || undefined,
      };

      setMarketplace((current) => ({
        ...current,
        providers: current.providers.map((provider) => {
          if (provider.id !== currentProvider.id) return provider;

          return {
            ...provider,
            projects: [project, ...provider.projects],
            completedProjects: provider.completedProjects + 1,
          };
        }),
      }));
    },
    [currentProvider],
  );

  const submitLeadRequest = useCallback(async (payload: LeadPayload) => {
    const lead: LeadRequest = {
      id: slugId('lead'),
      providerId: payload.providerId,
      projectId: payload.projectId,
      clientName: payload.clientName.trim(),
      clientEmail: payload.clientEmail?.trim() || undefined,
      clientPhone: payload.clientPhone?.trim() || undefined,
      eventDate: payload.eventDate || undefined,
      location: payload.location?.trim() || undefined,
      budget: payload.budget?.trim() || undefined,
      brief: payload.brief.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    setMarketplace((current) => ({
      ...current,
      leads: [lead, ...current.leads],
    }));

    return lead;
  }, []);

  const updateLeadStatus = useCallback(async (leadId: string, status: LeadStatus) => {
    setMarketplace((current) => ({
      ...current,
      leads: current.leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
    }));
  }, []);

  const toggleFavorite = useCallback(async (providerId: string) => {
    setMarketplace((current) => {
      const exists = current.favoriteProviderIds.includes(providerId);

      return {
        ...current,
        favoriteProviderIds: exists
          ? current.favoriteProviderIds.filter((id) => id !== providerId)
          : [providerId, ...current.favoriteProviderIds],
      };
    });
  }, []);

  const isFavorite = useCallback(
    (providerId: string) => marketplace.favoriteProviderIds.includes(providerId),
    [marketplace.favoriteProviderIds],
  );

  const getProviderById = useCallback(
    (providerId: string) => marketplace.providers.find((provider) => provider.id === providerId),
    [marketplace.providers],
  );

  const getProjectById = useCallback(
    (providerId: string, projectId: string) =>
      marketplace.providers
        .find((provider) => provider.id === providerId)
        ?.projects.find((project) => project.id === projectId),
    [marketplace.providers],
  );

  const trackProfileView = useCallback(async (providerId: string) => {
    setMarketplace((current) => ({
      ...current,
      providers: current.providers.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              metrics: {
                ...provider.metrics,
                profileViews: provider.metrics.profileViews + 1,
              },
            }
          : provider,
      ),
    }));
  }, []);

  const trackProjectView = useCallback(async (providerId: string, projectId: string) => {
    setMarketplace((current) => ({
      ...current,
      providers: current.providers.map((provider) => {
        if (provider.id !== providerId) return provider;

        const shouldIncrement = provider.projects.some((project) => project.id === projectId);
        if (!shouldIncrement) return provider;

        return {
          ...provider,
          metrics: {
            ...provider.metrics,
            portfolioViews: provider.metrics.portfolioViews + 1,
          },
        };
      }),
    }));
  }, []);

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      loading,
      signedIn: Boolean(currentProvider),
      currentProvider,
      providers: marketplace.providers,
      favoriteProviderIds: marketplace.favoriteProviderIds,
      favoriteProviders,
      leads: marketplace.leads,
      currentProviderLeads,
      categories,
      locations,
      signIn,
      signOut,
      registerProvider,
      updateCurrentProvider,
      upgradeCurrentProviderToPro,
      addProject,
      submitLeadRequest,
      updateLeadStatus,
      toggleFavorite,
      isFavorite,
      getProviderById,
      getProjectById,
      trackProfileView,
      trackProjectView,
    }),
    [
      addProject,
      categories,
      currentProvider,
      currentProviderLeads,
      favoriteProviders,
      getProjectById,
      getProviderById,
      isFavorite,
      loading,
      locations,
      marketplace.favoriteProviderIds,
      marketplace.leads,
      marketplace.providers,
      registerProvider,
      signIn,
      signOut,
      submitLeadRequest,
      toggleFavorite,
      trackProfileView,
      trackProjectView,
      updateCurrentProvider,
      updateLeadStatus,
      upgradeCurrentProviderToPro,
    ],
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);

  if (!context) {
    throw new Error('useMarketplace must be used within MarketplaceProvider');
  }

  return context;
}
