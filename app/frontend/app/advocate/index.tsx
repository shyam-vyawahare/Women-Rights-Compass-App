import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function AdvocateDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, Advocate</Text>
          <Text style={styles.name}>{user?.full_name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => logout().then(() => router.replace('/'))}>
          <Ionicons name="log-out-outline" size={24} color={Colors.emergency.red} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text" size={32} color={Colors.primary.blue} />
            <Text style={styles.menuText}>Upload Article</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="chatbubbles" size={32} color={Colors.primary.pink} />
            <Text style={styles.menuText}>Chat Queries</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="calendar" size={32} color={Colors.primary.blue} />
            <Text style={styles.menuText}>Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person" size={32} color={Colors.text.primary} />
            <Text style={styles.menuText}>Update Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Profile Status</Text>
            <Text style={styles.statusValue}>Verified & Active</Text>
          </View>
          <Ionicons name="checkmark-circle" size={32} color="#2ECC71" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black & White theme for advocate as per context
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#111',
  },
  greeting: {
    fontSize: 14,
    color: '#888',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#222',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 12,
    textAlign: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#222',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: '#888',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginTop: 4,
  },
});
