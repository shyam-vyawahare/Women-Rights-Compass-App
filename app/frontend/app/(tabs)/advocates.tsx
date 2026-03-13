import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import { API_URL } from '../../src/constants';

interface Advocate {
  id: string;
  user_id: string;
  full_name: string;
  experience_years: number;
  practice_areas: string[];
  languages: string[];
  city: string;
  state: string;
  profile_photo?: string;
  rating: number;
}

export default function AdvocatesScreen() {
  const router = useRouter();
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    practice_area: '',
  });

  useEffect(() => {
    fetchAdvocates();
  }, [filters]);

  const fetchAdvocates = async () => {
    setLoading(true);
    try {
      // Build query string for fetch
      let url = '/advocates';
      const queryParams = new URLSearchParams();
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.practice_area) queryParams.append('practice_area', filters.practice_area);
      
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      const response = await api.get(url);
      setAdvocates(response.data);
    } catch (error) {
      console.error('Error fetching advocates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdvocates = advocates.filter(advocate =>
    advocate.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAdvocateCard = ({ item }: { item: Advocate }) => (
    <TouchableOpacity
      style={styles.advocateCard}
      onPress={() => router.push({
        pathname: '/advocates/[id]',
        params: { id: item.id }
      })}
    >
      <View style={styles.avatarContainer}>
        {item.profile_photo ? (
          <Image source={{ uri: item.profile_photo }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Ionicons name="person" size={32} color={Colors.primary.pink} />
          </View>
        )}
      </View>
      
      <View style={styles.advocateInfo}>
        <Text style={styles.advocateName}>{item.full_name}</Text>
        <Text style={styles.advocateDetails}>
          {item.experience_years} years exp • {item.city}
        </Text>
        <View style={styles.practiceAreas}>
          {item.practice_areas.slice(0, 2).map((area, index) => (
            <View key={index} style={styles.areaBadge}>
              <Text style={styles.areaBadgeText}>{area}</Text>
            </View>
          ))}
          {item.practice_areas.length > 2 && (
            <Text style={styles.moreAreas}>+{item.practice_areas.length - 2} more</Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={24} color={Colors.text.light} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Legal Advocate</Text>
        <Text style={styles.headerSubtitle}>Connect with verified legal professionals</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.text.light} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={18} color={Colors.primary.pink} />
            <Text style={styles.filterButtonText}>All Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>City</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Expertise</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.pink} />
        </View>
      ) : (
        <FlatList
          data={filteredAdvocates}
          renderItem={renderAdvocateCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={Colors.background.pink} />
              <Text style={styles.emptyText}>No advocates found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.primary.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.background.light,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary.white,
    borderWidth: 1,
    borderColor: Colors.background.light,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  advocateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.background.light,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  placeholderAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advocateInfo: {
    flex: 1,
  },
  advocateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  advocateDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  practiceAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  areaBadge: {
    backgroundColor: Colors.background.pink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  areaBadgeText: {
    fontSize: 10,
    color: Colors.primary.pink,
    fontWeight: '700',
  },
  moreAreas: {
    fontSize: 10,
    color: Colors.text.light,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.light,
    marginTop: 16,
  },
});
