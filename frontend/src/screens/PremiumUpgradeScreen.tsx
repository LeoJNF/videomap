import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function PremiumUpgradeScreen({ navigation }: any) {
  const features = [
    {
      icon: 'diamond',
      title: 'Badge Premium',
      description: 'Destaque visual em todos os seus serviços',
      color: '#F97316',
    },
    {
      icon: 'trending-up',
      title: 'Prioridade nos Resultados',
      description: 'Apareça no topo das buscas',
      color: '#10B981',
    },
    {
      icon: 'analytics',
      title: 'Analytics Profissional',
      description: 'Gráficos de desempenho e métricas detalhadas',
      color: '#3B82F6',
    },
    {
      icon: 'briefcase',
      title: 'Sistema de Orçamentos',
      description: 'Receba solicitações direto pelo app',
      color: '#8B5CF6',
    },
    {
      icon: 'push',
      title: 'Pin de Serviços',
      description: 'Fixe até 3 serviços no topo do seu perfil',
      color: '#F59E0B',
    },
    {
      icon: 'infinite',
      title: 'Serviços Ilimitados',
      description: 'Publique quantos serviços quiser',
      color: '#EF4444',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Ionicons name="diamond" size={28} color="#F97316" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <Ionicons name="diamond" size={64} color="#F97316" />
          </View>
          <Text style={styles.title}>Torne-se Premium</Text>
          <Text style={styles.subtitle}>
            Potencialize seus resultados e receba 4x mais orçamentos
          </Text>
        </View>

        <View style={styles.pricing}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Por apenas</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>R$</Text>
              <Text style={styles.price}>39</Text>
              <View>
                <Text style={styles.cents}>,90</Text>
                <Text style={styles.period}>/mês</Text>
              </View>
            </View>
            <Text style={styles.savings}>Economize R$ 180 em custos de marketing</Text>
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>O que você ganha:</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon as any} size={24} color={feature.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
          ))}
        </View>

        <View style={styles.stats}>
          <Text style={styles.statsTitle}>Resultados Comprovados:</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>4x</Text>
              <Text style={styles.statLabel}>Mais Orçamentos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>60%</Text>
              <Text style={styles.statLabel}>Mais Visualizações</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Taxa de Satisfação</Text>
            </View>
          </View>
        </View>

        <View style={styles.cta}>
          <TouchableOpacity style={styles.subscribeButton}>
            <Ionicons name="diamond" size={24} color="#FFF" />
            <Text style={styles.subscribeButtonText}>Assinar Premium Agora</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            Cancele quando quiser. Sem taxas adicionais.
          </Text>
        </View>
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
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pricing: {
    alignItems: 'center',
    marginBottom: 32,
  },
  priceBox: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F97316',
    width: '100%',
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  currency: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  price: {
    color: '#F97316',
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 64,
  },
  cents: {
    color: '#F97316',
    fontSize: 24,
    fontWeight: 'bold',
  },
  period: {
    color: '#94A3B8',
    fontSize: 14,
  },
  savings: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  features: {
    marginBottom: 32,
  },
  featuresTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  featureDescription: {
    color: '#94A3B8',
    fontSize: 13,
  },
  stats: {
    marginBottom: 32,
  },
  statsTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    color: '#F97316',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  cta: {
    alignItems: 'center',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F97316',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    marginBottom: 12,
    elevation: 8,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  subscribeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
});
