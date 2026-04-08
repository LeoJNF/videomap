import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import PremiumBadge from './PremiumBadge';

interface ServiceCardProps {
  data: any;
  onPress: () => void;
  isFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

export default function ServiceCard({ data, onPress, isFavorited: initialFavorited = false, onFavoriteChange }: ServiceCardProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  function handleGoToProfile() {
    if (data.provider) {
      navigation.navigate('Profile', { providerId: data.provider.id });
    }
  }

  async function handleToggleFavorite(e: any) {
    e.stopPropagation();
    
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para favoritar serviços');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const newFavoriteState = !isFavorited;

    try {
      if (newFavoriteState) {
        await api.post(`/favorites/${data.id}`);
      } else {
        await api.delete(`/favorites/${data.id}`);
      }
      
      setIsFavorited(newFavoriteState);
      onFavoriteChange?.(newFavoriteState);
    } catch (error: any) {
      console.log('Erro ao favoritar:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível favoritar o serviço');
    } finally {
      setIsLoading(false);
    }
  }

  const defaultCover = 'https://placehold.co/600x400/1E293B/F97316?text=VideoMap';
  const providerName = data.provider?.name || 'Anônimo';
  const providerInitial = providerName.charAt(0).toUpperCase();
  const categories = data.categories || [];
  const categoryDisplay = categories.length > 0 ? categories[0].toUpperCase() : 'GERAL';
  const priceFormatted = Number(data.price || 0).toFixed(2);
  
  // Use coverUrl or extract thumbnail from videoUrl
  const thumbnailUri = data.coverUrl || data.videoUrl || defaultCover;
  
  // Rating display
  const hasRating = data.averageRating && data.reviewCount > 0;

  return (
    <View style={styles.card}>
      
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Image 
          source={{ uri: thumbnailUri }} 
          style={styles.cover}
        />
        
        {/* Play icon overlay for videos */}
        <View style={styles.playIconOverlay}>
          <Ionicons name="play-circle" size={50} color="rgba(249, 115, 22, 0.9)" />
        </View>
        
        {/* Rating badge */}
        {hasRating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{data.averageRating.toFixed(1)}</Text>
          </View>
        )}

        {/* Premium/Verified badge */}
        {(data.provider?.isPremium || data.provider?.isVerified) && (
          <View style={styles.premiumBadgeContainer}>
            <PremiumBadge 
              size="small" 
              verified={data.provider?.isVerified && !data.provider?.isPremium} 
            />
          </View>
        )}
        
        {/* Favorite button */}
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleToggleFavorite}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={28} 
            color={isFavorited ? "#EF4444" : "#FFF"} 
          />
        </TouchableOpacity>
        
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>R$ {priceFormatted}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.category}>{categoryDisplay}</Text>
            <View style={styles.locationContainer}>
               <Ionicons name="location-sharp" size={12} color="#94A3B8" />
               <Text style={styles.location}>{data.location || 'Sem local'}</Text>
            </View>
          </View>
          
          <Text style={styles.title} numberOfLines={2}>{data.title || 'Sem título'}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footer} onPress={handleGoToProfile} activeOpacity={0.7}>
        <View style={styles.providerInfo}>
          <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{providerInitial}</Text>
          </View>
          <View>
            <Text style={styles.providerName}>{providerName}</Text>
            <Text style={styles.viewProfileText}>Ver perfil</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#64748B" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
    }),
  },
  cover: { width: '100%', height: 180 },
  playIconOverlay: {
    position: 'absolute',
    top: 65,
    left: '50%',
    marginLeft: -25,
    zIndex: 1,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    zIndex: 2,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  premiumBadgeContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    zIndex: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  
  priceTag: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#F97316',
  },
  priceText: { color: '#FFF', fontWeight: 'bold' },
  
  content: { padding: 16, paddingBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  category: { color: '#F97316', fontSize: 12, fontWeight: 'bold' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { color: '#94A3B8', fontSize: 12 },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', 
    backgroundColor: '#0F172A',
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1, borderTopColor: '#334155', 
  },
  providerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  providerName: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  viewProfileText: { color: '#94A3B8', fontSize: 11 },
  
  avatarPlaceholder: {
      width: 32, height: 32, borderRadius: 16, backgroundColor: '#F97316',
      justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});