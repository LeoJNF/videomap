import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ServiceCard from '../components/ServiceCard';
import api from '../services/api';

export default function AccountScreen({ navigation }: any) {
  const { user, signOut, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites'>('profile');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'favorites') {
        fetchFavorites();
      }
    }, [activeTab])
  );

  async function fetchFavorites() {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data || []);
    } catch (error) {
      console.log('Erro ao buscar favoritos:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFavoriteRemoved(serviceId: string) {
    setFavorites(prev => prev.filter(s => s.id !== serviceId));
  }

  async function handleTogglePremium() {
    if (!user) return;
    
    Alert.alert(
      'Modo Desenvolvedor',
      `${user.isPremium ? 'Desativar' : 'Ativar'} Premium para teste?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const response = await api.put(`/users/${user.id}/toggle-premium`);
              Alert.alert('Sucesso', response.data.message);
              
              // Atualiza o contexto do usuário
              if (updateUser) {
                updateUser(response.data.user);
              }
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível alterar o status premium');
            }
          }
        }
      ]
    );
  }

  async function handleTestPush() {
    if (!user) return;
    try {
      await api.post('/notifications/test', {
        title: 'Teste VideoMap',
        body: 'Se você recebeu isso, o push está funcionando.',
      });
      Alert.alert('Push enviado', 'Se as notificações estiverem permitidas, você deve receber em instantes.');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível enviar o push de teste');
    }
  }

  function requirePremium(action: () => void) {
    if (user?.isPremium) {
      action();
      return;
    }
    Alert.alert(
      'Recurso Premium',
      'Esse recurso é exclusivo do Premium. Deseja ver os benefícios?',
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Ver Premium', onPress: () => navigation.navigate('PremiumUpgrade') },
      ],
    );
  }

  function handleSignOut() {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() }
    ]);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons name="person" size={20} color={activeTab === 'profile' ? '#FFF' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Ionicons name="heart" size={20} color={activeTab === 'favorites' ? '#FFF' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>Favoritos</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profile' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
              </View>
            )}
            <Text style={styles.name}>{user?.name || 'Visitante'}</Text>
            <Text style={styles.email}>{user?.email || 'Faça login'}</Text>
            
            {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
            
            {user?.city && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="#94A3B8" />
                <Text style={styles.location}>{user.city}</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="create-outline" size={18} color="#FFF" />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>

            {/* Botão DEV: Toggle Premium (somente desenvolvimento) */}
            {__DEV__ && user?.role === 'PROVIDER' && (
              <TouchableOpacity 
                style={[styles.devButton, user?.isPremium && styles.devButtonActive]} 
                onPress={handleTogglePremium}
                onLongPress={handleTogglePremium}
              >
                <Ionicons 
                  name={user?.isPremium ? "diamond" : "diamond-outline"} 
                  size={16} 
                  color={user?.isPremium ? "#F97316" : "#64748B"} 
                />
                <Text style={styles.devButtonText}>
                  DEV: {user?.isPremium ? 'Desativar' : 'Ativar'} Premium
                </Text>
              </TouchableOpacity>
            )}

            {/* Botão DEV: Testar Push */}
            {__DEV__ && !!user && (
              <TouchableOpacity style={styles.devButton} onPress={handleTestPush}>
                <Ionicons name="notifications-outline" size={16} color="#64748B" />
                <Text style={styles.devButtonText}>DEV: Testar Push</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Premium Badge (if user is premium) */}
          {user?.isPremium && (
            <View style={styles.premiumBanner}>
              <Ionicons name="diamond" size={24} color="#F97316" />
              <Text style={styles.premiumBannerText}>Você é Premium!</Text>
            </View>
          )}

          {/* Provider Menu */}
          {user?.role === 'PROVIDER' && (
            <View style={styles.menu}>
              {!user?.isPremium && (
                <TouchableOpacity 
                  style={[styles.menuItem, styles.premiumMenuItem]} 
                  onPress={() => navigation.navigate('PremiumUpgrade')}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="diamond" size={22} color="#F97316" />
                    <Text style={styles.menuItemText}>Torne-se Premium</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => requirePremium(() => navigation.navigate('AnalyticsDashboard'))}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="analytics" size={22} color="#3B82F6" />
                  <Text style={styles.menuItemText}>Analytics</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => requirePremium(() => navigation.navigate('LeadsManagement'))}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="briefcase" size={22} color="#8B5CF6" />
                  <Text style={styles.menuItemText}>Orçamentos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.menu}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.favoritesContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 50 }} />
          ) : favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color="#334155" />
              <Text style={styles.emptyText}>Nenhum favorito ainda</Text>
              <Text style={styles.emptySubtext}>Adicione serviços aos favoritos para vê-los aqui</Text>
            </View>
          ) : (
            <FlatList
              data={favorites}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ServiceCard
                  data={item}
                  onPress={() => navigation.navigate('Details', { service: item })}
                  isFavorited={true}
                  onFavoriteChange={(isFav) => {
                    if (!isFav) handleFavoriteRemoved(item.id);
                  }}
                />
              )}
              contentContainerStyle={styles.favoritesList}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },
  
  scrollContent: {
    padding: 20,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#F97316',
    marginBottom: 16,
  },
  avatarContainer: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#F97316', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  avatarText: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  email: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  bio: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  location: {
    color: '#94A3B8',
    fontSize: 13,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 12,
  },
  devButtonActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: '#F97316',
  },
  devButtonText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F97316',
    marginBottom: 20,
  },
  premiumBannerText: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menu: { gap: 12, marginBottom: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  premiumMenuItem: {
    borderColor: '#F97316',
    borderWidth: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: { 
    color: '#EF4444', 
    fontSize: 16,
    fontWeight: 'bold' 
  },
  
  favoritesContainer: {
    flex: 1,
  },
  favoritesList: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyText: {
    color: '#CBD5E1',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});