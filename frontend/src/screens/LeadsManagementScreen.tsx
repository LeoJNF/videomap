import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import api from '../services/api';

export default function LeadsManagementScreen({ navigation }: any) {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [filter]);

  async function fetchLeads() {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get(`/leads/provider${params}`);
      setLeads(response.data);
    } catch (error) {
      console.log('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await api.get('/leads/provider/stats');
      setStats(response.data);
    } catch (error) {
      console.log('Erro ao buscar stats:', error);
    }
  }

  async function handleUpdateStatus(leadId: string, newStatus: string) {
    try {
      await api.put(`/leads/${leadId}/status`, { status: newStatus });
      fetchLeads();
      fetchStats();
      Alert.alert('Sucesso', 'Status atualizado');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchLeads();
    fetchStats();
  }

  function renderLead({ item }: any) {
    const statusColors: any = {
      pending: '#F59E0B',
      contacted: '#3B82F6',
      accepted: '#10B981',
      rejected: '#EF4444',
      completed: '#8B5CF6',
    };

    const statusLabels: any = {
      pending: 'Pendente',
      contacted: 'Contatado',
      accepted: 'Aceito',
      rejected: 'Recusado',
      completed: 'Concluído',
    };

    return (
      <View style={styles.leadCard}>
        <View style={styles.leadHeader}>
          <View>
            <Text style={styles.leadClient}>{item.clientName}</Text>
            <Text style={styles.leadDate}>
              {new Date(item.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
          </View>
        </View>

        <Text style={styles.leadService}>{item.service?.title}</Text>
        <Text style={styles.leadMessage} numberOfLines={2}>{item.message}</Text>

        {item.budget && (
          <Text style={styles.leadBudget}>Orçamento: R$ {Number(item.budget).toFixed(2)}</Text>
        )}

        <View style={styles.leadContact}>
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={14} color="#94A3B8" />
            <Text style={styles.contactText}>{item.clientEmail}</Text>
          </View>
          {item.clientPhone && (
            <View style={styles.contactItem}>
              <Ionicons name="logo-whatsapp" size={14} color="#10B981" />
              <Text style={styles.contactText}>{item.clientPhone}</Text>
            </View>
          )}
        </View>

        <View style={styles.leadActions}>
          {item.status === 'pending' && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleUpdateStatus(item.id, 'contacted')}
              >
                <Text style={styles.actionButtonText}>Contatar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleUpdateStatus(item.id, 'rejected')}
              >
                <Text style={styles.actionButtonText}>Recusar</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'contacted' && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleUpdateStatus(item.id, 'accepted')}
              >
                <Text style={styles.actionButtonText}>Aceitar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleUpdateStatus(item.id, 'rejected')}
              >
                <Text style={styles.actionButtonText}>Recusar</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'accepted' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleUpdateStatus(item.id, 'completed')}
            >
              <Text style={styles.actionButtonText}>Marcar como Concluído</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'contacted', label: 'Contatados' },
    { key: 'accepted', label: 'Aceitos' },
    { key: 'completed', label: 'Concluídos' },
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
        <Text style={styles.headerTitle}>Orçamentos</Text>
        <View style={{ width: 24 }} />
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.accepted}</Text>
            <Text style={styles.statLabel}>Aceitos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              R$ {stats.totalBudget.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Orçamento Total</Text>
          </View>
        </View>
      )}

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={renderLead}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#64748B" />
            <Text style={styles.emptyText}>Nenhum orçamento encontrado</Text>
          </View>
        }
      />
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    color: '#F97316',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#F97316',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  leadCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadClient: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leadDate: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leadService: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  leadMessage: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 12,
  },
  leadBudget: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  leadContact: {
    gap: 8,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  leadActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  completeButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 16,
  },
});
