import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const VIDEO_MAP_REMINDER_KEY = '@VideoMap:lembretes:ativos';

export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F97316',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.easConfig?.projectId ?? (Constants.expoConfig as any)?.extra?.eas?.projectId;

  try {
    const tokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
    return tokenResponse.data;
  } catch (error) {
    console.log('Falha ao obter Expo Push Token:', error);
    return null;
  }
}

export async function lembretesVideomapAtivos() {
  const value = await AsyncStorage.getItem(VIDEO_MAP_REMINDER_KEY);
  return value === 'true';
}

export async function desativarLembretesVideomap() {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(VIDEO_MAP_REMINDER_KEY, 'false');
}

export async function ativarLembretesVideomap(nome?: string) {
  if (Platform.OS === 'web') return false;

  const permission = await registerForPushNotificationsAsync();
  if (!permission) {
    return false;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const body = nome
    ? `${nome}, volte ao VideoMap para atualizar seu perfil e responder suas propostas.`
    : 'Volte ao VideoMap para atualizar seu perfil, publicar novos videos e responder suas propostas.';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📣 VideoMap quer ver seu perfil em movimento',
      body,
      sound: true,
    },
    trigger: {
      hour: 10,
      minute: 0,
      repeats: true,
    } as any,
  });

  await AsyncStorage.setItem(VIDEO_MAP_REMINDER_KEY, 'true');
  return true;
}
