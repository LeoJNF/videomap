import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      return Alert.alert('Atenção', 'Preencha todos os campos');
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>VIDEOMAP</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-MAIL</Text>
        <TextInput 
          style={styles.input}
          placeholder="exemplo@email.com"
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>SENHA</Text>
        <TextInput 
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#64748B"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>ENTRAR</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.footerText}>Não tem conta? <Text style={styles.linkBold}>Crie agora</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#F8FAFC', letterSpacing: 2 },
  subtitle: { color: '#94A3B8', marginTop: 5 },
  form: { width: '100%' },
  label: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 6, marginTop: 15 },
  input: { backgroundColor: '#1E293B', color: '#FFF', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  button: { backgroundColor: '#F97316', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  footerLink: { marginTop: 20, alignItems: 'center' },
  footerText: { color: '#94A3B8' },
  linkBold: { color: '#F97316', fontWeight: 'bold' }
});