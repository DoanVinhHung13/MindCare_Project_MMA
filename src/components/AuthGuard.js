import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useApp } from "../contexts/AppContext";

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for router to be completely ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only navigate when everything is ready and not loading
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    // Use setTimeout to ensure navigation happens after render
    const navigationTimer = setTimeout(() => {
      if (!isAuthenticated && inAuthGroup) {
        router.replace('/login');
      } else if (isAuthenticated && !inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 200);

    return () => clearTimeout(navigationTimer);
  }, [isAuthenticated, isLoading, segments, isReady]);

  if (isLoading || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
});
