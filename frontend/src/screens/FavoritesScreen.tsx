import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppScreen } from '../components/common/AppScreen';
import { EmptyState } from '../components/common/EmptyState';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ProviderCard } from '../components/cards/ProviderCard';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors } from '../theme/tokens';

export default function FavoritesScreen({ navigation }: any) {
  const { favoriteProviders, toggleFavorite, isFavorite } = useMarketplace();

  return (
    <AppScreen scroll>
      <ScreenHeader
        title="Favoritos"
        subtitle="Guarde os perfis que combinam com o estilo do projeto."
      />

      {favoriteProviders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="Sua curadoria ainda esta vazia"
            description="Salve videomakers para comparar portfolio, cidade e nivel profissional com calma."
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Discover')}
          >
            <Text style={styles.buttonText}>Explorar videomakers</Text>
          </TouchableOpacity>
        </View>
      ) : (
        favoriteProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            isFavorite={isFavorite(provider.id)}
            onToggleFavorite={() => toggleFavorite(provider.id)}
            onPress={() => navigation.navigate('Profile', { providerId: provider.id })}
          />
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    gap: 18,
    marginTop: 36,
  },
  button: {
    backgroundColor: colors.accentStrong,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '800',
  },
});

