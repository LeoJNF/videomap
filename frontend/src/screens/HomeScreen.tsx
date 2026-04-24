import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '../components/common/AppScreen';
import { FilterChip } from '../components/common/FilterChip';
import { SearchField } from '../components/common/SearchField';
import { ProviderCard } from '../components/cards/ProviderCard';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { colors } from '../theme/tokens';

function normalizeCity(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function HomeScreen({ navigation }: any) {
  const { providers, locations, toggleFavorite, isFavorite } = useMarketplace();
  const [citySearch, setCitySearch] = useState('');

  const normalizedSearch = useMemo(() => normalizeCity(citySearch), [citySearch]);
  const hasSearch = normalizedSearch.length > 0;

  const filteredProviders = useMemo(() => {
    if (!hasSearch) return [];

    return providers.filter((provider) =>
      normalizeCity(provider.location).includes(normalizedSearch),
    );
  }, [hasSearch, normalizedSearch, providers]);

  return (
    <AppScreen scroll>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.brand}>VIDEOMAP</Text>
          <Text style={styles.brandSub}>busca simples por cidade para encontrar o videomaker certo</Text>
        </View>
        <TouchableOpacity style={styles.studioButton} onPress={() => navigation.navigate('Studio')}>
          <Ionicons name="person-circle-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Encontre o videomaker ideal para o seu projeto.</Text>
        <Text style={styles.heroText}>
          Digite a cidade do seu evento, marca ou producao e veja os videomakers que atendem essa regiao.
        </Text>

        <View style={styles.searchBlock}>
          <SearchField
            value={citySearch}
            onChangeText={setCitySearch}
            placeholder="Digite a cidade do seu projeto"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickCitiesScroller}>
          <View style={styles.quickCitiesRow}>
            {locations.map((location) => (
              <FilterChip
                key={location}
                label={location}
                active={normalizeCity(location) === normalizedSearch}
                onPress={() => setCitySearch(location)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {!hasSearch ? (
        <View style={styles.stateCard}>
          <View style={styles.stateIcon}>
            <Ionicons name="search-outline" size={22} color={colors.accentStrong} />
          </View>
          <Text style={styles.stateTitle}>Comece pela cidade</Text>
          <Text style={styles.stateText}>
            Assim que voce digitar uma cidade, os videomakers disponiveis naquela regiao aparecem logo abaixo.
          </Text>
        </View>
      ) : filteredProviders.length === 0 ? (
        <View style={styles.stateCard}>
          <View style={styles.stateIcon}>
            <Ionicons name="location-outline" size={22} color={colors.accentStrong} />
          </View>
          <Text style={styles.stateTitle}>Nenhum videomaker encontrado nessa cidade.</Text>
          <Text style={styles.stateText}>
            Tente buscar por outra cidade ou toque em uma das sugestoes acima.
          </Text>
        </View>
      ) : (
        <View style={styles.resultsBlock}>
          <Text style={styles.resultsEyebrow}>Resultado da busca</Text>
          <Text style={styles.resultsTitle}>
            Videomakers em {citySearch.trim()}
          </Text>
          <Text style={styles.resultsText}>
            Toque em um perfil para ver os projetos, categorias e enviar a solicitacao sem cadastro.
          </Text>

          <View style={styles.resultsList}>
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isFavorite={isFavorite(provider.id)}
                onToggleFavorite={() => toggleFavorite(provider.id)}
                onPress={() => navigation.navigate('Profile', { providerId: provider.id })}
              />
            ))}
          </View>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2.4,
    color: colors.accentStrong,
  },
  brandSub: {
    marginTop: 6,
    color: colors.textMuted,
    maxWidth: 280,
    lineHeight: 18,
  },
  studioButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginTop: 22,
    padding: 22,
    borderRadius: 28,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '800',
    maxWidth: 320,
  },
  heroText: {
    marginTop: 10,
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: 15,
    maxWidth: 330,
  },
  searchBlock: {
    marginTop: 20,
  },
  quickCitiesScroller: {
    marginTop: 16,
  },
  quickCitiesRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  stateCard: {
    marginTop: 22,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    alignItems: 'flex-start',
  },
  stateIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: 14,
  },
  stateTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  stateText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 21,
  },
  resultsBlock: {
    marginTop: 24,
  },
  resultsEyebrow: {
    color: colors.accentStrong,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  resultsTitle: {
    marginTop: 8,
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  resultsText: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 21,
  },
  resultsList: {
    marginTop: 18,
  },
});
