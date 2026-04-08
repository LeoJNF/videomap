import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, RefreshControl, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import ServiceCard from '../components/ServiceCard';

const CATEGORIES = [
  'Casamentos',
  'Eventos Corporativos',
  'Festas',
  'Ensaios',
  'Publicidade',
  'Documentários',
  'Outros'
];

const SORT_OPTIONS = [
  { label: 'Mais recentes', value: 'recent' },
  { label: 'Mais visualizados', value: 'views' },
  { label: 'Menor preço', value: 'price_asc' },
  { label: 'Maior preço', value: 'price_desc' }
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  async function fetchServices() {
    try {
      const response = await api.get('/services');
      setServices(response.data.data || []);
    } catch (error) {
      console.log('Erro ao buscar serviços:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [])
  );

  function handleRefresh() {
    setRefreshing(true);
    fetchServices();
  }

  function toggleCategory(category: string) {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  }

  function clearFilters() {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recent');
    setSearchText('');
  }

  function applyFilters() {
    setShowFilters(false);
  }

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      // Search filter
      const matchSearch = service.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        service.provider?.name?.toLowerCase().includes(searchText.toLowerCase());
      
      // Category filter
      const matchCategory = selectedCategories.length === 0 || 
        (service.categories && service.categories.some((cat: string) => selectedCategories.includes(cat)));
      
      // Price filter
      const matchPrice = (!minPrice || service.price >= parseFloat(minPrice)) &&
        (!maxPrice || service.price <= parseFloat(maxPrice));
      
      return matchSearch && matchCategory && matchPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const activeFiltersCount = selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (sortBy !== 'recent' ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" style={{marginRight: 8}}/>
            <TextInput
              style={styles.input}
              placeholder="Buscar serviços, videomakers..."
              placeholderTextColor="#64748B"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={24} color={activeFiltersCount > 0 ? '#FFF' : '#94A3B8'} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              data={item}
              onPress={() => navigation.navigate('Details', { service: item })}
            />
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F97316" />
          }
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Ionicons name="albums-outline" size={48} color="#334155" />
                <Text style={{ color: '#94A3B8', marginTop: 10 }}>Nenhum serviço encontrado.</Text>
            </View>
          )}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Sort Options */}
              <Text style={styles.sectionTitle}>Ordenar por</Text>
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.sortOption, sortBy === option.value && styles.sortOptionActive]}
                    onPress={() => setSortBy(option.value)}
                  >
                    <Text style={[styles.sortOptionText, sortBy === option.value && styles.sortOptionTextActive]}>
                      {option.label}
                    </Text>
                    {sortBy === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#F97316" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Categories */}
              <Text style={styles.sectionTitle}>Categorias</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryChip, selectedCategories.includes(category) && styles.categoryChipActive]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[styles.categoryChipText, selectedCategories.includes(category) && styles.categoryChipTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range */}
              <Text style={styles.sectionTitle}>Faixa de Preço</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Mínimo</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="R$ 0"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                </View>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Máximo</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="R$ 9999"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpar Tudo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: '#1E293B', 
    borderBottomWidth: 1, borderBottomColor: '#334155',
    elevation: 4
  },
  headerTitle: { color: '#F97316', fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 15, height: 50,
    borderWidth: 1, borderColor: '#334155'
  },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  filterButton: {
    width: 50, height: 50, borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1, borderColor: '#334155',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative'
  },
  filterButtonActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316'
  },
  filterBadge: {
    position: 'absolute',
    top: -5, right: -5,
    backgroundColor: '#DC2626',
    width: 20, height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold'
  },
  modalBody: {
    padding: 20
  },
  sectionTitle: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12
  },
  
  // Sort options
  sortOptions: {
    gap: 10
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  sortOptionActive: {
    borderColor: '#F97316',
    backgroundColor: '#F973161A'
  },
  sortOptionText: {
    color: '#94A3B8',
    fontSize: 16
  },
  sortOptionTextActive: {
    color: '#FFF',
    fontWeight: '600'
  },
  
  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155'
  },
  categoryChipActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316'
  },
  categoryChipText: {
    color: '#94A3B8',
    fontSize: 14
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: '600'
  },
  
  // Price inputs
  priceRow: {
    flexDirection: 'row',
    gap: 15
  },
  priceInputContainer: {
    flex: 1
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8
  },
  priceInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 15,
    color: '#FFF',
    fontSize: 16
  },
  
  // Modal footer
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  clearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center'
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center'
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});