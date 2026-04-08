import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const { width, height } = Dimensions.get('window');
const VIDEO_HEIGHT = height * 0.35;

interface Service {
  id: string;
  title: string;
  coverUrl: string;
  videoUrl: string;
  views: number;
  price: number;
  categories?: string[];
}

interface Provider {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  city?: string;
  whatsapp?: string;
}

export default function ProfileScreen({ route, navigation }: any) {
  const { providerId } = route.params;
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Todos');
  const [availableTabs, setAvailableTabs] = useState<string[]>(['Todos']);

  useEffect(() => {
    loadProfile();
  }, [providerId]);

  async function loadProfile() {
    try {
      // Buscar serviços do provider
      const servicesResponse = await api.get(`/services/provider/${providerId}`);
      setServices(servicesResponse.data);

      // Extrair categorias únicas dos serviços
      const allCategories = new Set<string>();
      servicesResponse.data.forEach((service: Service) => {
        if (service.categories) {
          service.categories.forEach((cat: string) => allCategories.add(cat));
        }
      });
      
      const tabs = ['Todos', ...Array.from(allCategories)];
      setAvailableTabs(tabs);

      // Se tiver pelo menos um serviço, pegar info do provider
      if (servicesResponse.data.length > 0) {
        setProvider(servicesResponse.data[0].provider);
      } else {
        // Se não tiver serviços, buscar dados do usuário
        const userResponse = await api.get(`/users/${providerId}`);
        setProvider(userResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  }

  function getFilteredServices() {
    if (activeTab === 'Todos') return services;
    return services.filter(s => s.categories && s.categories.includes(activeTab));
  }

  function handleWhatsApp() {
    if (provider?.whatsapp) {
      const phone = provider.whatsapp.replace(/\D/g, '');
      const message = `Olá ${provider.name}, vi seu perfil no VideoMap!`;
      Linking.openURL(`whatsapp://send?phone=55${phone}&text=${encodeURIComponent(message)}`);
    }
  }

  function renderVideoCard(service: Service) {
    return (
      <TouchableOpacity
        key={service.id}
        style={styles.videoCard}
        onPress={() => navigation.navigate('Details', { service })}
      >
        <Image source={{ uri: service.coverUrl }} style={styles.videoCover} />
        <View style={styles.playButton}>
          <Ionicons name="play" size={40} color="#FFF" />
        </View>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{service.title}</Text>
          <View style={styles.videoStats}>
            <View style={styles.statRow}>
              <Ionicons name="eye" size={14} color="#94A3B8" />
              <Text style={styles.statText}>{service.views} views</Text>
            </View>
            <Text style={styles.videoPrice}>R$ {Number(service.price).toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const filteredServices = getFilteredServices();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>Perfil não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{provider.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Perfil Info */}
        <View style={styles.profileSection}>
          {/* Foto e Info lado a lado (estilo Instagram) */}
          <View style={styles.topRow}>
            <Image
              source={{ uri: provider.avatarUrl || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            
            <View style={styles.infoColumn}>
              <Text style={styles.name}>{provider.name}</Text>
              {provider.city && (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color="#94A3B8" />
                  <Text style={styles.location}>{provider.city}</Text>
                </View>
              )}
              
              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{services.length}</Text>
                  <Text style={styles.statLabel}>Serviços</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{services.reduce((acc, s) => acc + s.views, 0)}</Text>
                  <Text style={styles.statLabel}>Views</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bio */}
          {provider.bio && (
            <Text style={styles.bio}>{provider.bio}</Text>
          )}

          {/* Botão de Orçamento (WhatsApp) */}
          {provider.whatsapp && (
            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={styles.whatsappText}>Solicitar Orçamento</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Abas de Categorias */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {availableTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de Vídeos */}
        <ScrollView style={styles.videosContainer}>
          {filteredServices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="film-outline" size={48} color="#64748B" />
              <Text style={styles.emptyText}>
                {activeTab === 'Todos' 
                  ? 'Nenhum serviço publicado ainda'
                  : `Nenhum vídeo na categoria ${activeTab}`}
              </Text>
            </View>
          ) : (
            filteredServices.map(service => renderVideoCard(service))
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 25,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  location: {
    color: '#94A3B8',
    fontSize: 13,
  },
  bio: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  whatsappText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },
  videosContainer: {
    flex: 1,
    padding: 15,
  },
  videoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  videoCover: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#0F172A',
  },
  playButton: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 15,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  videoPrice: {
    color: '#F97316',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
