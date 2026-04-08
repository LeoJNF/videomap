import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import api from '../services/api';

export default function AnalyticsDashboardScreen({ navigation }: any) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    try {
      const response = await api.get(`/analytics/provider?days=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.log('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchAnalytics();
  }

  const periods = [
    { label: '7 dias', value: 7 },
    { label: '30 dias', value: 30 },
    { label: '90 dias', value: 90 },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Ionicons name="stats-chart" size={24} color="#F97316" />
      </View>

      <View style={styles.periodSelector}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.periodButton, period === p.value && styles.periodButtonActive]}
            onPress={() => setPeriod(p.value)}
          >
            <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />
        }
      >
        {/* Services Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="film" size={32} color="#F97316" />
              <Text style={styles.statValue}>{analytics?.services?.total || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              <Text style={styles.statValue}>{analytics?.services?.active || 0}</Text>
              <Text style={styles.statLabel}>Ativos</Text>
            </View>
          </View>
        </View>

        {/* Engagement Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engajamento</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="eye" size={24} color="#3B82F6" />
              <Text style={styles.statBoxValue}>{analytics?.engagement?.totalViews || 0}</Text>
              <Text style={styles.statBoxLabel}>Visualizações</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="logo-whatsapp" size={24} color="#10B981" />
              <Text style={styles.statBoxValue}>{analytics?.engagement?.totalWhatsappClicks || 0}</Text>
              <Text style={styles.statBoxLabel}>Cliques WhatsApp</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="trending-up" size={24} color="#F59E0B" />
              <Text style={styles.statBoxValue}>{analytics?.engagement?.conversionRate || 0}%</Text>
              <Text style={styles.statBoxLabel}>Taxa Conversão</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="heart" size={24} color="#EF4444" />
              <Text style={styles.statBoxValue}>{analytics?.engagement?.totalFavorites || 0}</Text>
              <Text style={styles.statBoxLabel}>Favoritos</Text>
            </View>
          </View>
        </View>

        {/* Leads Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orçamentos</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { flex: 1.5 }]}>
              <Ionicons name="briefcase" size={32} color="#F97316" />
              <Text style={styles.statValue}>{analytics?.leads?.total || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={32} color="#F59E0B" />
              <Text style={styles.statValue}>{analytics?.leads?.pending || 0}</Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-done" size={32} color="#10B981" />
              <Text style={styles.statValue}>{analytics?.leads?.completed || 0}</Text>
              <Text style={styles.statLabel}>Concluídos</Text>
            </View>
          </View>
          
          <View style={styles.budgetCard}>
            <Text style={styles.budgetLabel}>Orçamento Total Recebido</Text>
            <Text style={styles.budgetValue}>R$ {analytics?.leads?.totalBudget?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        {/* Reviews Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="star" size={32} color="#F59E0B" />
              <Text style={styles.statValue}>{analytics?.reviews?.averageRating || '0.0'}</Text>
              <Text style={styles.statLabel}>Média</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="chatbox" size={32} color="#8B5CF6" />
              <Text style={styles.statValue}>{analytics?.reviews?.total || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Top Services */}
        {analytics?.topServices && analytics.topServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Serviços</Text>
            {analytics.topServices.map((service: any, index: number) => (
              <View key={service.id} style={styles.topServiceCard}>
                <View style={styles.topServiceRank}>
                  <Text style={styles.topServiceRankText}>{index + 1}</Text>
                </View>
                <View style={styles.topServiceInfo}>
                  <Text style={styles.topServiceTitle} numberOfLines={1}>{service.title}</Text>
                  <View style={styles.topServiceStats}>
                    <View style={styles.topServiceStat}>
                      <Ionicons name="eye" size={14} color="#64748B" />
                      <Text style={styles.topServiceStatText}>{service.views}</Text>
                    </View>
                    <View style={styles.topServiceStat}>
                      <Ionicons name="logo-whatsapp" size={14} color="#10B981" />
                      <Text style={styles.topServiceStatText}>{service.whatsappClicks}</Text>
                    </View>
                    <Text style={styles.topServiceConversion}>{service.conversionRate}%</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#1E293B',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#F97316',
  },
  periodText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statBoxValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statBoxLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  budgetCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  budgetLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  budgetValue: {
    color: '#10B981',
    fontSize: 32,
    fontWeight: 'bold',
  },
  topServiceCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  topServiceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topServiceRankText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topServiceInfo: {
    flex: 1,
  },
  topServiceTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  topServiceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topServiceStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topServiceStatText: {
    color: '#64748B',
    fontSize: 12,
  },
  topServiceConversion: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
