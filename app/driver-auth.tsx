// app/driver-auth.tsx
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image, Modal, Platform, ScrollView,
  StyleSheet, Text, TextInput, View, Pressable, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RippleButton from '../components/RippleButton';
import { useAuth } from './_layout';
import { registerDriver, loginDriver } from '../utils/mockDb';
import { Swal } from '../components/Swal';

// ─── PH regions data (shared) ─────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcAge = (dob: Date): number => {
  const t = new Date();
  let a = t.getFullYear() - dob.getFullYear();
  const m = t.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) a--;
  return Math.max(0, a);
};
const fmtDate = (d: Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
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


// ─── Icon Input ───────────────────────────────────────────────────────────────
function IconInput({icon,placeholder,value,onChange,keyboard,secure,onToggleSecure,editable=true}: any) {
  return (
    <View style={s.inputRow}>
      <View style={s.iconBox}><FontAwesome name={icon} size={18} color="#FFF" /></View>
      <TextInput style={s.input} placeholder={placeholder} placeholderTextColor="#A0A0A0"
        value={value} onChangeText={onChange} keyboardType={keyboard}
        secureTextEntry={secure} editable={editable} />
      {onToggleSecure && (
        <TouchableOpacity onPress={onToggleSecure} style={s.rightIcon}>
          <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={20} color="#555" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Calendar picker (works for DOB, license issued, license expiry) ──────────
function DateField({ label, value, onChange, maxDate }: { label:string; value:Date|null; onChange:(d:Date)=>void; maxDate?:Date }) {
  const [show, setShow]   = useState(false);
  
  const isDob = label.toLowerCase().includes('birth');
  const defaultDate = isDob ? new Date(2000, 0, 1) : new Date();
  
  const [temp, setTemp]   = useState(value ?? defaultDate);
  const [ios, setIos]     = useState(false);

  const open = () => {
    if (Platform.OS === 'ios') {
      setIos(true);
    } else if (Platform.OS === 'android') {
      setShow(true);
    }
  };

  // Sync temp when value updates
  useState(() => {
    if (value) {
      setTemp(value);
    } else {
      setTemp(defaultDate);
    }
  });

  return (
    <>
      <Text style={s.label}>{label}</Text>
      {Platform.OS === 'web' ? (
        <View style={s.dobBox}>
          <input
            type="date"
            value={value ? value.toISOString().split('T')[0] : ''}
            max={maxDate ? maxDate.toISOString().split('T')[0] : undefined}
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
          <Text style={value ? s.dobValue : s.dobPlaceholder}>{value ? fmtDate(value) : 'MM/DD/YYYY'}</Text>
          <FontAwesome name="calendar" size={16} color="#1A4FA0" />
        </Pressable>
      )}

      {show && Platform.OS==='android' && (
        <DateTimePicker value={temp} mode="date" display="default" maximumDate={maxDate ?? new Date()}
          onChange={(_:DateTimePickerEvent, d?:Date) => {
            setShow(false);
            if(d) {
              onChange(d);
              setTemp(d);
            }
          }} />
      )}
      {ios && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={ios} onRequestClose={() => setIos(false)}>
          <View style={s.iosOverlay}>
            <View style={s.iosCard}>
              <View style={s.iosHeader}>
                <TouchableOpacity onPress={() => setIos(false)}><Text style={s.iosCancel}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => { onChange(temp); setIos(false); }}><Text style={s.iosDone}>Done</Text></TouchableOpacity>
              </View>
              <DateTimePicker value={temp} mode="date" display="spinner" maximumDate={maxDate ?? new Date()}
                onChange={(_:DateTimePickerEvent, d?:Date) => { if(d) setTemp(d); }} />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

// ─── Location modal ───────────────────────────────────────────────────────────
function LocationModal({visible,type,region,onSelect,onClose}: any) {
  const items = type==='region' ? REGIONS.map(r=>r.name) : REGIONS.find(r=>r.name===region)?.provinces??[];
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalBox}>
          <Text style={s.modalTitle}>{type==='region'?'Select Region':'Select Province'}</Text>
          <ScrollView style={{maxHeight:300}}>
            {items.map((item,i) => (
              <TouchableOpacity key={i} style={s.modalItem} onPress={() => onSelect(item)}>
                <Text style={s.modalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.modalClose} onPress={onClose}><Text style={s.modalCloseText}>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DriverAuthScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { mode } = useLocalSearchParams<{ mode:'login'|'register' }>();
  const isLogin = mode === 'login';

  // Login
  const [loginPhone, setLoginPhone]   = useState('');
  const [loginPw, setLoginPw]         = useState('');
  const [showLoginPw, setShowLoginPw] = useState(true);

  // Registration
  const [step, setStep]           = useState(1);
  const [dobDate, setDobDate]     = useState<Date|null>(null);
  const [issuedDate, setIssued]   = useState<Date|null>(null);
  const [expiryDate, setExpiry]   = useState<Date|null>(null);
  const [locModal, setLocModal]   = useState(false);
  const [pickType, setPickType]   = useState<'region'|'province'>('region');
  const [showPw, setShowPw]       = useState(true);
  const [showCPw, setShowCPw]     = useState(true);
  const [agreedTerms, setTerms]   = useState(false);
  const [agreedGps, setGps]       = useState(false);

  // Document Upload State
  const [uploadedDocs, setUploadedDocs] = useState({
    licenseFront: false,
    licenseBack: false,
    nbi: false,
    selfie: false,
  });

  const [form, setForm] = useState({
    username:'', name:'', phone:'', email:'',
    region:'', province:'', city_barangay:'',
    license_number:'', shift:'Morning',
    password:'', confirmPassword:'',
  });
  const set = (k:string, v:string) => setForm(f => ({...f, [k]:v}));

  const age    = dobDate ? String(calcAge(dobDate)) : '';

  // Validation helpers
  const isEmailValid = (e: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e.trim());
  };

  const isPhoneValid = (p: string) => {
    const cleaned = p.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const isStep1Valid =
    form.username.trim().length > 0 &&
    dobDate !== null &&
    calcAge(dobDate) >= 18 &&
    isPhoneValid(form.phone) &&
    isEmailValid(form.email);

  const isStep2Valid =
    form.region.trim().length > 0 &&
    form.province.trim().length > 0 &&
    form.city_barangay.trim().length > 0;

  const isStep3Valid =
    form.license_number.trim().length > 0 &&
    issuedDate !== null &&
    expiryDate !== null &&
    expiryDate.getTime() > issuedDate.getTime();

  const isStep4Valid =
    uploadedDocs.licenseFront &&
    uploadedDocs.licenseBack &&
    uploadedDocs.nbi &&
    uploadedDocs.selfie;

  const isStep5Valid =
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    agreedTerms &&
    agreedGps;

  const isLoginValid =
    isPhoneValid(loginPhone) &&
    loginPw.length > 0;

  const handleLoginSubmit = async () => {
    if (!isLoginValid) return;
    try {
      const driver = await loginDriver(loginPhone, loginPw);
      await login({
        role: 'driver',
        ...driver
      });
      router.replace('/(driver-tabs)/home');
    } catch (err: any) {
      Swal.fire({ title: 'Login Failed', text: err.message || 'Login failed.', icon: 'error' });
    }
  };

  const handleRegisterSubmit = async () => {
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid || !isStep5Valid) return;
    try {
      const fullAddress = `${form.city_barangay}, ${form.province}, ${form.region}`;
      const driverData = {
        username: form.username.trim(),
        name: form.name.trim() || form.username.trim(),
        birth_date: dobDate ? dobDate.toISOString().split('T')[0] : '',
        age: age,
        phone: form.phone.trim(),
        email: form.email.trim(),
        region: form.region,
        province: form.province,
        city_barangay: form.city_barangay,
        address: fullAddress,
        license_number: form.license_number.trim(),
        license_issued: issuedDate ? issuedDate.toISOString().split('T')[0] : '',
        license_expiry: expiryDate ? expiryDate.toISOString().split('T')[0] : '',
        shift: form.shift,
        password: form.password,
        created_at: '', // Will be set by registerDriver()
      };

      await registerDriver(driverData);
      await login({
        role: 'driver',
        ...driverData
      });
      Swal.fire({ title: 'Success!', text: 'Registration successful! Welcome to DeviceGNS.', icon: 'success' });
      router.replace('/(driver-tabs)/home');
    } catch (err: any) {
      Swal.fire({ title: 'Registration Failed', text: err.message || 'Registration failed.', icon: 'error' });
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="light" />

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

      <View style={s.sheet}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── LOGIN ── */}
          {isLogin ? (
            <View>
              <Text style={s.loginTitle}>Sign in to your Account</Text>
              <Text style={s.loginSub}>Enter your phone number and password to log in</Text>
              <Text style={s.label}>Phone Number</Text>
              <IconInput icon="phone" placeholder="Phone Number" value={loginPhone} onChange={setLoginPhone} keyboard="phone-pad" />
              <Text style={s.label}>Password</Text>
              <IconInput icon="key" placeholder="Password" value={loginPw} onChange={setLoginPw} secure={showLoginPw} onToggleSecure={() => setShowLoginPw(p=>!p)} />
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
              <View style={s.badge}><Text style={s.badgeText}>Driver Registration</Text></View>

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <View>
                  <Text style={s.stepTitle}>Basic Information</Text>
                  <Text style={s.label}>Username</Text>
                  <IconInput icon="user" placeholder="Username" value={form.username} onChange={(v:string)=>set('username',v)} />
                  <Text style={s.label}>Full Name (Optional)</Text>
                  <IconInput icon="user" placeholder="Full Name" value={form.name} onChange={(v:string)=>set('name',v)} />

                  {/* DOB with auto age */}
                  <View style={s.dobRow}>
                    <View style={{flex:1.4, marginRight:10}}>
                      <DateField label="Date of Birth" value={dobDate} onChange={setDobDate} maxDate={new Date()} />
                    </View>
                    <View style={{flex:1}}>
                      <Text style={s.label}>Age</Text>
                      <TextInput style={[s.input, s.ageBox]} value={age} editable={false} placeholder="--" placeholderTextColor="#A0A0A0" />
                    </View>
                  </View>

                  <Text style={s.label}>Phone Number</Text>
                  <IconInput icon="phone" placeholder="Phone Number (e.g. 09123456789)" value={form.phone} onChange={(v:string)=>set('phone',v)} keyboard="phone-pad" />
                  <Text style={s.label}>Email Address</Text>
                  <IconInput icon="envelope" placeholder="Email Address" value={form.email} onChange={(v:string)=>set('email',v)} keyboard="email-address" />
                </View>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <View>
                  <Text style={s.stepTitle}>Location</Text>
                  <Text style={s.label}>Region</Text>
                  <TouchableOpacity style={s.inputRow} onPress={() => { setPickType('region'); setLocModal(true); }}>
                    <Text style={[s.input,{paddingTop:12,color:form.region?'#333':'#A0A0A0'}]}>{form.region||'Select Region'}</Text>
                    <Ionicons name="chevron-down" size={20} color="#1A4FA0" style={s.rightIcon} />
                  </TouchableOpacity>
                  <Text style={s.label}>Province</Text>
                  <TouchableOpacity style={s.inputRow} onPress={() => { if(form.region){setPickType('province');setLocModal(true);} }}>
                    <Text style={[s.input,{paddingTop:12,color:form.province?'#333':'#A0A0A0'}]}>{form.province||'Select Province'}</Text>
                    <Ionicons name="chevron-down" size={20} color="#1A4FA0" style={s.rightIcon} />
                  </TouchableOpacity>
                  <Text style={s.label}>City / Barangay</Text>
                  <View style={[s.inputRow,{borderLeftWidth:4,borderLeftColor:'#1A4FA0'}]}>
                    <TextInput style={s.input} placeholder="Enter city, barangay, street" placeholderTextColor="#A0A0A0"
                      value={form.city_barangay} onChangeText={v=>set('city_barangay',v)} />
                  </View>
                </View>
              )}

              {/* Step 3: License */}
              {step === 3 && (
                <View>
                  <Text style={s.stepTitle}>{"Driver's License Details"}</Text>
                  <Text style={s.label}>License Number</Text>
                  <IconInput icon="id-card" placeholder="License Number" value={form.license_number} onChange={(v:string)=>set('license_number',v)} />
                  <DateField label="Date Issued" value={issuedDate} onChange={setIssued} maxDate={new Date()} />
                  <DateField label="Expiry Date" value={expiryDate} onChange={setExpiry} />
                  <Text style={s.label}>Preferred Shift</Text>
                  <View style={{flexDirection:'row',gap:10,marginTop:4}}>
                    {['Morning','Evening','Night'].map(sh => (
                      <Pressable
                        key={sh}
                        onPress={() => set('shift',sh)}
                        style={({ pressed }) => [
                          s.shiftBtn,
                          form.shift===sh && s.shiftActive,
                          Platform.OS === 'ios' && pressed && { opacity: 0.8 }
                        ]}
                        android_ripple={{ color: 'rgba(26, 79, 160, 0.15)' }}
                      >
                        <Text style={[s.shiftText, form.shift===sh && s.shiftTextActive]}>{sh}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Step 4: Documents */}
              {step === 4 && (
                <View>
                  <Text style={s.stepTitle}>Document Upload</Text>
                  {[
                    { label: 'License (Front)', key: 'licenseFront' },
                    { label: 'License (Back)', key: 'licenseBack' },
                    { label: 'NBI Clearance', key: 'nbi' },
                    { label: 'Selfie with License', key: 'selfie' },
                  ].map((doc) => {
                    const isUploaded = uploadedDocs[doc.key as keyof typeof uploadedDocs];
                    return (
                      <View key={doc.key} style={{marginTop:14}}>
                        <Text style={s.label}>{doc.label}</Text>
                        <TouchableOpacity
                          style={[s.uploadBox, isUploaded && { borderColor: '#4CAF82', backgroundColor: '#EBF7F2' }]}
                          onPress={() => setUploadedDocs(prev => ({ ...prev, [doc.key]: true }))}
                        >
                          <Ionicons
                            name={isUploaded ? "checkmark-circle-outline" : "cloud-upload-outline"}
                            size={28}
                            color={isUploaded ? "#4CAF82" : "#1A4FA0"}
                          />
                          <Text style={[s.uploadText, isUploaded && { color: '#4CAF82' }]}>
                            {isUploaded ? "Uploaded Successfully" : "Tap to upload"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Step 5: Password */}
              {step === 5 && (
                <View>
                  <Text style={s.stepTitle}>Account Security</Text>
                  <Text style={s.label}>Password</Text>
                  <IconInput icon="key" placeholder="Password (min 6 characters)" value={form.password} onChange={(v:string)=>set('password',v)} secure={showPw} onToggleSecure={() => setShowPw(p=>!p)} />
                  <Text style={s.label}>Confirm Password</Text>
                  <IconInput icon="key" placeholder="Confirm Password" value={form.confirmPassword} onChange={(v:string)=>set('confirmPassword',v)} secure={showCPw} onToggleSecure={() => setShowCPw(p=>!p)} />

                  <View style={s.checkRow}>
                    <TouchableOpacity onPress={() => setTerms(p=>!p)}>
                      <MaterialCommunityIcons name={agreedTerms?'checkbox-marked':'checkbox-blank-outline'} size={24} color="#1A4FA0" />
                    </TouchableOpacity>
                    <Text style={s.checkText}>I agree to the <Text style={s.link}>Terms of Service and Data Privacy Policy</Text></Text>
                  </View>
                  <View style={s.checkRow}>
                    <TouchableOpacity onPress={() => setGps(p=>!p)}>
                      <MaterialCommunityIcons name={agreedGps?'checkbox-marked':'checkbox-blank-outline'} size={24} color="#1A4FA0" />
                    </TouchableOpacity>
                    <Text style={s.checkText}>I consent to GPS location tracking while on duty</Text>
                  </View>

                  <RippleButton
                    title="Submit Registration"
                    disabled={!isStep5Valid}
                    onPress={handleRegisterSubmit}
                    style={s.submitBtn}
                    textStyle={s.submitBtnText}
                  />
                </View>
              )}

              {/* Navigation footer */}
              <View style={s.footer}>
                <Text style={s.stepNum}>{step} / 5</Text>
                <View style={{flexDirection:'row'}}>
                  <RippleButton
                    title="Back"
                    onPress={() => step===1 ? router.replace('/welcome') : setStep(p=>p-1)}
                    style={s.outlineBtn}
                    textStyle={s.outlineBtnText}
                    rippleColor="rgba(26, 79, 160, 0.15)"
                  />
                  {step < 5 && (
                    (() => {
                      let isNextDisabled = true;
                      if (step === 1) isNextDisabled = !isStep1Valid;
                      else if (step === 2) isNextDisabled = !isStep2Valid;
                      else if (step === 3) isNextDisabled = !isStep3Valid;
                      else if (step === 4) isNextDisabled = !isStep4Valid;

                      return (
                        <RippleButton
                          title="Next"
                          disabled={isNextDisabled}
                          onPress={() => setStep(p => p + 1)}
                          style={s.nextBtn}
                          textStyle={s.nextBtnText}
                        />
                      );
                    })()
                  )}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <LocationModal
        visible={locModal}
        type={pickType}
        region={form.region}
        onSelect={(val:string) => {
          if(pickType==='region') { set('region',val); set('province',''); }
          else set('province',val);
          setLocModal(false);
        }}
        onClose={() => setLocModal(false)}
      />
    </SafeAreaView>
  );
}

const BLUE = '#1A4FA0';
const s = StyleSheet.create({
  container: { flex:1, backgroundColor:BLUE },
  hero:      { backgroundColor:BLUE, paddingTop:12, paddingBottom:24, alignItems:'center' },
  back:      { position:'absolute', top:16, left:20, zIndex:10, padding:6 },
  logoCard:  { backgroundColor:'#FFF', borderRadius:8, paddingHorizontal:24, paddingVertical:12, alignItems:'center', marginTop:8, elevation:5 },
  logoImage: { width:170, height:65 },
  sheet:     { flex:1, backgroundColor:'#FFF', borderTopLeftRadius:32, borderTopRightRadius:32, overflow:'hidden' },
  scroll:    { paddingHorizontal:24, paddingTop:28, paddingBottom:50 },

  loginTitle: { fontSize:32, fontWeight:'bold', color:BLUE, marginBottom:6 },
  loginSub:   { fontSize:14, color:'#333', marginBottom:28 },
  forgot:     { alignItems:'flex-end', marginTop:4, marginBottom:28 },
  forgotText: { color:BLUE, fontSize:15, fontWeight:'700' },
  primaryBtn: { backgroundColor:BLUE, borderRadius:28, paddingVertical:15, alignItems:'center' },
  primaryBtnText: { color:'#FFF', fontSize:22, fontWeight:'bold' },

  label:    { fontSize:16, color:'#000', fontWeight:'500', marginBottom:5, marginTop:12 },
  inputRow: { flexDirection:'row', alignItems:'center', borderWidth:1.5, borderColor:'#A2C2E7', borderRadius:10, height:48, overflow:'hidden', backgroundColor:'#FFF' },
  iconBox:  { width:44, height:'100%', backgroundColor:BLUE, justifyContent:'center', alignItems:'center' },
  input:    { flex:1, height:'100%', paddingHorizontal:12, fontSize:16, color:'#333' },
  rightIcon:{ paddingHorizontal:12 },

  dobRow:         { flexDirection:'row', alignItems:'flex-end', marginTop:4 },
  dobBox:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1.5, borderColor:'#A2C2E7', borderRadius:10, height:48, paddingHorizontal:12 },
  dobValue:       { fontSize:15, color:'#333' },
  dobPlaceholder: { fontSize:15, color:'#A0A0A0' },
  ageBox:         { borderWidth:1.5, borderColor:'#A2C2E7', borderRadius:10, height:48, backgroundColor:'#F5F5F5', textAlign:'center', flex:undefined as any },

  iosOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  iosCard:    { backgroundColor:'#FFF', borderTopLeftRadius:20, borderTopRightRadius:20, paddingBottom:30 },
  iosHeader:  { flexDirection:'row', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#EEE' },
  iosCancel:  { fontSize:16, color:'#999' },
  iosDone:    { fontSize:16, color:BLUE, fontWeight:'700' },

  badge:     { backgroundColor:BLUE, borderRadius:12, paddingVertical:10, alignItems:'center', marginBottom:8 },
  badgeText: { color:'#FFF', fontSize:20, fontWeight:'bold' },
  stepTitle: { fontSize:16, fontWeight:'600', color:'#000', textAlign:'center', marginBottom:8 },

  shiftBtn:       { flex:1, borderWidth:1.5, borderColor:'#A2C2E7', borderRadius:8, paddingVertical:8, alignItems:'center' },
  shiftActive:    { backgroundColor:BLUE, borderColor:BLUE },
  shiftText:      { fontSize:12, color:'#555', fontWeight:'600' },
  shiftTextActive:{ color:'#FFF' },

  uploadBox:  { borderWidth:2, borderColor:'#A2C2E7', borderStyle:'dashed', borderRadius:10, height:80, justifyContent:'center', alignItems:'center', gap:6 },
  uploadText: { color:'#1A4FA0', fontSize:14, fontWeight:'600' },

  footer:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:28 },
  stepNum:      { fontSize:16, fontWeight:'600', color:'#333' },
  outlineBtn:   { borderWidth:1.5, borderColor:BLUE, borderRadius:8, paddingHorizontal:22, paddingVertical:8, marginRight:10 },
  outlineBtnText:{ color:BLUE, fontSize:15, fontWeight:'600' },
  nextBtn:      { backgroundColor:BLUE, borderRadius:8, paddingHorizontal:24, paddingVertical:9 },
  nextBtnText:  { color:'#FFF', fontSize:15, fontWeight:'600' },

  checkRow:  { flexDirection:'row', alignItems:'center', marginTop:16 },
  checkText: { flex:1, marginLeft:8, fontSize:13, color:'#333' },
  link:      { color:BLUE, textDecorationLine:'underline' },

  submitBtn:     { backgroundColor:'#4CAF82', borderRadius:10, paddingVertical:14, alignItems:'center', marginTop:36 },
  submitBtnText: { color:'#FFF', fontSize:20, fontWeight:'bold' },

  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:24 },
  modalBox:     { backgroundColor:'#FFF', borderRadius:16, padding:20 },
  modalTitle:   { fontSize:18, fontWeight:'bold', color:BLUE, marginBottom:12, textAlign:'center' },
  modalItem:    { paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#EEE' },
  modalItemText:{ fontSize:15, color:'#333' },
  modalClose:   { backgroundColor:BLUE, borderRadius:8, paddingVertical:10, marginTop:14, alignItems:'center' },
  modalCloseText:{ color:'#FFF', fontSize:15, fontWeight:'bold' },
});
