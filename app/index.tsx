// app/index.tsx — Splash screen (first screen on launch)
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { useAuth } from './_layout';

export default function SplashScreen() {
  const router = useRouter();
  const { userSession, isLoading } = useAuth();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (userSession) {
          if (userSession.role === 'driver') {
            router.replace('/(driver-tabs)/home');
          } else {
            router.replace('/(tabs)/home');
          }
        } else {
          router.replace('/welcome');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, userSession, router]);

  return (
    <View style={s.container}>
      <StatusBar style="light" />
      <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={s.logoGroup}>
          <Image
            source={require('../assets/images/devicegns-logo.jpg')}
            style={s.logoImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  card:        { backgroundColor: '#FFF', width: 280, height: 280, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 20, padding: 24 },
  logoGroup:   { alignItems: 'center' },
  logoImage:   { width: 220, height: 100 },
});

