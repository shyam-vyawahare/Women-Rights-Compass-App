import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import { API_URL } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { format } from 'date-fns';

interface Chat {
  id: string;
  user_id: string;
  user_name: string;
  advocate_id: string;
  advocate_name: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChatCard = ({ item }: { item: Chat }) => {
    const isAdvocate = user?.role === 'advocate';
    const displayName = isAdvocate ? item.user_name : item.advocate_name;
    const lastTime = item.last_message_time ? format(new Date(item.last_message_time), 'HH:mm') : '';

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => router.push({
          pathname: '/chat/[id]',
          params: { id: item.id, name: displayName }
        })}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.placeholderAvatar}>
            <Ionicons name="person" size={28} color={Colors.primary.pink} />
          </View>
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{displayName}</Text>
            <Text style={styles.chatTime}>{lastTime}</Text>
          </View>
          <View style={styles.chatFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message || 'No messages yet'}
            </Text>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Chats</Text>
        <Text style={styles.headerSubtitle}>Legal consultations and advice</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.pink} />
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={Colors.background.pink} />
              <Text style={styles.emptyText}>No chats yet</Text>
              <TouchableOpacity
                style={styles.startChatButton}
                onPress={() => router.push('/(tabs)/advocates')}
              >
                <Text style={styles.startChatText}>Find an Advocate</Text>
              </TouchableOpacity>
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
  listContent: {
    padding: 16,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.background.light,
  },
  avatarContainer: {
    marginRight: 16,
  },
  placeholderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.text.light,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primary.pink,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: Colors.primary.white,
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: Colors.primary.pink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startChatText: {
    color: Colors.primary.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
