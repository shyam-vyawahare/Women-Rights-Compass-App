import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const tiles = [
    {
      title: 'Legal Knowledge Hub',
      icon: 'library',
      color: Colors.primary.blue,
      onPress: () => router.push('/(tabs)/articles'),
    },
    {
      title: 'Find Advocates',
      icon: 'people',
      color: Colors.primary.pink,
      onPress: () => router.push('/(tabs)/advocates'),
    },
    {
      title: 'My Chats',
      icon: 'chatbubbles',
      color: Colors.primary.lightBlue,
      onPress: () => router.push('/(tabs)/chats'),
    },
    {
      title: 'AI Legal Assistant',
      icon: 'sparkles',
      color: Colors.primary.blue,
      onPress: () => router.push('/chat/ai-assistant'),
    },
    {
      title: 'Emergency Contacts',
      icon: 'call',
      color: Colors.emergency.red,
      onPress: () => router.push('/emergency/contacts'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary.white, Colors.background.pink]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          </View>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => setEmergencyModalVisible(true)}
          >
            <Ionicons name="alert-circle" size={32} color={Colors.emergency.red} />
          </TouchableOpacity>
        </View>

        {/* Tiles */}
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.tilesContainer}>
            {tiles.map((tile, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tile}
                onPress={tile.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: tile.color }]}>
                  <Ionicons name={tile.icon as any} size={32} color="white" />
                </View>
                <Text style={styles.tileTitle}>{tile.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={Colors.primary.blue} />
            <Text style={styles.infoText}>
              Access verified legal information and connect with registered advocates for
              consultation.
            </Text>
          </View>
        </ScrollView>

        {/* Emergency Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={emergencyModalVisible}
          onRequestClose={() => setEmergencyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Emergency Services</Text>
                <TouchableOpacity onPress={() => setEmergencyModalVisible(false)}>
                  <Ionicons name="close" size={28} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.emergencyItem, { backgroundColor: Colors.emergency.red }]}
                onPress={() => {
                  handleCall('100');
                  setEmergencyModalVisible(false);
                }}
              >
                <Ionicons name="call" size={24} color="white" />
                <Text style={styles.emergencyItemText}>Police - 100</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.emergencyItem, { backgroundColor: Colors.primary.pink }]}
                onPress={() => {
                  handleCall('1091');
                  setEmergencyModalVisible(false);
                }}
              >
                <Ionicons name="call" size={24} color="white" />
                <Text style={styles.emergencyItemText}>Women Helpline - 1091</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.emergencyItem, { backgroundColor: Colors.primary.blue }]}
                onPress={() => {
                  handleCall('1930');
                  setEmergencyModalVisible(false);
                }}
              >
                <Ionicons name="call" size={24} color="white" />
                <Text style={styles.emergencyItemText}>Cyber Crime - 1930</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageContactsButton}
                onPress={() => {
                  setEmergencyModalVisible(false);
                  router.push('/emergency/contacts');
                }}
              >
                <Text style={styles.manageContactsText}>Manage Emergency Contacts</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Floating Emergency Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setEmergencyModalVisible(true)}
        >
          <Ionicons name="alert" size={28} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.white,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 4,
  },
  emergencyButton: {
    padding: 8,
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  tile: {
    width: '47%',
    backgroundColor: Colors.primary.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.emergency.red,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.primary.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  emergencyItemText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  manageContactsButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.background.light,
    alignItems: 'center',
    marginTop: 8,
  },
  manageContactsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.blue,
  },
});