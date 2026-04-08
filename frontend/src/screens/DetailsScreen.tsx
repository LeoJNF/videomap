import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Share, Image, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function DetailsScreen({ route, navigation }: any) {
  const { service } = route.params;
  const { user } = useAuth();
  const provider = service.provider || { name: 'Usuário Desconhecido', id: 'deleted' };
  const providerName = provider.name || 'Anônimo';
  const providerInitial = providerName.charAt(0).toUpperCase();
  const videoSource = service.videoUrl;
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [myReview, setMyReview] = useState<any>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const [reviewsRes, statsRes, myReviewRes] = await Promise.all([
        api.get(`/reviews/service/${service.id}`),
        api.get(`/reviews/service/${service.id}/stats`),
        user ? api.get(`/reviews/service/${service.id}/my-review`).catch(() => null) : Promise.resolve(null),
      ]);

      setReviews(reviewsRes.data || []);
      setRatingStats(statsRes.data);
      setMyReview(myReviewRes?.data);
    } catch (error) {
      console.log('Erro ao buscar avaliações:', error);
    } finally {
      setLoadingReviews(false);
    }
  }

  function openReviewModal() {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para avaliar este serviço');
      return;
    }

    if (myReview) {
      setSelectedRating(myReview.rating);
      setReviewComment(myReview.comment || '');
    }
    
    setShowReviewModal(true);
  }

  async function handleSubmitReview() {
    if (!user) return;

    setSubmittingReview(true);

    try {
      if (myReview) {
        await api.put(`/reviews/${myReview.id}`, {
          rating: selectedRating,
          comment: reviewComment,
        });
        Alert.alert('Sucesso', 'Avaliação atualizada!');
      } else {
        await api.post(`/reviews/service/${service.id}`, {
          rating: selectedRating,
          comment: reviewComment,
        });
        Alert.alert('Sucesso', 'Avaliação enviada!');
      }

      setShowReviewModal(false);
      setReviewComment('');
      setSelectedRating(5);
      fetchReviews(); // Reload reviews
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível enviar a avaliação');
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleDeleteReview() {
    if (!myReview) return;

    Alert.alert(
      'Excluir Avaliação',
      'Tem certeza que deseja excluir sua avaliação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/reviews/${myReview.id}`);
              Alert.alert('Sucesso', 'Avaliação excluída');
              setShowReviewModal(false);
              fetchReviews();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a avaliação');
            }
          },
        },
      ]
    );
  }

  async function handleWhatsApp() {
    const phone = provider.whatsapp || '5511999999999';
    const message = `Olá! Vi seu trabalho "${service.title}" no VideoMap e gostaria de conversar!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // Track WhatsApp click
    try {
      await api.post(`/analytics/track/whatsapp/${service.id}`);
    } catch (error) {
      console.log('Erro ao rastrear click:', error);
    }
    
    Linking.openURL(url);
  }

  function handleRequestQuote() {
    navigation.navigate('LeadForm', { service });
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `Confira este trabalho incrível: ${service.title}\n\nPor ${providerName}\nR$ ${Number(service.price || 0).toFixed(2)}`,
        title: service.title
      });
    } catch (error) {
      console.log('Erro ao compartilhar:', error);
    }
  }

  function handleProviderProfile() {
    if (provider.id && provider.id !== 'deleted') {
      navigation.navigate('Profile', { providerId: provider.id });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.videoContainer}>
          {videoSource ? (
            <Video
              style={styles.video}
              source={{ uri: videoSource }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN} 
              isLooping
              shouldPlay={false} 
              onFullscreenUpdate={(event) => {
                setIsVideoFullscreen(event.fullscreenUpdate === 1);
              }}
            />
          ) : (
            <View style={styles.noVideo}>
                <Ionicons name="videocam-off" size={50} color="#334155" />
                <Text style={{color: '#64748B', marginTop: 10}}>Sem vídeo disponível</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title and Price */}
          <View style={styles.topSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{service.title}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="eye" size={16} color="#94A3B8" />
                  <Text style={styles.statText}>{service.views || 0} visualizações</Text>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location-sharp" size={16} color="#94A3B8" />
                  <Text style={styles.location}>{service.location || 'Todo Brasil'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>A partir de</Text>
              <Text style={styles.price}>R$ {Number(service.price || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* Categories */}
          {service.categories && service.categories.length > 0 && (
            <View style={styles.categoriesSection}>
              <View style={styles.categoryChips}>
                {service.categories.map((cat: string, index: number) => (
                  <View key={index} style={styles.categoryChip}>
                    <Text style={styles.categoryText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Sobre o Serviço</Text>
          <Text style={styles.description}>{service.description || 'Sem descrição disponível.'}</Text>

          <View style={styles.divider} />

          {/* Provider Info */}
          <Text style={styles.sectionTitle}>Videomaker</Text>
          
          <TouchableOpacity 
            style={styles.providerCard} 
            onPress={handleProviderProfile}
            activeOpacity={0.7}
          >
            <View style={styles.providerInfo}>
              {provider.avatarUrl ? (
                <Image source={{ uri: provider.avatarUrl }} style={styles.providerAvatar} />
              ) : (
                <View style={styles.providerAvatar}>
                  <Text style={styles.avatarText}>{providerInitial}</Text>
                </View>
              )}
              <View style={styles.providerDetails}>
                <Text style={styles.providerName}>{providerName}</Text>
                {provider.city && (
                  <View style={styles.providerLocationRow}>
                    <Ionicons name="location" size={14} color="#94A3B8" />
                    <Text style={styles.providerCity}>{provider.city}</Text>
                  </View>
                )}
                {provider.bio && (
                  <Text style={styles.providerBio} numberOfLines={2}>{provider.bio}</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Reviews Section */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Avaliações</Text>
            {ratingStats && ratingStats.count > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingBadgeText}>{ratingStats.average.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({ratingStats.count})</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.addReviewButton} onPress={openReviewModal}>
            <Ionicons name={myReview ? "create-outline" : "add-circle-outline"} size={20} color="#F97316" />
            <Text style={styles.addReviewText}>
              {myReview ? 'Editar minha avaliação' : 'Avaliar este serviço'}
            </Text>
          </TouchableOpacity>

          {loadingReviews ? (
            <ActivityIndicator size="small" color="#F97316" style={{ marginTop: 20 }} />
          ) : reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Ionicons name="chatbox-ellipses-outline" size={40} color="#64748B" />
              <Text style={styles.emptyReviewsText}>Nenhuma avaliação ainda</Text>
              <Text style={styles.emptyReviewsSubtext}>Seja o primeiro a avaliar!</Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserInfo}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewUserName}>{review.user?.name || 'Anônimo'}</Text>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= review.rating ? 'star' : 'star-outline'}
                              size={14}
                              color={star <= review.rating ? '#F59E0B' : '#64748B'}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{myReview ? 'Editar Avaliação' : 'Avaliar Serviço'}</Text>
                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                  <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Sua nota</Text>
              <View style={styles.starsSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setSelectedRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= selectedRating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= selectedRating ? '#F59E0B' : '#64748B'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Comentário (opcional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Conte sobre sua experiência..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={4}
                value={reviewComment}
                onChangeText={setReviewComment}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              {myReview && (
                <TouchableOpacity style={styles.deleteReviewButton} onPress={handleDeleteReview}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text style={styles.deleteReviewText}>Excluir</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.submitReviewButton, myReview && { flex: 2 }]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitReviewText}>
                    {myReview ? 'Atualizar' : 'Enviar Avaliação'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Footer with action buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.quoteButton} onPress={handleRequestQuote}>
          <Ionicons name="briefcase-outline" size={22} color="#FFF" />
          <Text style={styles.quoteButtonText}>Solicitar Orçamento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={22} color="#FFF" />
          <Text style={styles.whatsappText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(30, 41, 59, 0.8)' },
  shareButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(30, 41, 59, 0.8)' },
  
  videoContainer: { 
    width: '100%', 
    height: 300, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 0
  },
  video: { width: '100%', height: '100%' },
  noVideo: { alignItems: 'center', justifyContent: 'center', height: '100%' },
  
  content: { padding: 20 },
  
  topSection: {
    marginBottom: 20
  },
  titleContainer: {
    marginBottom: 15
  },
  title: { 
    color: '#F8FAFC', 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 10,
    lineHeight: 36
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statText: {
    color: '#94A3B8',
    fontSize: 14
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4
  },
  location: { 
    color: '#94A3B8', 
    fontSize: 14 
  },
  
  priceContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981'
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4
  },
  price: { 
    color: '#10B981', 
    fontSize: 32, 
    fontWeight: 'bold' 
  },
  
  categoriesSection: {
    marginTop: 20
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryChip: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)'
  },
  categoryText: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '600'
  },
  
  divider: { 
    height: 1, 
    backgroundColor: '#334155', 
    marginVertical: 25 
  },
  
  sectionTitle: { 
    color: '#F8FAFC', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  description: { 
    color: '#CBD5E1', 
    fontSize: 16, 
    lineHeight: 26 
  },
  
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1
  },
  providerAvatar: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#F97316', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { 
    color: '#FFF', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  providerDetails: {
    flex: 1
  },
  providerName: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 4
  },
  providerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4
  },
  providerCity: {
    color: '#94A3B8',
    fontSize: 13
  },
  providerBio: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18
  },
  
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    flexDirection: 'row',
    gap: 10,
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#334155', 
    backgroundColor: '#0F172A' 
  },
  quoteButton: {
    flex: 1,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
  },
  quoteButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  whatsappButton: { 
    flex: 1,
    backgroundColor: '#25D366', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28, 
    gap: 10,
    elevation: 4,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  whatsappText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 15 
  },
  
  // Reviews styles
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingBadgeText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingCount: {
    color: '#94A3B8',
    fontSize: 13,
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F97316',
    marginBottom: 20,
  },
  addReviewText: {
    color: '#F97316',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyReviewsText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyReviewsSubtext: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
  reviewsList: {
    gap: 15,
  },
  reviewCard: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewUserName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    color: '#64748B',
    fontSize: 12,
  },
  reviewComment: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  starsSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 25,
    paddingVertical: 10,
  },
  starButton: {
    padding: 5,
  },
  commentInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 15,
    color: '#FFF',
    fontSize: 15,
    minHeight: 100,
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  deleteReviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteReviewText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  submitReviewButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});