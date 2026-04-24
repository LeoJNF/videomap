import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppScreen } from '../components/common/AppScreen';
import { FilterChip } from '../components/common/FilterChip';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors, shadows } from '../theme/tokens';
import { experienceLevels, ExperienceLevel } from '../types/marketplace';
import { parseList } from '../utils/format';

const defaultSpecialties = ['Casamentos', 'Brand Content', 'Eventos Corporativos', 'Fashion Films', 'Documentarios'];

export default function SignUpScreen({ navigation }: any) {
  const { registerProvider } = useMarketplace();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    experienceLevel: 'Iniciante' as ExperienceLevel,
    specialties: [] as string[],
    customSpecialties: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleSpecialty(label: string) {
    setForm((current) => ({
      ...current,
      specialties: current.specialties.includes(label)
        ? current.specialties.filter((item) => item !== label)
        : [...current.specialties, label],
    }));
  }

  async function handleRegister() {
    setLoading(true);
    setError('');

    try {
      const specialties = Array.from(
        new Set([...form.specialties, ...parseList(form.customSpecialties)]),
      );

      await registerProvider({
        name: form.name,
        email: form.email,
        password: form.password,
        location: form.location,
        specialties,
        experienceLevel: form.experienceLevel,
      });
      navigation.replace('Main');
    } catch (err: any) {
      setError(err.message || 'Nao foi possivel criar o perfil.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll>
      <ScreenHeader title="Criar perfil" subtitle="Cadastro do videomaker, nao do cliente." onBack={() => navigation.goBack()} />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Novo studio</Text>
        <Text style={styles.title}>Monte um perfil profissional pronto para ser encontrado por clientes.</Text>

        <Text style={styles.label}>Nome do studio ou videomaker</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(name) => setForm((current) => ({ ...current, name }))}
          placeholder="Ex: Marina Rocha Films"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Email de acesso</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(email) => setForm((current) => ({ ...current, email }))}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="voce@studio.com"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={form.password}
          onChangeText={(password) => setForm((current) => ({ ...current, password }))}
          secureTextEntry
          placeholder="Crie uma senha"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Cidade base</Text>
        <TextInput
          style={styles.input}
          value={form.location}
          onChangeText={(location) => setForm((current) => ({ ...current, location }))}
          placeholder="Ex: Sao Paulo, SP"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Nivel exibido na busca</Text>
        <View style={styles.chipWrap}>
          {experienceLevels.map((item) => (
            <FilterChip
              key={item}
              label={item}
              active={form.experienceLevel === item}
              onPress={() =>
                setForm((current) => ({ ...current, experienceLevel: item }))
              }
            />
          ))}
        </View>

        <Text style={styles.label}>Especialidades</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={styles.chipRow}>
            {defaultSpecialties.map((item) => (
              <FilterChip
                key={item}
                label={item}
                active={form.specialties.includes(item)}
                onPress={() => toggleSpecialty(item)}
              />
            ))}
          </View>
        </ScrollView>

        <TextInput
          style={styles.input}
          value={form.customSpecialties}
          onChangeText={(customSpecialties) => setForm((current) => ({ ...current, customSpecialties }))}
          placeholder="Adicione outras especialidades separadas por virgula"
          placeholderTextColor={colors.textSoft}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Criando...' : 'Criar perfil profissional'}</Text>
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 22,
    borderRadius: 30,
    padding: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  eyebrow: {
    color: colors.accent,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '900',
  },
  title: {
    marginTop: 10,
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  label: {
    marginTop: 18,
    marginBottom: 8,
    color: colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  chipWrap: {
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
  error: {
    marginTop: 12,
    color: colors.danger,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: colors.accentStrong,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
});

