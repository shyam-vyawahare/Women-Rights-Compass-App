import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import api from '../../src/services/api';
import { API_URL } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';

interface AdvocateProfile {
  id: string;
  user_id: string;
  full_name: string;
  bar_registration_no: string;
  experience_years: number;
  practice_areas: string[];
  languages: string[];
  state: string;
  city: string;
  availability_hours: string;
  qualification: string;
  profile_photo?: string;
  rating: number;
  contact_enabled: boolean;
  chat_enabled: boolean;
}

export default function AdvocateDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdvocateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/advocates/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching advocate profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (profile?.contact_enabled) {
      // Mock calling for now
      Alert.alert('Call', `Calling ${profile.full_name}...`);
    } else {
      Alert.alert('Contact disabled', 'This advocate has disabled phone contact.');
    }
  };

  const handleStartChat = async () => {
    if (!profile?.chat_enabled) {
      Alert.alert('Chat disabled', 'This advocate has disabled chat queries.');
      return;
    }

    try {
      const response = await api.post('/chats', {
        advocate_id: profile.user_id
      });
      router.push({
        pathname: '/chat/[id]',
        params: { id: response.data.id, name: profile.full_name }
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };

  const handleRequestAppointment = () => {
    Alert.alert(
      'Request Appointment',
      `Would you like to request a consultation with ${profile?.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request', 
          onPress: async () => {
            try {
              await api.post('/appointments', {
                advocate_id: profile?.user_id
              });
              Alert.alert('Success', 'Consultation request sent successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to send request.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.pink} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Advocate not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile.profile_photo ? (
              <Image source={{ uri: profile.profile_photo }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Ionicons name="person" size={64} color={Colors.primary.pink} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.qualification}>{profile.qualification}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>{profile.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.sectionText}>{profile.experience_years} years in practice</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bar Registration</Text>
          <Text style={styles.sectionText}>{profile.bar_registration_no}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Areas</Text>
          <View style={styles.badgeContainer}>
            {profile.practice_areas.map((area, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.sectionText}>{profile.languages.join(', ')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <Text style={styles.sectionText}>{profile.availability_hours}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionText}>{profile.city}, {profile.state}</Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleCall}>
          <Ionicons name="call-outline" size={24} color={Colors.primary.pink} />
          <Text style={styles.actionButtonSecondaryText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleStartChat}>
          <Ionicons name="chatbubble-outline" size={24} color={Colors.primary.pink} />
          <Text style={styles.actionButtonSecondaryText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButtonPrimary} onPress={handleRequestAppointment}>
          <Text style={styles.actionButtonPrimaryText}>Request Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.primary.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  qualification: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.background.pink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14,
    color: Colors.primary.pink,
    fontWeight: '600',
  },
  spacer: {
    height: 100,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary.white,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.background.light,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonSecondary: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.pink,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonSecondaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.pink,
  },
  actionButtonPrimary: {
    flex: 2,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primary.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  backLink: {
    fontSize: 16,
    color: Colors.primary.pink,
    fontWeight: 'bold',
  },
});
