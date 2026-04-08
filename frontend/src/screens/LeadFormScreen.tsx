import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function LeadFormScreen({ route, navigation }: any) {
  const { service } = route.params;
  const { user } = useAuth();
  
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientPhone, setClientPhone] = useState(user?.whatsapp || '');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!clientName || !clientEmail || !message) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, email e mensagem');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/leads/service/${service.id}`, {
        clientName,
        clientEmail,
        clientPhone,
        message,
        budget: budget ? parseFloat(budget) : undefined,
      });

      Alert.alert(
        'Orçamento enviado!',
        'O videomaker receberá sua solicitação e entrará em contato em breve.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.log('Erro ao enviar orçamento:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível enviar o orçamento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitar Orçamento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.serviceProvider}>
            com {service.provider?.name || 'Provider'}
          </Text>
          <Text style={styles.servicePrice}>
            Valor referência: R$ {Number(service.price).toFixed(2)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.form}>
          <Text style={styles.label}>Seu nome *</Text>
          <TextInput
            style={styles.input}
            value={clientName}
            onChangeText={setClientName}
            placeholder="Nome completo"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Seu email *</Text>
          <TextInput
            style={styles.input}
            value={clientEmail}
            onChangeText={setClientEmail}
            placeholder="email@exemplo.com"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Telefone/WhatsApp</Text>
          <TextInput
            style={styles.input}
            value={clientPhone}
            onChangeText={setClientPhone}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#64748B"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Orçamento disponível (opcional)</Text>
          <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            placeholder="0.00"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Descreva seu projeto *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Descreva o que você precisa, quando precisa, e outros detalhes importantes..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Enviar Solicitação</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  serviceInfo: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  serviceTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceProvider: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  servicePrice: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  submitButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
