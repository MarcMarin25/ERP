// app/welcome.tsx — Welcome screen (Log in / Register)
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RippleButton from '../components/RippleButton';

const BLUE = '#1A4FA0';
const DARK = '#163D80';

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

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={s.hero}><Logo /></View>
      <View style={s.card}>
        <Text style={s.headline}>{"There's always something new"}{'\n'}to explore around you!</Text>
        <Text style={s.sub}>
          Plan your trips, find the best routes, and travel effortlessly all in one place. Let the journey begin
        </Text>
        <RippleButton
          title="Log in"
          onPress={() => router.push({ pathname: '/role-select', params: { mode: 'login' } })}
          style={s.btn}
          textStyle={s.btnText}
        />
        <RippleButton
          title="Register"
          onPress={() => router.push({ pathname: '/role-select', params: { mode: 'register' } })}
          style={s.btn}
          textStyle={s.btnText}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logoCard: { backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 28, paddingVertical: 16, alignItems: 'center', elevation: 6 },
  logoImage: { width: 200, height: 80 },
  card: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 36 },
  headline: { fontSize: 22, fontWeight: '700', color: BLUE, textAlign: 'center', lineHeight: 30, marginBottom: 20 },
  sub: { fontSize: 15, fontWeight: '600', color: BLUE, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  btn: { backgroundColor: DARK, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
