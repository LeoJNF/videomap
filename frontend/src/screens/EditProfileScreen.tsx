import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    city: '',
    whatsapp: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const response = await api.get(`/users/${user?.id}`);
      setFormData({
        name: response.data.name || '',
        bio: response.data.bio || '',
        city: response.data.city || '',
        whatsapp: response.data.whatsapp || '',
        avatarUrl: response.data.avatarUrl || '',
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingData(false);
    }
  }

  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria de fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  }

  async function uploadAvatar(uri: string) {
    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      uploadFormData.append('avatar', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await api.post(`/users/${user?.id}/avatar`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({ ...formData, avatarUrl: response.data.avatarUrl });
      await updateUser(response.data);
      Alert.alert('Sucesso!', 'Foto atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', 'Não foi possível fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      return Alert.alert('Atenção', 'O nome é obrigatório!');
    }

    setLoading(true);
    try {
      const response = await api.put(`/users/${user?.id}`, formData);
      
      // Atualizar dados do usuário no contexto
      await updateUser(response.data);
      
      Alert.alert('Sucesso!', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#F97316" />
            ) : (
              <Ionicons name="checkmark" size={28} color="#F97316" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.form}>
          {/* Foto de Perfil */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} disabled={uploadingImage}>
              {formData.avatarUrl ? (
                <Image source={{ uri: formData.avatarUrl }} style={styles.avatarPreview} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#64748B" />
                </View>
              )}
              {uploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#F97316" />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} disabled={uploadingImage} style={styles.changePhotoButton}>
              <Ionicons name="camera" size={16} color="#F97316" />
              <Text style={styles.changePhotoText}>Alterar Foto</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>NOME COMPLETO *</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#64748B"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Text style={styles.label}>BIO</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conte um pouco sobre você e seu trabalho..."
            placeholderTextColor="#64748B"
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>CIDADE/REGIÃO</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: São Paulo, SP"
            placeholderTextColor="#64748B"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
          />

          <Text style={styles.label}>WHATSAPP</Text>
          <TextInput
            style={styles.input}
            placeholder="11999999999"
            placeholderTextColor="#64748B"
            keyboardType="phone-pad"
            value={formData.whatsapp}
            onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#F97316',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    borderWidth: 3,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
});
