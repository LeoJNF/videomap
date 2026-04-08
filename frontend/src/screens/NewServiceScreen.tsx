import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';

export default function NewServiceScreen({ navigation }: any) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const CATEGORIES = [
    'Eventos',
    'Comércio',
    'Empresas / Corporativo',
    'Residencial',
    'Obras / Construção',
    'Educação',
    'Produção Audiovisual',
  ];

  async function pickVideo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets[0]);
    }
  }

  function toggleCategory(category: string) {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      Alert.alert('Limite atingido', 'Você pode selecionar no máximo 3 categorias');
    }
  }

  async function handlePublish() {
    if (!token) return Alert.alert('Erro', 'Você precisa estar logado');
    if (!title || !price || !location || !selectedVideo || selectedCategories.length === 0) {
      return Alert.alert('Atenção', 'Preencha todos os campos, selecione pelo menos 1 categoria e um vídeo.');
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', title);
      data.append('description', description);
      data.append('price', price.replace(',', '.'));
      data.append('categories', JSON.stringify(selectedCategories));
      data.append('location', location);
      data.append('coverUrl', `https://source.unsplash.com/800x600/?${selectedCategories[0].toLowerCase()},video`);

      let filename = selectedVideo.uri.split('/').pop();
      if (!filename) filename = `video_${Date.now()}.mp4`;

      if (Platform.OS === 'web') {
        const videoResponse = await fetch(selectedVideo.uri);
        const videoBlob = await videoResponse.blob();
        data.append('video', videoBlob, filename);
      } else {
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `video/${match[1]}` : `video/mp4`;
        data.append('video', { uri: selectedVideo.uri, name: filename, type } as any);
      }

      const response = await fetch(`${api.defaults.baseURL}/services`, { 
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      const responseJson = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso! 🚀', 'Anúncio publicado!', [
            { text: 'OK', onPress: () => navigation.navigate('Início') },
        ]);
      } else {
        throw new Error(JSON.stringify(responseJson));
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao enviar vídeo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Novo Anúncio</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.label}>TÍTULO</Text>
        <TextInput style={styles.input} placeholder="Ex: Comercial para TV" placeholderTextColor="#64748B" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>VÍDEO DO SERVIÇO</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
          {selectedVideo ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={24} color="#25D366" />
              <Text style={[styles.uploadText, { color: '#25D366', marginLeft: 10 }]}>Vídeo Selecionado</Text>
            </View>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={30} color="#F97316" />
              <Text style={styles.uploadText}>Toque para selecionar um vídeo</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>PREÇO (R$)</Text>
        <TextInput style={styles.input} placeholder="0,00" keyboardType="numeric" placeholderTextColor="#64748B" value={price} onChangeText={setPrice} />

        <Text style={styles.label}>CATEGORIAS (Escolha até 3)</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategories.includes(cat) && styles.categoryChipActive
              ]}
              onPress={() => toggleCategory(cat)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategories.includes(cat) && styles.categoryChipTextActive
              ]}>
                {cat}
              </Text>
              {selectedCategories.includes(cat) && (
                <Ionicons name="checkmark-circle" size={16} color="#FFF" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>LOCALIZAÇÃO</Text>
        <TextInput style={styles.input} placeholder="Cidade - UF" placeholderTextColor="#64748B" value={location} onChangeText={setLocation} />

        <Text style={styles.label}>DESCRIÇÃO</Text>
        <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Detalhes..." placeholderTextColor="#64748B" value={description} onChangeText={setDescription} />

        <TouchableOpacity style={styles.publishButton} onPress={handlePublish} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.publishText}>PUBLICAR VÍDEO</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  label: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#1E293B', color: '#FFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#334155', fontSize: 16 },
  uploadButton: { backgroundColor: '#1E293B', height: 100, borderRadius: 12, borderWidth: 2, borderColor: '#334155', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  uploadText: { color: '#94A3B8', marginTop: 10, fontWeight: 'bold' },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  categoryChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  publishButton: { backgroundColor: '#F97316', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  publishText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});