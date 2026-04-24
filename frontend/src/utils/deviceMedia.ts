import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

async function ensureMediaLibraryPermission() {
  if (Platform.OS === 'web') return true;

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.granted;
}

export async function pickImageFromDevice() {
  const granted = await ensureMediaLibraryPermission();
  if (!granted) {
    throw new Error('Permita o acesso a galeria para escolher uma imagem do dispositivo.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  return result.assets[0];
}

export async function pickVideoFromDevice() {
  const granted = await ensureMediaLibraryPermission();
  if (!granted) {
    throw new Error('Permita o acesso a galeria para escolher um video do dispositivo.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    quality: 1,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  return result.assets[0];
}
