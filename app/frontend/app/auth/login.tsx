import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const { role = 'user' } = useLocalSearchParams<{ role?: string }>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isAdvocate = role === 'advocate';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Navigation handled by index.tsx based on user role
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={
          isAdvocate
            ? [Colors.advocate.black, Colors.advocate.darkGray]
            : [Colors.primary.white, Colors.primary.lightPink]
        }
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isAdvocate ? Colors.advocate.white : Colors.text.primary}
            />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Ionicons
              name={isAdvocate ? 'briefcase' : 'person'}
              size={60}
              color={isAdvocate ? Colors.advocate.white : Colors.primary.pink}
            />
            <Text
              style={[
                styles.title,
                { color: isAdvocate ? Colors.advocate.white : Colors.primary.pink },
              ]}
            >
              {isAdvocate ? 'Advocate Login' : 'User Login'}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: isAdvocate ? Colors.advocate.lightGray : Colors.text.secondary },
              ]}
            >
              Welcome back!
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail"
                size={20}
                color={isAdvocate ? Colors.advocate.lightGray : Colors.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: isAdvocate ? Colors.advocate.white : Colors.text.primary,
                    borderColor: isAdvocate ? Colors.advocate.mediumGray : Colors.primary.lightPink,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={
                  isAdvocate ? Colors.advocate.lightGray : Colors.text.light
                }
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={isAdvocate ? Colors.advocate.lightGray : Colors.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: isAdvocate ? Colors.advocate.white : Colors.text.primary,
                    borderColor: isAdvocate ? Colors.advocate.mediumGray : Colors.primary.lightPink,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={
                  isAdvocate ? Colors.advocate.lightGray : Colors.text.light
                }
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={isAdvocate ? Colors.advocate.lightGray : Colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: isAdvocate ? Colors.advocate.white : Colors.primary.pink,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: isAdvocate ? Colors.advocate.black : Colors.primary.white },
                ]}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text
                style={[
                  styles.footerText,
                  { color: isAdvocate ? Colors.advocate.lightGray : Colors.text.secondary },
                ]}
              >
                Don&apos;t have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push(`/auth/signup?role=${role}`)}>
                <Text
                  style={[
                    styles.linkText,
                    { color: isAdvocate ? Colors.advocate.white : Colors.primary.blue },
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    paddingLeft: 48,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});