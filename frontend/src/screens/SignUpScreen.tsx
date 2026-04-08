import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import api from '../services/api';

export default function SignUpScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'PROVIDER' | 'CLIENT'>('PROVIDER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    whatsapp: '',
  });

  async function handleSignUp() {
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      return Alert.alert('Atenção', 'Preencha os campos obrigatórios!');
    }

    setLoading(true);
    try {
      await api.post('/users', {
        ...formData,
        role: userType
      });

      Alert.alert('Sucesso!', 'Conta criada. Faça login agora.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Não foi possível cadastrar.';
      Alert.alert('Erro', Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Escolha o tipo de conta e comece agora</Text>

        {/* Seletor de Tipo de Usuário */}
        <View style={styles.userTypeContainer}>
          <TouchableOpacity 
            style={[styles.userTypeButton, userType === 'PROVIDER' && styles.userTypeButtonActive]}
            onPress={() => setUserType('PROVIDER')}
          >
            <Text style={[styles.userTypeEmoji, userType === 'PROVIDER' && styles.userTypeEmojiActive]}>🎥</Text>
            <Text style={[styles.userTypeText, userType === 'PROVIDER' && styles.userTypeTextActive]}>
              Videomaker
            </Text>
            <Text style={styles.userTypeSubtext}>Quero vender serviços</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.userTypeButton, userType === 'CLIENT' && styles.userTypeButtonActive]}
            onPress={() => setUserType('CLIENT')}
          >
            <Text style={[styles.userTypeEmoji, userType === 'CLIENT' && styles.userTypeEmojiActive]}>👤</Text>
            <Text style={[styles.userTypeText, userType === 'CLIENT' && styles.userTypeTextActive]}>
              Cliente
            </Text>
            <Text style={styles.userTypeSubtext}>Quero contratar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>NOME COMPLETO</Text>
        <TextInput style={styles.input} placeholderTextColor="#64748B" placeholder="Ex: João Silva" 
            value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />

        <Text style={styles.label}>E-MAIL</Text>
        <TextInput style={styles.input} placeholderTextColor="#64748B" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none"
            value={formData.email} onChangeText={t => setFormData({...formData, email: t})} />

        <Text style={styles.label}>CPF (Apenas números)</Text>
        <TextInput style={styles.input} placeholderTextColor="#64748B" placeholder="00000000000" keyboardType="numeric"
            value={formData.cpf} onChangeText={t => setFormData({...formData, cpf: t})} />

        <Text style={styles.label}>WHATSAPP</Text>
        <TextInput style={styles.input} placeholderTextColor="#64748B" placeholder="11999999999" keyboardType="phone-pad"
            value={formData.whatsapp} onChangeText={t => setFormData({...formData, whatsapp: t})} />

        <Text style={styles.label}>SENHA</Text>
        <TextInput style={styles.input} placeholderTextColor="#64748B" placeholder="******" secureTextEntry
            value={formData.password} onChangeText={t => setFormData({...formData, password: t})} />

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>CADASTRAR</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Voltar para Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC' },
  subtitle: { color: '#94A3B8', marginBottom: 30 },
  
  // Seletor de tipo de usuário
  userTypeContainer: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 25 
  },
  userTypeButton: { 
    flex: 1, 
    backgroundColor: '#1E293B', 
    padding: 20, 
    borderRadius: 12, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155'
  },
  userTypeButtonActive: { 
    backgroundColor: '#F97316', 
    borderColor: '#F97316' 
  },
  userTypeEmoji: { 
    fontSize: 32, 
    marginBottom: 8,
    opacity: 0.6
  },
  userTypeEmojiActive: {
    opacity: 1
  },
  userTypeText: { 
    color: '#94A3B8', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  userTypeTextActive: { 
    color: '#FFF' 
  },
  userTypeSubtext: { 
    color: '#64748B', 
    fontSize: 11, 
    marginTop: 4 
  },
  
  label: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 6, marginTop: 15 },
  input: { backgroundColor: '#1E293B', color: '#FFF', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  button: { backgroundColor: '#F97316', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  backButton: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#94A3B8' }
});