import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '../components/common/AppScreen';
import { FilterChip } from '../components/common/FilterChip';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors, shadows } from '../theme/tokens';
import { pickImageFromDevice, pickVideoFromDevice } from '../utils/deviceMedia';
import { parseList } from '../utils/format';

export default function NewServiceScreen({ navigation }: any) {
  const { addProject, categories, signedIn } = useMarketplace();
  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    year: String(new Date().getFullYear()),
    summary: '',
    deliverables: '',
    tags: '',
    clientName: '',
    durationLabel: '',
  });
  const [coverUri, setCoverUri] = useState('');
  const [videoUri, setVideoUri] = useState('');
  const [videoLabel, setVideoLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [pickerError, setPickerError] = useState('');

  const categoryOptions = useMemo(
    () => [...categories].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [categories],
  );

  const canSave = useMemo(
    () => form.title.trim() && form.category.trim() && coverUri.trim() && form.summary.trim(),
    [coverUri, form.category, form.summary, form.title],
  );

  useEffect(() => {
    if (!signedIn) {
      navigation.replace('Login');
    }
  }, [navigation, signedIn]);

  async function handlePickCover() {
    setPickerError('');
    try {
      const asset = await pickImageFromDevice();
      if (!asset) return;
      setCoverUri(asset.uri);
    } catch (error: any) {
      setPickerError(error.message || 'Nao foi possivel selecionar a imagem.');
    }
  }

  async function handlePickVideo() {
    setPickerError('');
    try {
      const asset = await pickVideoFromDevice();
      if (!asset) return;
      setVideoUri(asset.uri);
      setVideoLabel(asset.fileName || 'Video selecionado do dispositivo');
    } catch (error: any) {
      setPickerError(error.message || 'Nao foi possivel selecionar o video.');
    }
  }

  async function handlePublish() {
    if (!canSave) return;
    setSaving(true);
    await addProject({
      title: form.title,
      category: form.category,
      location: form.location,
      year: form.year,
      coverUrl: coverUri,
      videoUrl: videoUri || undefined,
      summary: form.summary,
      deliverables: parseList(form.deliverables),
      tags: parseList(form.tags),
      clientName: form.clientName,
      durationLabel: form.durationLabel,
    });
    setSaving(false);
    navigation.goBack();
  }

  if (!signedIn) return null;

  return (
    <AppScreen scroll>
      <ScreenHeader title="Novo projeto" subtitle="Suba capa e video direto do dispositivo." onBack={() => navigation.goBack()} />

      <View style={styles.card}>
        <Text style={styles.label}>Titulo do projeto</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(title) => setForm((current) => ({ ...current, title }))}
          placeholder="Ex: Fashion film de colecao"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroller}>
          <View style={styles.categoryRow}>
            {categoryOptions.map((item) => (
              <FilterChip
                key={item}
                label={item}
                active={form.category === item}
                onPress={() => setForm((current) => ({ ...current, category: item }))}
              />
            ))}
          </View>
        </ScrollView>

        <Text style={styles.label}>Cidade</Text>
        <TextInput
          style={styles.input}
          value={form.location}
          onChangeText={(location) => setForm((current) => ({ ...current, location }))}
          placeholder="Ex: Sao Paulo, SP"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Ano</Text>
        <TextInput
          style={styles.input}
          value={form.year}
          onChangeText={(year) => setForm((current) => ({ ...current, year }))}
          placeholder="2026"
          placeholderTextColor={colors.textSoft}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Capa do projeto</Text>
        <TouchableOpacity style={styles.uploadCard} onPress={handlePickCover} activeOpacity={0.9}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.uploadPreview} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image-outline" size={28} color={colors.accentStrong} />
              <Text style={styles.uploadTitle}>Escolher imagem do dispositivo</Text>
              <Text style={styles.uploadText}>Nada de URL. A capa sai direto da galeria do aparelho.</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Video do projeto</Text>
        <TouchableOpacity style={styles.uploadInlineCard} onPress={handlePickVideo} activeOpacity={0.9}>
          <Ionicons name="videocam-outline" size={24} color={colors.accentStrong} />
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadInlineTitle}>Selecionar video do dispositivo</Text>
            <Text style={styles.uploadInlineText}>{videoLabel || 'Opcional, mas ajuda a deixar o case mais completo.'}</Text>
          </View>
        </TouchableOpacity>

        {pickerError ? <Text style={styles.errorText}>{pickerError}</Text> : null}

        <Text style={styles.label}>Cliente</Text>
        <TextInput
          style={styles.input}
          value={form.clientName}
          onChangeText={(clientName) => setForm((current) => ({ ...current, clientName }))}
          placeholder="Marca, casal ou empresa"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Prazo de entrega</Text>
        <TextInput
          style={styles.input}
          value={form.durationLabel}
          onChangeText={(durationLabel) => setForm((current) => ({ ...current, durationLabel }))}
          placeholder="Ex: entrega em 7 dias"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Entregaveis</Text>
        <TextInput
          style={styles.input}
          value={form.deliverables}
          onChangeText={(deliverables) => setForm((current) => ({ ...current, deliverables }))}
          placeholder="Separe por virgula"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Tags</Text>
        <TextInput
          style={styles.input}
          value={form.tags}
          onChangeText={(tags) => setForm((current) => ({ ...current, tags }))}
          placeholder="Separe por virgula"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Resumo do projeto</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.summary}
          onChangeText={(summary) => setForm((current) => ({ ...current, summary }))}
          multiline
          numberOfLines={7}
          textAlignVertical="top"
          placeholder="Conte o contexto, a direcao e o que foi entregue."
          placeholderTextColor={colors.textSoft}
        />
      </View>

      <TouchableOpacity style={[styles.button, !canSave && styles.buttonDisabled]} onPress={handlePublish} disabled={!canSave || saving}>
        <Text style={styles.buttonText}>{saving ? 'Publicando...' : 'Publicar projeto'}</Text>
      </TouchableOpacity>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...shadows.card,
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
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
  },
  categoryScroller: {
    marginBottom: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  uploadCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  uploadPreview: {
    width: '100%',
    height: 220,
  },
  uploadPlaceholder: {
    paddingHorizontal: 18,
    paddingVertical: 28,
    alignItems: 'center',
  },
  uploadTitle: {
    marginTop: 12,
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  uploadText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  uploadInlineCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  uploadInlineTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  uploadInlineText: {
    marginTop: 4,
    color: colors.textMuted,
    lineHeight: 18,
  },
  errorText: {
    marginTop: 10,
    color: colors.danger,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 160,
  },
  button: {
    marginTop: 20,
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: colors.accentStrong,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '800',
  },
});
