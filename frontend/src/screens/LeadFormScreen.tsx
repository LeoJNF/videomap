import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '../components/common/AppScreen';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors, shadows } from '../theme/tokens';
import { formatLeadDate } from '../utils/format';

export default function LeadFormScreen({ route, navigation }: any) {
  const { providerId, projectId } = route.params;
  const { getProviderById, getProjectById, submitLeadRequest } = useMarketplace();

  const provider = getProviderById(providerId);
  const project = projectId ? getProjectById(providerId, projectId) : undefined;
  const fallbackProjectId = project?.id || provider?.projects[0]?.id;

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventDate: '',
    location: '',
    budget: '',
    brief: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => form.clientName.trim() && form.brief.trim(),
    [form.brief, form.clientName],
  );

  if (!provider) {
    return (
      <AppScreen scroll>
        <ScreenHeader title="Solicitar projeto" onBack={() => navigation.goBack()} />
        <Text style={styles.fallbackText}>Esse videomaker nao esta mais disponivel.</Text>
      </AppScreen>
    );
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const lead = await submitLeadRequest({
        providerId,
        projectId,
        ...form,
      });
      setSubmittedAt(lead.createdAt);
    } catch (error) {
      console.log('Erro ao criar lead:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedAt) {
    return (
      <AppScreen scroll>
        <ScreenHeader title="Solicitacao enviada" onBack={() => navigation.goBack()} />
        <View style={styles.successCard}>
          <View style={styles.successBadge}>
            <Ionicons name="checkmark" size={28} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Tudo certo. O briefing ja esta com {provider.name}.</Text>
          <Text style={styles.successText}>
            A solicitacao entrou como lead novo e voce ainda pode continuar a conversa pelo WhatsApp se quiser acelerar o contato.
          </Text>
          <View style={styles.successMeta}>
            <Text style={styles.successMetaLabel}>enviado em</Text>
            <Text style={styles.successMetaValue}>{formatLeadDate(submittedAt)}</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Profile', { providerId })}
          >
            <Text style={styles.primaryButtonText}>Voltar ao perfil</Text>
          </TouchableOpacity>
          {fallbackProjectId ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() =>
                navigation.navigate('Details', {
                  providerId,
                  projectId: fallbackProjectId,
                })
              }
            >
              <Text style={styles.secondaryButtonText}>Rever portfolio</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </AppScreen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppScreen scroll>
        <ScreenHeader
          title="Solicitar projeto"
          subtitle="Sem cadastro. So um briefing direto e objetivo."
          onBack={() => navigation.goBack()}
        />

        <View style={styles.providerCard}>
          <Image
            source={{ uri: project?.coverUrl || provider.projects[0]?.coverUrl || provider.avatarUrl }}
            style={styles.providerImage}
          />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerHeadline}>{project?.title || provider.headline}</Text>
            <Text style={styles.providerSub}>{provider.location}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsScroller}>
          <View style={styles.tipsRow}>
            <View style={styles.tipCard}><Text style={styles.tipText}>Conte formato, data e cidade.</Text></View>
            <View style={styles.tipCard}><Text style={styles.tipText}>Se houver verba, informe a faixa.</Text></View>
            <View style={styles.tipCard}><Text style={styles.tipText}>Nao precisa criar conta para enviar.</Text></View>
          </View>
        </ScrollView>

        <View style={styles.formCard}>
          <Text style={styles.label}>Seu nome *</Text>
          <TextInput
            style={styles.input}
            value={form.clientName}
            onChangeText={(clientName) => setForm((current) => ({ ...current, clientName }))}
            placeholder="Como voce quer ser chamado"
            placeholderTextColor={colors.textSoft}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={form.clientEmail}
            onChangeText={(clientEmail) => setForm((current) => ({ ...current, clientEmail }))}
            placeholder="Opcional, mas ajuda no retorno"
            placeholderTextColor={colors.textSoft}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>WhatsApp</Text>
          <TextInput
            style={styles.input}
            value={form.clientPhone}
            onChangeText={(clientPhone) => setForm((current) => ({ ...current, clientPhone }))}
            placeholder="(11) 99999-9999"
            placeholderTextColor={colors.textSoft}
            keyboardType="phone-pad"
          />

          <View style={styles.inlineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Data do projeto</Text>
              <TextInput
                style={styles.input}
                value={form.eventDate}
                onChangeText={(eventDate) => setForm((current) => ({ ...current, eventDate }))}
                placeholder="Ex: 14/09/2026"
                placeholderTextColor={colors.textSoft}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                value={form.location}
                onChangeText={(location) => setForm((current) => ({ ...current, location }))}
                placeholder="Onde acontece?"
                placeholderTextColor={colors.textSoft}
              />
            </View>
          </View>

          <Text style={styles.label}>Faixa de investimento</Text>
          <TextInput
            style={styles.input}
            value={form.budget}
            onChangeText={(budget) => setForm((current) => ({ ...current, budget }))}
            placeholder="Ex: R$ 3.000 a R$ 5.000"
            placeholderTextColor={colors.textSoft}
          />

          <Text style={styles.label}>O que voce precisa *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.brief}
            onChangeText={(brief) => setForm((current) => ({ ...current, brief }))}
            placeholder="Descreva o evento, objetivo do video, referencias, prazo e tudo que ajuda o videomaker a entender o escopo."
            placeholderTextColor={colors.textSoft}
            multiline
            numberOfLines={7}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, (!canSubmit || submitting) && styles.primaryButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.primaryButtonText}>{submitting ? 'Enviando...' : 'Enviar solicitacao'}</Text>
        </TouchableOpacity>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fallbackText: {
    color: colors.textMuted,
    marginTop: 40,
  },
  providerCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  providerImage: {
    width: 90,
    height: 110,
    borderRadius: 20,
  },
  providerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 22,
  },
  providerHeadline: {
    marginTop: 8,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '700',
  },
  providerSub: {
    marginTop: 8,
    color: colors.textMuted,
  },
  tipsScroller: {
    marginTop: 18,
    marginBottom: 18,
  },
  tipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tipCard: {
    width: 180,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.surfaceStrong,
  },
  tipText: {
    color: colors.text,
    lineHeight: 19,
    fontWeight: '600',
  },
  formCard: {
    padding: 18,
    borderRadius: 26,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 14,
    fontSize: 13,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
  },
  textArea: {
    minHeight: 140,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: colors.accentStrong,
    borderRadius: 20,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  successCard: {
    marginTop: 42,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    ...shadows.card,
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
  },
  successTitle: {
    marginTop: 20,
    color: colors.text,
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  successText: {
    marginTop: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  successMeta: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.successSoft,
    flexDirection: 'row',
    gap: 8,
  },
  successMetaLabel: {
    color: colors.success,
    textTransform: 'uppercase',
    fontWeight: '800',
    fontSize: 11,
  },
  successMetaValue: {
    color: colors.success,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontWeight: '800',
  },
});

