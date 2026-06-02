// app/passenger-auth.tsx
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal, Platform, ScrollView,
  StyleSheet, Text, TextInput, View, Pressable, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RippleButton from '../components/RippleButton';
import { useAuth } from './_layout';
import { registerPassenger, loginPassenger } from '../utils/mockDb';

// ─── PH regions data ──────────────────────────────────────────────────────────
const REGIONS = [
  { id:'1',  name:'NCR - National Capital Region',          provinces:['Metro Manila'] },
  { id:'2',  name:'Region I - Ilocos Region',               provinces:['Ilocos Norte','Ilocos Sur','La Union','Pangasinan'] },
  { id:'3',  name:'Region II - Cagayan Valley',             provinces:['Batanes','Cagayan','Isabela','Nueva Vizcaya','Quirino'] },
  { id:'4',  name:'Region III - Central Luzon',             provinces:['Aurora','Bataan','Bulacan','Nueva Ecija','Pampanga','Tarlac','Zambales'] },
  { id:'5',  name:'Region IV-A - CALABARZON',               provinces:['Batangas','Cavite','Laguna','Quezon','Rizal'] },
  { id:'6',  name:'MIMAROPA Region',                        provinces:['Marinduque','Occidental Mindoro','Oriental Mindoro','Palawan','Romblon'] },
  { id:'7',  name:'Region V - Bicol Region',                provinces:['Albay','Camarines Norte','Camarines Sur','Catanduanes','Masbate','Sorsogon'] },
  { id:'8',  name:'Region VI - Western Visayas',            provinces:['Aklan','Antique','Capiz','Guimaras','Iloilo','Negros Occidental'] },
  { id:'9',  name:'Region VII - Central Visayas',           provinces:['Bohol','Cebu','Negros Oriental','Siquijor'] },
  { id:'10', name:'Region VIII - Eastern Visayas',          provinces:['Biliran','Eastern Samar','Leyte','Northern Samar','Samar','Southern Leyte'] },
  { id:'11', name:'Region IX - Zamboanga Peninsula',        provinces:['Zamboanga del Norte','Zamboanga del Sur','Zamboanga Sibugay'] },
  { id:'12', name:'Region X - Northern Mindanao',           provinces:['Bukidnon','Camiguin','Lanao del Norte','Misamis Occidental','Misamis Oriental'] },
  { id:'13', name:'Region XI - Davao Region',               provinces:['Davao de Oro','Davao del Norte','Davao del Sur','Davao Occidental','Davao Oriental'] },
  { id:'14', name:'Region XII - SOCCSKSARGEN',              provinces:['Cotabato','Sarangani','South Cotabato','Sultan Kudarat'] },
  { id:'15', name:'Region XIII - Caraga',                   provinces:['Agusan del Norte','Agusan del Sur','Dinagat Islands','Surigao del Norte','Surigao del Sur'] },
  { id:'16', name:'BARMM',                                  provinces:['Basilan','Lanao del Sur','Maguindanao del Norte','Maguindanao del Sur','Sulu','Tawi-Tawi'] },
  { id:'17', name:'CAR - Cordillera Administrative Region', provinces:['Abra','Apayao','Benguet','Ifugao','Kalinga','Mountain Province'] },
];

function calcAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

function formatDate(d: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ─── PH address lists & generators ──────────────────────────────────────────
function getCitiesForProvince(provinceName: string): string[] {
  if (!provinceName) return [];
  if (provinceName === 'Metro Manila') {
    return ['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong', 'Alabang'];
  }
  if (provinceName.includes('Cebu')) {
    return ['Cebu City', 'Mandaue City', 'Lapu-Lapu City', 'Talisay City', 'Bogo City'];
  }
  if (provinceName.includes('Davao')) {
    return ['Davao City', 'Digos City', 'Panabo City', 'Tagum City'];
  }
  if (provinceName.includes('Iloilo')) {
    return ['Iloilo City', 'Passi City', 'Oton', 'Santa Barbara'];
  }
  if (provinceName.includes('Pangasinan')) {
    return ['Dagupan City', 'San Carlos City', 'Urdaneta City', 'Alaminos City', 'Lingayen'];
  }
  if (provinceName.includes('Laguna')) {
    return ['Calamba City', 'Santa Rosa City', 'Biñan City', 'San Pedro City', 'Los Baños'];
  }
  if (provinceName.includes('Cavite')) {
    return ['Bacoor City', 'Imus City', 'Dasmariñas City', 'Tagaytay City', 'General Trias'];
  }
  if (provinceName.includes('Bulacan')) {
    return ['Malolos City', 'Meycauayan City', 'San Jose del Monte City', 'Marilao'];
  }
  if (provinceName.includes('Pampanga')) {
    return ['San Fernando City', 'Angeles City', 'Mabalacat City', 'Guagua'];
  }
  if (provinceName.includes('Batangas')) {
    return ['Batangas City', 'Lipa City', 'Tanauan City', 'Nasugbu'];
  }
  if (provinceName.includes('Rizal')) {
    return ['Antipolo City', 'Cainta', 'Taytay', 'Binangonan'];
  }

  return [
    `${provinceName} Capital City`,
    `${provinceName} Central Town`,
    'Poblacion District',
    'North Municipality',
    'South Municipality'
  ];
}

function getBarangaysForCity(cityName: string): string[] {
  if (!cityName) return [];
  if (cityName === 'Manila') {
    return ['Binondo', 'Ermita', 'Malate', 'Intramuros', 'Tondo', 'Sampaloc', 'Quiapo', 'San Miguel'];
  }
  if (cityName === 'Quezon City') {
    return ['Diliman', 'Cubao', 'Commonwealth', 'Katipunan', 'Batasan Hills', 'Novaliches', 'Kamuning', 'Loyola Heights'];
  }
  if (cityName === 'Makati') {
    return ['Bel-Air', 'Poblacion', 'Guadalupe Nuevo', 'Guadalupe Viejo', 'San Lorenzo', 'Urdaneta', 'Bangkal', 'Tejeros'];
  }
  if (cityName === 'Taguig') {
    return ['Fort Bonifacio (BGC)', 'Signal Village', 'Ususan', 'Wawa', 'Western Bicutan', 'Hagonoy', 'Tuktukan'];
  }
  if (cityName === 'Pasig') {
    return ['Kapitolyo', 'Oranbo', 'San Antonio', 'Caniogan', 'Maybunga', 'Manggahan', 'Rosario', 'Bambang'];
  }
  if (cityName === 'Cebu City') {
    return ['Lahug', 'Mabolo', 'Guadalupe', 'Capitol Site', 'Banilad', 'Talamban', 'Pardo', 'Tisa'];
  }
  if (cityName === 'Davao City') {
    return ['Buhangin', 'Talomo', 'Agdao', 'Toril', 'Calinan', 'Bunawan', 'Poblacion'];
  }
  if (cityName === 'Iloilo City') {
    return ['Molo', 'Jaro', 'Mandurriao', 'Arevalo', 'La Paz', 'City Proper'];
  }

  return [
    'Barangay Poblacion',
    'Barangay San Jose',
    'Barangay Santa Maria',
    'Barangay Santo Tomas',
    'Barangay San Pedro',
    'Barangay San Vicente',
    'Barangay Santa Cruz',
    'Barangay San Juan'
  ];
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function Logo() {
  return (
    <View style={s.logoCard}>
      <Text>
        <Text style={{ color: '#1A4FA0', fontSize: 32, fontWeight: '900' }}>Anti</Text>
        <Text style={{ color: '#22AA44', fontSize: 32, fontWeight: '900' }}>gravity</Text>
      </Text>
      <Text style={s.tagline}>
        SMART & GREEN RIDE-SHARING
      </Text>
    </View>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <><Text style={s.label}>{label}</Text>{children}</>;
}

function IconInput({ icon, placeholder, value, onChange, keyboard, secure, onToggleSecure }: any) {
  return (
    <View style={s.inputRow}>
      <View style={s.iconBox}><FontAwesome name={icon} size={18} color="#FFF" /></View>
      <TextInput style={s.input} placeholder={placeholder} placeholderTextColor="#A0A0A0"
        value={value} onChangeText={onChange} keyboardType={keyboard} secureTextEntry={secure} />
      {onToggleSecure && (
        <TouchableOpacity onPress={onToggleSecure} style={s.rightIcon}>
          <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={20} color="#555" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Calendar date picker (cross-platform) ────────────────────────────────────
function DobField({ value, age, onChange }: { value: Date | null; age: string; onChange: (d: Date) => void }) {
  const [show, setShow]     = useState(false);
  const [temp, setTemp]     = useState(value ?? new Date(2000, 0, 1));
  const [iosModal, setIos]  = useState(false);

  const open = () => {
    if (Platform.OS === 'ios') { setIos(true); }
    else if (Platform.OS === 'android') { setShow(true); }
  };

  const onAndroidChange = (_: DateTimePickerEvent, d?: Date) => {
    setShow(false);
    if (d) {
      onChange(d);
      setTemp(d);
    }
  };

  const onIosChange = (_: DateTimePickerEvent, d?: Date) => {
    if (d) setTemp(d);
  };

  // Sync temp when value updates
  useState(() => {
    if (value) setTemp(value);
  });

  return (
    <>
      <View style={s.dobRow}>
        {/* Date button / Web Input */}
        <View style={{ flex: 1.4, marginRight: 10 }}>
          <Text style={s.label}>Date of Birth</Text>
          {Platform.OS === 'web' ? (
            <View style={s.dobBox}>
              <input
                type="date"
                value={value ? value.toISOString().split('T')[0] : ''}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const d = e.target.value ? new Date(e.target.value) : null;
                  if (d && !isNaN(d.getTime())) {
                    onChange(d);
                    setTemp(d);
                  }
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  color: value ? '#333' : '#A0A0A0',
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit',
                  height: '100%',
                  width: '100%',
                }}
              />
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [s.dobBox, Platform.OS === 'ios' && pressed && { opacity: 0.8 }]}
              onPress={open}
              android_ripple={{ color: 'rgba(26, 79, 160, 0.1)' }}
            >
              <Text style={value ? s.dobValue : s.dobPlaceholder}>{value ? formatDate(value) : 'MM/DD/YYYY'}</Text>
              <FontAwesome name="calendar" size={16} color="#1A4FA0" />
            </Pressable>
          )}
        </View>
        {/* Age (auto-filled) */}
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Age</Text>
          <TextInput style={[s.input, s.ageInput]} value={age} editable={false} placeholder="--" placeholderTextColor="#A0A0A0" />
        </View>
      </View>

      {/* Android native picker */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker value={temp} mode="date" display="default"
          maximumDate={new Date()} onChange={onAndroidChange} />
      )}

      {/* iOS bottom-sheet picker */}
      {iosModal && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={iosModal} onRequestClose={() => setIos(false)}>
          <View style={s.iosOverlay}>
            <View style={s.iosCard}>
              <View style={s.iosHeader}>
                <TouchableOpacity onPress={() => setIos(false)}><Text style={s.iosCancel}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => { onChange(temp); setIos(false); }}><Text style={s.iosDone}>Done</Text></TouchableOpacity>
              </View>
              <DateTimePicker value={temp} mode="date" display="spinner"
                maximumDate={new Date()} onChange={onIosChange} />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

// ─── Location picker modal ────────────────────────────────────────────────────
function LocationModal({ visible, type, region, province, city, onSelect, onClose }: any) {
  let items: string[] = [];
  let modalTitle = 'Select';
  
  if (type === 'region') {
    items = REGIONS.map(r => r.name);
    modalTitle = 'Select Region';
  } else if (type === 'province') {
    items = REGIONS.find(r => r.name === region)?.provinces ?? [];
    modalTitle = 'Select Province';
  } else if (type === 'city') {
    items = getCitiesForProvince(province);
    modalTitle = 'Select City / Municipality';
  } else if (type === 'barangay') {
    items = getBarangaysForCity(city);
    modalTitle = 'Select Barangay';
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalBox}>
          <Text style={s.modalTitle}>{modalTitle}</Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {items.map((item, i) => (
              <TouchableOpacity key={i} style={s.modalItem} onPress={() => onSelect(item)}>
                <Text style={s.modalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.modalClose} onPress={onClose}>
            <Text style={s.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PassengerAuthScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { mode } = useLocalSearchParams<{ mode: 'login' | 'register' }>();
  const isLogin = mode === 'login';

  // Login state
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPw, setLoginPw]         = useState('');
  const [showPw, setShowPw]           = useState(true);

  // Registration state
  const [step, setStep]                     = useState(1);
  const [dobDate, setDobDate]               = useState<Date | null>(null);
  const [locationModal, setLocationModal]   = useState(false);
  const [pickType, setPickType]             = useState<'region'|'province'|'city'|'barangay'>('region');
  const [showPwReg, setShowPwReg]           = useState(true);
  const [showConfirm, setShowConfirm]       = useState(true);
  const [agreedTerms, setAgreedTerms]       = useState(false);
  const [agreedPromos, setAgreedPromos]     = useState(false);

  const [form, setForm] = useState({
    username:'', fullName:'', gender:'Male', mobile:'', email:'',
    region:'', province:'', city:'', barangay:'', password:'', confirmPassword:'',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const age    = dobDate ? String(calcAge(dobDate)) : '';

  // Validation helpers
  const isEmailValid = (e: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e.trim());
  };

  const isMobileValid = (m: string) => {
    const cleaned = m.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const isStep1Valid =
    form.username.trim().length > 0 &&
    dobDate !== null &&
    calcAge(dobDate) >= 18 &&
    isMobileValid(form.mobile) &&
    isEmailValid(form.email) &&
    form.region.trim().length > 0 &&
    form.province.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.barangay.trim().length > 0;

  const isStep2Valid =
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    agreedTerms;

  const isLoginValid =
    isMobileValid(loginMobile) &&
    loginPw.length > 0;

  const handleLoginSubmit = async () => {
    if (!isLoginValid) return;
    try {
      const passenger = await loginPassenger(loginMobile, loginPw);
      await login({
        role: 'passenger',
        ...passenger
      });
      router.replace('/(tabs)/home');
    } catch (err: any) {
      alert(err.message || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async () => {
    if (!isStep1Valid || !isStep2Valid) return;
    try {
      const fullAddress = `${form.barangay}, ${form.city}, ${form.province}, ${form.region}`;
      const passengerData = {
        username: form.username.trim(),
        fullName: form.fullName.trim() || form.username.trim(),
        gender: form.gender,
        dob: dobDate ? dobDate.toISOString().split('T')[0] : '',
        age: age,
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        region: form.region,
        province: form.province,
        city: form.city,
        barangay: form.barangay,
        address: fullAddress,
        password: form.password,
        createdAt: '', // Will be set by registerPassenger()
      };

      await registerPassenger(passengerData);
      await login({
        role: 'passenger',
        ...passengerData
      });
      alert('Registration successful! Welcome to Antigravity.');
      router.replace('/(tabs)/home');
    } catch (err: any) {
      alert(err.message || 'Registration failed.');
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Hero */}
      <View style={s.hero}>
        <Pressable
          style={({ pressed }) => [s.back, Platform.OS === 'ios' && pressed && { opacity: 0.7 }]}
          onPress={() => router.replace('/welcome')}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: true, radius: 24 }}
        >
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </Pressable>
        <Logo />
      </View>

      {/* Card */}
      <View style={s.sheet}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── LOGIN ── */}
          {isLogin ? (
            <View>
              <Text style={s.loginTitle}>Sign in to your Account</Text>
              <Text style={s.loginSub}>Enter your mobile and password to log in</Text>
              <Field label="Mobile Number">
                <IconInput icon="phone" placeholder="Mobile Number" value={loginMobile} onChange={setLoginMobile} keyboard="phone-pad" />
              </Field>
              <Field label="Password">
                <IconInput icon="key" placeholder="Password" value={loginPw} onChange={setLoginPw} secure={showPw} onToggleSecure={() => setShowPw(p => !p)} />
              </Field>
              <TouchableOpacity style={s.forgot}><Text style={s.forgotText}>Forgot Password?</Text></TouchableOpacity>
              <RippleButton
                title="Log in"
                disabled={!isLoginValid}
                onPress={handleLoginSubmit}
                style={s.primaryBtn}
                textStyle={s.primaryBtnText}
              />
            </View>

          /* ── REGISTRATION ── */
          ) : (
            <View>
              <View style={s.badge}><Text style={s.badgeText}>Passenger Registration</Text></View>

              {step === 1 ? (
                <View>
                  <Text style={s.stepTitle}>Basic Information</Text>

                  <Field label="Username">
                    <IconInput icon="user" placeholder="Username" value={form.username} onChange={(v: string) => set('username', v)} />
                  </Field>
                  <Field label="Full Name (Optional)">
                    <IconInput icon="user" placeholder="Full Name" value={form.fullName} onChange={(v: string) => set('fullName', v)} />
                  </Field>

                  <Field label="Gender">
                    <View style={s.inputRow}>
                      <TextInput style={s.input} placeholder="Choose Gender" placeholderTextColor="#A0A0A0"
                        value={form.gender} onChangeText={v => set('gender', v)} />
                      <Ionicons name="chevron-down" size={20} color="#1A4FA0" style={s.rightIcon} />
                    </View>
                  </Field>

                  {/* DOB + Age with working calendar */}
                  <DobField value={dobDate} age={age} onChange={setDobDate} />

                  <Field label="Mobile Number">
                    <IconInput icon="phone" placeholder="Mobile Number" value={form.mobile} onChange={(v: string) => set('mobile', v)} keyboard="phone-pad" />
                  </Field>
                  <Field label="Email Address">
                    <IconInput icon="envelope" placeholder="Email Address" value={form.email} onChange={(v: string) => set('email', v)} keyboard="email-address" />
                  </Field>

                  <Field label="Region">
                    <TouchableOpacity style={s.inputRow} onPress={() => { setPickType('region'); setLocationModal(true); }}>
                      <Text style={[s.input, { paddingTop: 12, color: form.region ? '#333' : '#A0A0A0' }]}>{form.region || 'Select Region'}</Text>
                      <Ionicons name="chevron-down" size={20} color="#1A4FA0" style={s.rightIcon} />
                    </TouchableOpacity>
                  </Field>
                  
                  {form.region ? (
                    <Field label="Province">
                      <Pressable
                        style={({ pressed }) => [s.inputRow, Platform.OS === 'ios' && pressed && { opacity: 0.8 }]}
                        onPress={() => { setPickType('province'); setLocationModal(true); }}
                        android_ripple={{ color: 'rgba(26, 79, 160, 0.1)' }}
                      >
                        <Text style={[s.input, { paddingTop: 12, color: form.province ? '#333' : '#A0A0A0' }]}>{form.province || 'Select Province'}</Text>
                        <Ionicons name="chevron-down" size={20} color="#1A4FA0" style={s.rightIcon} />
                      </Pressable>
                    </Field>
                  ) : null}
                  
                  {form.province ? (
                    <Field label="City / Municipality">
                      <TouchableOpacity style={s.inputRow} onPress={() => { setPickType('city'); setLocationModal(true); }}>
                        <Text style={[s.input, { paddingTop: 12, color: form.city ? '#333' : '#A0A0A0' }]}>{form.city || 'Select City / Municipality'}</Text>
                        <Ionicons name="chevron-down" size={20} color="#1A4FA0" style={s.rightIcon} />
                      </TouchableOpacity>
                    </Field>
                  ) : null}

                  {form.city ? (
                    <Field label="Barangay">
                      <TouchableOpacity style={s.inputRow} onPress={() => { setPickType('barangay'); setLocationModal(true); }}>
                        <Text style={[s.input, { paddingTop: 12, color: form.barangay ? '#333' : '#A0A0A0' }]}>{form.barangay || 'Select Barangay'}</Text>
                        <Ionicons name="chevron-down" size={20} color="#1A4FA0" style={s.rightIcon} />
                      </TouchableOpacity>
                    </Field>
                  ) : null}

                  <View style={s.footer}>
                    <Text style={s.stepNum}>1 / 2</Text>
                    <View style={{ flexDirection:'row' }}>
                      <RippleButton
                        title="Back"
                        onPress={() => router.replace('/welcome')}
                        style={s.outlineBtn}
                        textStyle={s.outlineBtnText}
                        rippleColor="rgba(26, 79, 160, 0.15)"
                      />
                      <RippleButton
                        title="Next"
                        disabled={!isStep1Valid}
                        onPress={() => setStep(2)}
                        style={s.nextBtn}
                        textStyle={s.nextBtnText}
                      />
                    </View>
                  </View>
                </View>

              ) : (
                <View>
                  <Text style={s.stepTitle}>Account Security</Text>

                  <Field label="Password">
                    <IconInput icon="key" placeholder="Password" value={form.password} onChange={(v: string) => set('password', v)} secure={showPwReg} onToggleSecure={() => setShowPwReg(p => !p)} />
                  </Field>
                  <Field label="Confirm Password">
                    <IconInput icon="key" placeholder="Confirm Password" value={form.confirmPassword} onChange={(v: string) => set('confirmPassword', v)} secure={showConfirm} onToggleSecure={() => setShowConfirm(p => !p)} />
                  </Field>

                  <View style={s.checkRow}>
                    <TouchableOpacity onPress={() => setAgreedTerms(p => !p)}>
                      <MaterialCommunityIcons name={agreedTerms ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color="#1A4FA0" />
                    </TouchableOpacity>
                    <Text style={s.checkText}>I agree to the <Text style={s.link}>Terms of Service and Data Privacy Policy</Text></Text>
                  </View>

                  <View style={s.checkRow}>
                    <TouchableOpacity onPress={() => setAgreedPromos(p => !p)}>
                      <MaterialCommunityIcons name={agreedPromos ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color="#1A4FA0" />
                    </TouchableOpacity>
                    <Text style={s.checkText}>I consent to receive ride updates and promotions</Text>
                  </View>

                  <RippleButton
                    title="Submit Registration"
                    disabled={!isStep2Valid}
                    onPress={handleRegisterSubmit}
                    style={s.submitBtn}
                    textStyle={s.submitBtnText}
                  />
                  <RippleButton
                    title="Back"
                    onPress={() => setStep(1)}
                    style={s.backStepBtn}
                    textStyle={s.backStepBtnText}
                  />
                  <Text style={[s.stepNum, { marginTop: 20 }]}>2 / 2</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Location modal */}
      <LocationModal
        visible={locationModal}
        type={pickType}
        region={form.region}
        province={form.province}
        city={form.city}
        onSelect={(val: string) => {
          if (pickType === 'region') {
            setForm(f => ({ ...f, region: val, province: '', city: '', barangay: '' }));
          } else if (pickType === 'province') {
            setForm(f => ({ ...f, province: val, city: '', barangay: '' }));
          } else if (pickType === 'city') {
            setForm(f => ({ ...f, city: val, barangay: '' }));
          } else if (pickType === 'barangay') {
            set('barangay', val);
          }
          setLocationModal(false);
        }}
        onClose={() => setLocationModal(false)}
      />
    </SafeAreaView>
  );
}

const BLUE = '#1A4FA0';
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE },
  hero:      { backgroundColor: BLUE, paddingTop: 12, paddingBottom: 24, alignItems: 'center' },
  back:      { position: 'absolute', top: 16, left: 20, zIndex: 10, padding: 6 },
  logoCard:  { backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12, alignItems: 'center', marginTop: 8, elevation: 5 },
  tagline:   { fontSize: 9, fontWeight: '700', color: '#222', letterSpacing: 1.2, marginTop: 2 },
  sheet:     { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  scroll:    { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 50 },

  loginTitle: { fontSize: 32, fontWeight: 'bold', color: BLUE, marginBottom: 6 },
  loginSub:   { fontSize: 14, color: '#333', marginBottom: 28 },
  forgot:     { alignItems: 'flex-end', marginTop: 4, marginBottom: 28 },
  forgotText: { color: BLUE, fontSize: 15, fontWeight: '700' },
  primaryBtn: { backgroundColor: BLUE, borderRadius: 28, paddingVertical: 15, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },

  label:    { fontSize: 16, color: '#000', fontWeight: '500', marginBottom: 5, marginTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#A2C2E7', borderRadius: 10, height: 48, overflow: 'hidden', backgroundColor: '#FFF' },
  iconBox:  { width: 44, height: '100%', backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  input:    { flex: 1, height: '100%', paddingHorizontal: 12, fontSize: 16, color: '#333' },
  rightIcon:{ paddingHorizontal: 12 },
  ageInput: { borderWidth: 1.5, borderColor: '#A2C2E7', borderRadius: 10, height: 48, backgroundColor: '#F5F5F5', color: '#333', textAlign: 'center' },

  dobRow:         { flexDirection: 'row', alignItems: 'flex-end', marginTop: 14 },
  dobBox:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#A2C2E7', borderRadius: 10, height: 48, paddingHorizontal: 12 },
  dobValue:       { fontSize: 15, color: '#333' },
  dobPlaceholder: { fontSize: 15, color: '#A0A0A0' },

  iosOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  iosCard:    { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  iosHeader:  { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  iosCancel:  { fontSize: 16, color: '#999' },
  iosDone:    { fontSize: 16, color: BLUE, fontWeight: '700' },

  badge:     { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: 8 },
  badgeText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#000', textAlign: 'center', marginBottom: 8 },

  footer:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 },
  stepNum:      { fontSize: 16, fontWeight: '600', color: '#333' },
  outlineBtn:   { borderWidth: 1.5, borderColor: BLUE, borderRadius: 8, paddingHorizontal: 22, paddingVertical: 8, marginRight: 10 },
  outlineBtnText:{ color: BLUE, fontSize: 15, fontWeight: '600' },
  nextBtn:      { backgroundColor: BLUE, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 9 },
  nextBtnText:  { color: '#FFF', fontSize: 15, fontWeight: '600' },

  checkRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  checkText: { flex: 1, marginLeft: 8, fontSize: 13, color: '#333' },
  link:      { color: BLUE, textDecorationLine: 'underline' },

  submitBtn:     { backgroundColor: '#4CAF82', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 36 },
  submitBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  backStepBtn:   { backgroundColor: BLUE, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  backStepBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalBox:     { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', color: BLUE, marginBottom: 12, textAlign: 'center' },
  modalItem:    { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalItemText:{ fontSize: 15, color: '#333' },
  modalClose:   { backgroundColor: BLUE, borderRadius: 8, paddingVertical: 10, marginTop: 14, alignItems: 'center' },
  modalCloseText:{ color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});
