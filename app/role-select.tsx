// app/role-select.tsx — Choose Passenger or Driver
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RippleButton from '../components/RippleButton';

const BLUE = '#1A4FA0';
const DARK = '#163D80';
const BG = '#EAF1FB';

function Logo() {
  return (
    <View style={s.logoCard}>
      <Image
        source={require('../assets/images/devicegns-logo.jpg')}
        style={s.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

export default function RoleSelectScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: 'login' | 'register' }>();

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="light" />

      <View style={s.hero}>
        <Pressable
          style={({ pressed }) => [s.back, Platform.OS === 'ios' && pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: true, radius: 24 }}
        >
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </Pressable>
        <Logo />
      </View>

      <View style={s.sheet}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Passenger */}
          <View style={s.roleCard}>
            <View style={s.imgPlaceholder}>
              <Text style={s.imgText}>👨‍👩‍👧‍👦  Passenger Illustration</Text>
            </View>
          </View>
          <RippleButton
            title="Passenger"
            onPress={() => router.push({ pathname: '/passenger-auth', params: { mode } })}
            style={s.roleBtn}
            textStyle={s.roleBtnText}
          />
          <Text style={s.roleDesc}>Book a vehicle to go to your desired location.</Text>

          {/* Driver */}
          <View style={[s.roleCard, { marginTop: 24 }]}>
            <View style={s.imgPlaceholder}>
              <Text style={s.imgText}>🚗  Driver / Vehicle Illustration</Text>
            </View>
          </View>
          <RippleButton
            title="Driver"
            onPress={() => router.push({ pathname: '/driver-auth', params: { mode } })}
            style={s.roleBtn}
            textStyle={s.roleBtnText}
          />
          <Text style={s.roleDesc}>Earn money by accepting more rides.</Text>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE },
  hero: { backgroundColor: BLUE, paddingTop: 16, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' },
  back: { position: 'absolute', top: 16, left: 20, zIndex: 10, padding: 6 },
  logoCard: { backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 28, paddingVertical: 14, alignItems: 'center', marginTop: 8, elevation: 6 },
  logoImage: { width: 180, height: 70 },
  sheet: { flex: 1, backgroundColor: BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },
  roleCard: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', elevation: 3 },
  imgPlaceholder: { height: 200, backgroundColor: '#D6E4F7', justifyContent: 'center', alignItems: 'center' },
  imgText: { fontSize: 15, color: BLUE, fontWeight: '600', opacity: 0.6 },
  roleBtn: { backgroundColor: DARK, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 14 },
  roleBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  roleDesc: { fontSize: 14, fontWeight: '600', color: BLUE, textAlign: 'center', marginTop: 8 },
});
