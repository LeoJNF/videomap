import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppScreen } from '../components/common/AppScreen';
import { EmptyState } from '../components/common/EmptyState';
import { FilterChip } from '../components/common/FilterChip';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors, shadows } from '../theme/tokens';
import { formatDateTime } from '../utils/format';

const categorias = [
  { label: 'Produto', value: 'produto' },
  { label: 'Pagamento', value: 'pagamento' },
  { label: 'Notificacao', value: 'notificacao' },
  { label: 'Outro', value: 'outro' },
] as const;

export default function SuggestionsScreen({ navigation }: any) {
  const { suggestions, submitImprovementSuggestion } = useMarketplace();
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [categoria, setCategoria] = useState<(typeof categorias)[number]['value']>('produto');
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState('');

  const podeEnviar = useMemo(
    () => titulo.trim().length > 2 && mensagem.trim().length > 5,
    [mensagem, titulo],
  );

  async function handleSubmit() {
    if (!podeEnviar) return;
    setSalvando(true);
    setFeedback('');

    try {
      await submitImprovementSuggestion(titulo, mensagem, categoria);
      setTitulo('');
      setMensagem('');
      setFeedback('Sugestao enviada para o time do VideoMap.');
    } catch (error: any) {
      setFeedback(error.message || 'Nao foi possivel enviar a sugestao agora.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppScreen scroll>
      <ScreenHeader
        title="Sugestoes"
        subtitle="Canal aberto para melhorias do VideoMap"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.card}>
        <Text style={styles.title}>O que pode melhorar no app?</Text>
        <Text style={styles.helper}>
          Use este espaco para contar o que falta, o que esta confuso ou o que ajudaria voce a vender melhor no VideoMap.
        </Text>

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.chipsRow}>
          {categorias.map((item) => (
            <FilterChip
              key={item.value}
              label={item.label}
              active={categoria === item.value}
              onPress={() => setCategoria(item.value)}
            />
          ))}
        </View>

        <Text style={styles.label}>Titulo</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ex: Melhorar a area de propostas"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Sugestao</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={mensagem}
          onChangeText={setMensagem}
          placeholder="Descreva a melhoria com o maximo de contexto possivel."
          placeholderTextColor={colors.textSoft}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

        <TouchableOpacity
          style={[styles.button, !podeEnviar && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!podeEnviar || salvando}
        >
          <Text style={styles.buttonText}>{salvando ? 'Enviando...' : 'Enviar sugestao'}</Text>
        </TouchableOpacity>
      </View>

      {suggestions.length === 0 ? (
        <EmptyState
          title="Nenhuma sugestao enviada ainda"
          description="Quando voce mandar ideias pelo app, elas ficam listadas aqui para acompanhamento."
        />
      ) : (
        <View style={styles.listWrap}>
          {suggestions.map((item) => (
            <View key={item.id} style={styles.suggestionCard}>
              <View style={styles.suggestionTop}>
                <Text style={styles.suggestionTitle}>{item.title}</Text>
                <Text style={styles.suggestionDate}>{formatDateTime(item.createdAt)}</Text>
              </View>
              <Text style={styles.suggestionCategory}>{item.category}</Text>
              <Text style={styles.suggestionMessage}>{item.message}</Text>
            </View>
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...shadows.card,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  helper: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 21,
  },
  label: {
    marginTop: 18,
    marginBottom: 8,
    color: colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
  },
  textArea: {
    minHeight: 140,
  },
  feedback: {
    marginTop: 12,
    color: colors.accentStrong,
    fontWeight: '700',
  },
  button: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: colors.accentStrong,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '800',
  },
  listWrap: {
    marginTop: 18,
    gap: 12,
    marginBottom: 24,
  },
  suggestionCard: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  suggestionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  suggestionTitle: {
    flex: 1,
    color: colors.text,
    fontWeight: '800',
    fontSize: 17,
  },
  suggestionDate: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionCategory: {
    marginTop: 8,
    color: colors.accentStrong,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  suggestionMessage: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
