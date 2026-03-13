import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="articles/[id]" />
        <Stack.Screen name="advocates/[id]" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="chat/ai-assistant" />
        <Stack.Screen name="emergency/contacts" />
        <Stack.Screen name="advocate/index" />
        <Stack.Screen name="admin/index" />
      </Stack>
    </AuthProvider>
  );
}