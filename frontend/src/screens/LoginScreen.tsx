import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppScreen } from '../components/common/AppScreen';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors, shadows } from '../theme/tokens';

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useMarketplace();
  const [email, setEmail] = useState('videomaker@videomap.local');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      navigation.replace('Main');
    } catch (err: any) {
      setError(err.message || 'Nao foi possivel entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll>
      <ScreenHeader title="Entrar" subtitle="Acesso do videomaker ao studio." onBack={() => navigation.goBack()} />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Acesso profissional</Text>
        <Text style={styles.title}>Entre para editar perfil, publicar portfolio e responder leads.</Text>
        <Text style={styles.helper}>Demo pronta para testar: videomaker@videomap.local / 123456</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="voce@studio.com"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Sua senha"
          placeholderTextColor={colors.textSoft}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Entrando...' : 'Entrar no studio'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.secondaryButtonText}>Criar novo perfil profissional</Text>
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 34,
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
  helper: {
    marginTop: 12,
    color: colors.textMuted,
    lineHeight: 20,
  },
  label: {
    marginTop: 18,
    marginBottom: 8,
    color: colors.text,
    fontWeight: '800',
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
  secondaryButton: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
});

