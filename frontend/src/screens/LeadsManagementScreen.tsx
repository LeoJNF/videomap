import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppScreen } from '../components/common/AppScreen';
import { EmptyState } from '../components/common/EmptyState';
import { FilterChip } from '../components/common/FilterChip';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { SectionTitle } from '../components/common/SectionTitle';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { LeadStatus } from '../types/marketplace';
import { colors } from '../theme/tokens';
import { formatLeadDate } from '../utils/format';

const filters: Array<{ label: string; value: 'all' | LeadStatus }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Novos', value: 'new' },
  { label: 'Contactados', value: 'contacted' },
  { label: 'Proposta', value: 'proposal' },
  { label: 'Fechados', value: 'closed' },
];

export default function LeadsManagementScreen({ navigation }: any) {
  const { currentProviderLeads, updateLeadStatus } = useMarketplace();
  const [filter, setFilter] = useState<'all' | LeadStatus>('all');

  const leads = useMemo(() => {
    if (filter === 'all') return currentProviderLeads;
    return currentProviderLeads.filter((lead) => lead.status === filter);
  }, [currentProviderLeads, filter]);

  return (
    <AppScreen scroll>
      <ScreenHeader title="Leads" subtitle="Organize os briefings que entraram pelo app." onBack={() => navigation.goBack()} />
      <SectionTitle
        eyebrow="Pipeline"
        title="Filtre por etapa"
        description="Mantenha o acompanhamento comercial enxuto e visivel."
      />

      <View style={styles.filters}>
        {filters.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            active={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </View>

      {leads.length === 0 ? (
        <EmptyState
          title="Sem leads nesta etapa"
          description="Assim que clientes enviarem solicitacoes, elas aparecerao aqui com nome, contato e briefing."
        />
      ) : (
        leads.map((lead) => (
          <View key={lead.id} style={styles.card}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{lead.clientName}</Text>
                <Text style={styles.meta}>{formatLeadDate(lead.createdAt)} · {lead.location || 'local a definir'}</Text>
              </View>
              <Text style={styles.status}>{lead.status}</Text>
            </View>

            <Text style={styles.brief}>{lead.brief}</Text>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLine}>{lead.clientPhone || lead.clientEmail || 'Sem contato informado'}</Text>
              {lead.budget ? <Text style={styles.infoLine}>{lead.budget}</Text> : null}
              {lead.eventDate ? <Text style={styles.infoLine}>Data: {lead.eventDate}</Text> : null}
            </View>

            <View style={styles.actions}>
              {(['new', 'contacted', 'proposal', 'closed'] as LeadStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.actionButton, lead.status === status && styles.actionButtonActive]}
                  onPress={() => updateLeadStatus(lead.id, status)}
                >
                  <Text style={[styles.actionButtonText, lead.status === status && styles.actionButtonTextActive]}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
  },
  meta: {
    color: colors.textSoft,
    marginTop: 4,
  },
  status: {
    color: colors.accentStrong,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  brief: {
    marginTop: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  infoBlock: {
    marginTop: 14,
    gap: 4,
  },
  infoLine: {
    color: colors.text,
    fontWeight: '600',
  },
  actions: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
  },
  actionButtonActive: {
    backgroundColor: colors.accentStrong,
  },
  actionButtonText: {
    color: colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  actionButtonTextActive: {
    color: colors.white,
  },
});

