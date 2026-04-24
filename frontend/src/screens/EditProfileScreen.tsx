import React, { useMemo, useState } from 'react';
import {
  Image,
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
import { experienceLevels } from '../types/marketplace';
import { pickImageFromDevice } from '../utils/deviceMedia';
import { parseList } from '../utils/format';

export default function EditProfileScreen({ navigation }: any) {
  const { currentProvider, updateCurrentProvider } = useMarketplace();

  const [form, setForm] = useState(() => ({
    name: currentProvider?.name || '',
    headline: currentProvider?.headline || '',
    bio: currentProvider?.bio || '',
    location: currentProvider?.location || '',
    experienceLevel: currentProvider?.experienceLevel || 'Iniciante',
    specialties: currentProvider?.specialties.join(', ') || '',
    avatarUrl: currentProvider?.avatarUrl || '',
    whatsapp: currentProvider?.contact.whatsapp || '',
    instagram: currentProvider?.contact.instagram || '',
    website: currentProvider?.contact.website || '',
    email: currentProvider?.contact.email || '',
    startingPrice: String(currentProvider?.startingPrice || ''),
    responseTime: currentProvider?.responseTime || '',
    availabilityLabel: currentProvider?.availabilityLabel || '',
    featuredQuote: currentProvider?.featuredQuote || '',
  }));
  const [saving, setSaving] = useState(false);
  const [pickerError, setPickerError] = useState('');

  const canSave = useMemo(
    () => form.name.trim() && form.headline.trim() && form.location.trim(),
    [form.headline, form.location, form.name],
  );

  if (!currentProvider) {
    return null;
  }

  const startingPriceFallback = currentProvider.startingPrice;

  async function handlePickAvatar() {
    setPickerError('');
    try {
      const asset = await pickImageFromDevice();
      if (!asset) return;
      setForm((current) => ({ ...current, avatarUrl: asset.uri }));
    } catch (error: any) {
      setPickerError(error.message || 'Nao foi possivel selecionar a foto do perfil.');
    }
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await updateCurrentProvider({
      name: form.name.trim(),
      headline: form.headline.trim(),
      bio: form.bio.trim(),
      location: form.location.trim(),
      experienceLevel: form.experienceLevel,
      specialties: parseList(form.specialties),
      avatarUrl: form.avatarUrl.trim(),
      startingPrice: Number(form.startingPrice || startingPriceFallback),
      responseTime: form.responseTime.trim(),
      availabilityLabel: form.availabilityLabel.trim(),
      featuredQuote: form.featuredQuote.trim(),
      contact: {
        whatsapp: form.whatsapp.trim(),
        instagram: form.instagram.trim(),
        website: form.website.trim(),
        email: form.email.trim(),
      },
    });
    setSaving(false);
    navigation.goBack();
  }

  return (
    <AppScreen scroll>
      <ScreenHeader
        title="Editar perfil"
        subtitle="Foto, nivel e dados publicos do videomaker."
        onBack={() => navigation.goBack()}
      />
      <View style={styles.card}>
        <Text style={styles.label}>Foto do perfil</Text>
        <View style={styles.mediaRow}>
          <Image source={{ uri: form.avatarUrl }} style={styles.avatarPreview} />
          <TouchableOpacity style={styles.mediaButton} onPress={handlePickAvatar}>
            <Ionicons name="image-outline" size={18} color={colors.accentStrong} />
            <Text style={styles.mediaButtonTitle}>Trocar foto</Text>
            <Text style={styles.mediaButtonText}>Selecionar imagem do dispositivo</Text>
          </TouchableOpacity>
        </View>

        {pickerError ? <Text style={styles.errorText}>{pickerError}</Text> : null}

        <Text style={styles.label}>Nivel exibido na busca</Text>
        <View style={styles.levelRow}>
          {experienceLevels.map((item) => (
            <FilterChip
              key={item}
              label={item}
              active={form.experienceLevel === item}
              onPress={() => setForm((current) => ({ ...current, experienceLevel: item }))}
            />
          ))}
        </View>

        {[
          ['Nome', 'name'],
          ['Headline', 'headline'],
          ['Cidade base', 'location'],
          ['WhatsApp', 'whatsapp'],
          ['Instagram', 'instagram'],
          ['Website', 'website'],
          ['Email publico', 'email'],
          ['Preco inicial', 'startingPrice'],
          ['Tempo de resposta', 'responseTime'],
          ['Disponibilidade', 'availabilityLabel'],
          ['Frase destaque', 'featuredQuote'],
          ['Especialidades (separe por virgula)', 'specialties'],
        ].map(([label, key]) => (
          <View key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={(form as any)[key]}
              onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))}
              placeholderTextColor={colors.textSoft}
            />
          </View>
        ))}

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.bio}
          onChangeText={(bio) => setForm((current) => ({ ...current, bio }))}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholderTextColor={colors.textSoft}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, !canSave && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={!canSave || saving}
      >
        <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Salvar alteracoes'}</Text>
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
  mediaRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatarPreview: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.surfaceStrong,
  },
  mediaButton: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    gap: 6,
  },
  mediaButtonTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  mediaButtonText: {
    color: colors.textMuted,
    lineHeight: 18,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  errorText: {
    marginTop: 10,
    color: colors.danger,
    fontWeight: '700',
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
    minHeight: 130,
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
