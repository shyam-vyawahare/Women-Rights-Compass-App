import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import api from '../../src/services/api';
import { API_URL } from '../../src/constants';

interface Contact {
  name: string;
  phone: string;
  relationship: string;
}

export default function EmergencyContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/emergency-contacts');
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    if (contacts.length >= 3) {
      Alert.alert('Limit Reached', 'You can add a maximum of 3 emergency contacts.');
      return;
    }
    setContacts([...contacts, { name: '', phone: '', relationship: '' }]);
  };

  const handleRemoveContact = (index: number) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts);
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleSave = async () => {
    // Validate
    for (const contact of contacts) {
      if (!contact.name || !contact.phone || !contact.relationship) {
        Alert.alert('Incomplete Information', 'Please fill in all fields for each contact.');
        return;
      }
    }

    setSaving(true);
    try {
      await api.put('/emergency-contacts', { contacts });
      Alert.alert('Success', 'Emergency contacts updated successfully.');
      router.back();
    } catch (error) {
      console.error('Error saving contacts:', error);
      Alert.alert('Error', 'Failed to save contacts. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving}
          style={styles.saveButton}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primary.pink} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={Colors.primary.blue} />
          <Text style={styles.infoText}>
            Add up to 3 trusted contacts who will be notified in case of an emergency.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary.pink} style={styles.loader} />
        ) : (
          <View style={styles.contactsList}>
            {contacts.map((contact, index) => (
              <View key={index} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactNumber}>Contact #{index + 1}</Text>
                  <TouchableOpacity onPress={() => handleRemoveContact(index)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.emergency.red} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter name"
                    value={contact.name}
                    onChangeText={(val) => updateContact(index, 'name', val)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    value={contact.phone}
                    onChangeText={(val) => updateContact(index, 'phone', val)}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Relationship</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Father, Friend, Sister"
                    value={contact.relationship}
                    onChangeText={(val) => updateContact(index, 'relationship', val)}
                  />
                </View>
              </View>
            ))}

            {contacts.length < 3 && (
              <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
                <Ionicons name="add-circle-outline" size={24} color={Colors.primary.pink} />
                <Text style={styles.addButtonText}>Add New Contact</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.light,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.pink,
  },
  content: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  loader: {
    marginTop: 40,
  },
  contactsList: {
    gap: 20,
  },
  contactCard: {
    backgroundColor: Colors.primary.white,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.light,
    paddingBottom: 8,
  },
  contactNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.light,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.background.pink,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.pink,
  },
});
