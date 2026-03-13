import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Navigate based on user role
      if (user.role === 'user') {
        router.replace('/(tabs)');
      } else if (user.role === 'advocate') {
        router.replace('/advocate');
      } else if (user.role === 'admin') {
        router.replace('/admin');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.white, Colors.primary.lightPink, Colors.primary.lightBlue]}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={80} color={Colors.primary.pink} />
          <Text style={styles.title}>Rights Compass</Text>
          <Text style={styles.subtitle}>Your Legal Guide & Support</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="library" size={32} color={Colors.primary.blue} />
            <Text style={styles.infoText}>Legal Knowledge Hub</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="people" size={32} color={Colors.primary.blue} />
            <Text style={styles.infoText}>Connect with Advocates</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="alert-circle" size={32} color={Colors.emergency.red} />
            <Text style={styles.infoText}>Emergency Services</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.userButton]}
            onPress={() => router.push('/auth/login?role=user')}
          >
            <Ionicons name="person" size={24} color="white" />
            <Text style={styles.buttonText}>I&apos;m a User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.advocateButton]}
            onPress={() => router.push('/auth/login?role=advocate')}
          >
            <Ionicons name="briefcase" size={24} color="white" />
            <Text style={styles.buttonText}>I&apos;m an Advocate</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Button */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => router.push('/emergency/contacts')}
        >
          <Ionicons name="call" size={28} color="white" />
          <Text style={styles.emergencyText}>Emergency SOS</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text.secondary,
  },
  gradient: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary.pink,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  infoContainer: {
    marginBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 12,
  },
  userButton: {
    backgroundColor: Colors.primary.pink,
  },
  advocateButton: {
    backgroundColor: Colors.advocate.black,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emergency.red,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  emergencyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});