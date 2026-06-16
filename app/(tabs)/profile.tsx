import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { usePassengerData, useAuth } from '../_layout';

function calcAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}


export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setProfile } = usePassengerData();
  const { logout, updateSessionProfile } = useAuth();

  // Mode: view or edit
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Basic' | 'Password'>('Basic');

  // Local editing states
  const [editForm, setEditForm] = useState({ ...profile });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  // Dropdown/Picker modals
  const [genderModal, setGenderModal] = useState(false);
  const [dobPickerShow, setDobPickerShow] = useState(false);
  const [dobTempDate, setDobTempDate] = useState<Date>(new Date(profile.birth_date));
  const [iosDobModal, setIosDobModal] = useState(false);

  // Field change helper
  const handleFieldChange = (key: string, val: string) => {
    setEditForm(prev => ({ ...prev, [key]: val }));
  };

  // DOB change handlers
  const openDobPicker = () => {
    setDobTempDate(new Date(editForm.birth_date));
    if (Platform.OS === 'ios') {
      setIosDobModal(true);
    } else if (Platform.OS === 'android') {
      setDobPickerShow(true);
    }
  };

  const onAndroidDobChange = (_: DateTimePickerEvent, d?: Date) => {
    setDobPickerShow(false);
    if (d) {
      const formattedDate = d.toISOString().split('T')[0];
      const ageStr = String(calcAge(d));
      setEditForm(prev => ({ ...prev, birth_date: formattedDate, age: ageStr }));
    }
  };

  const onIosDobChange = (_: DateTimePickerEvent, d?: Date) => {
    if (d) {
      setDobTempDate(d);
    }
  };

  const saveIosDob = () => {
    const formattedDate = dobTempDate.toISOString().split('T')[0];
    const ageStr = String(calcAge(dobTempDate));
    setEditForm(prev => ({ ...prev, birth_date: formattedDate, age: ageStr }));
    setIosDobModal(false);
  };

  // Actions
  const handleEnterEdit = () => {
    setEditForm({ ...profile });
    setPasswordForm({ current: '', new: '', confirm: '' });
    setActiveTab('Basic');
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (activeTab === 'Basic') {
      if (!editForm.username.trim() || !editForm.phone.trim() || !editForm.email.trim()) {
        alert('Please fill out all required fields.');
        return;
      }
      try {
        // Save basic info changes
        setProfile(editForm);
        await updateSessionProfile(editForm);
        alert('Profile updated successfully!');
        setIsEditing(false);
      } catch (err: any) {
        alert(err.message || 'Failed to update profile.');
      }
    } else {
      // Save password change
      if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
        alert('Please complete all password fields.');
        return;
      }
      if (passwordForm.new !== passwordForm.confirm) {
        alert('New passwords do not match.');
        return;
      }
      alert('Password updated successfully!');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogout = async () => {
    // Clear session details / go back to welcome screen
    try {
      await logout();
      alert('Logged out successfully.');
      router.replace('/welcome');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A4FA0" />

      {/* ── VIEW PROFILE MODE ── */}
      {!isEditing ? (
        <View style={{ flex: 1 }}>
          {/* Blue Grid Header matching DDGNS screenshot */}
          <View style={s.gridHeader}>
            {/* Grid Lines */}
            <View style={StyleSheet.absoluteFill}>
              {/* Horizontal Lines */}
              <View style={[s.gridLineH, { top: '20%' }]} />
              <View style={[s.gridLineH, { top: '40%' }]} />
              <View style={[s.gridLineH, { top: '60%' }]} />
              <View style={[s.gridLineH, { top: '80%' }]} />
              
              {/* Vertical Lines */}
              {Array.from({ length: 12 }).map((_, i) => (
                <View key={i} style={[s.gridLineV, { left: `${(i + 1) * 8.3}%` }]} />
              ))}
            </View>

            <View style={s.headerContent}>
              <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={s.headerTitle}>Profile</Text>
            </View>
          </View>

          {/* White Card Body */}
          <View style={s.whiteCard}>
            <ScrollView contentContainerStyle={s.viewScroll} showsVerticalScrollIndicator={false}>
              {/* Avatar with edit icon */}
              <View style={s.avatarSection}>
                <View style={s.avatarContainer}>
                  <View style={s.avatarCircle}>
                    <Image 
                      source={require('../../assets/images/prof icon.png')} 
                      style={s.avatarImage} 
                    />
                  </View>
                  {/* Edit icon overlay */}
                  <View style={s.editIconCircle}>
                    <Ionicons name="pencil" size={16} color="#1A4FA0" />
                  </View>
                </View>

                {/* Name and role */}
                <Text style={s.profileName}>{profile.name || profile.username}</Text>
                <Text style={s.profileRole}>Passenger</Text>
              </View>

              {/* Action Buttons matching DDGNS - outlined style */}
              <View style={s.buttonSection}>
                <TouchableOpacity style={s.outlinedButton} onPress={handleEnterEdit} activeOpacity={0.7}>
                  <Text style={s.outlinedButtonText}>Personal Info</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.outlinedButton} onPress={handleLogout} activeOpacity={0.7}>
                  <Text style={s.outlinedButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      ) : (
        
        // ── EDIT PROFILE MODE (Based on Image 2, 3) ──
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
          {/* Logo Header Banner */}
          <View style={s.logoHeader}>
            <View style={s.logoCard}>
              <Text style={s.logoText}>
                <Text style={{ color: '#1A4FA0', fontSize: 24, fontWeight: '900' }}>Anti</Text>
                <Text style={{ color: '#22AA44', fontSize: 24, fontWeight: '900' }}>gravity</Text>
              </Text>
              <Text style={s.tagline}>SMART & GREEN RIDE-SHARING</Text>
            </View>
          </View>

          {/* Form Tabs Layout */}
          <View style={s.tabsHeaderRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[s.tabButton, activeTab === 'Basic' ? s.tabActive : s.tabInactive]}
              onPress={() => setActiveTab('Basic')}
            >
              <Text style={[s.tabButtonText, activeTab === 'Basic' ? s.tabActiveText : s.tabInactiveText]}>
                Basic Information
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[s.tabButton, activeTab === 'Password' ? s.tabActive : s.tabInactive]}
              onPress={() => setActiveTab('Password')}
            >
              <Text style={[s.tabButtonText, activeTab === 'Password' ? s.tabActiveText : s.tabInactiveText]}>
                Password
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {activeTab === 'Basic' ? (
              // ── Basic Info Tab Form ──
              <View>
                {/* Username */}
                <Text style={s.label}>Username</Text>
                <View style={s.inputRow}>
                  <View style={s.iconBox}><FontAwesome name="user" size={16} color="#FFF" /></View>
                  <TextInput
                    style={s.input}
                    placeholder="Username"
                    value={editForm.username}
                    onChangeText={v => handleFieldChange('username', v)}
                  />
                </View>

                {/* Full Name */}
                <Text style={s.label}>Full Name</Text>
                <View style={s.inputRow}>
                  <View style={s.iconBox}><FontAwesome name="user" size={16} color="#FFF" /></View>
                  <TextInput
                    style={s.input}
                    placeholder="Full Name"
                    value={editForm.name}
                    onChangeText={v => handleFieldChange('name', v)}
                  />
                </View>

                {/* Gender Dropdown */}
                <Text style={s.label}>Gender</Text>
                <TouchableOpacity
                  style={s.inputRow}
                  activeOpacity={0.8}
                  onPress={() => setGenderModal(true)}
                >
                  <Text style={[s.input, { paddingTop: 12, color: editForm.gender ? '#333' : '#A0A0A0' }]}>
                    {editForm.gender || 'Select Gender'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#1A4FA0" style={s.rightChevron} />
                </TouchableOpacity>

                {/* DOB & Age Row */}
                <View style={s.dobRow}>
                  <View style={{ flex: 1.4, marginRight: 10 }}>
                    <Text style={s.label}>Date of Birth</Text>
                    {Platform.OS === 'web' ? (
                      <View style={s.dobWebBox}>
                        <input
                          type="date"
                          value={editForm.birth_date}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            const d = e.target.value ? new Date(e.target.value) : null;
                            if (d && !isNaN(d.getTime())) {
                              const ageStr = String(calcAge(d));
                              setEditForm(prev => ({ ...prev, birth_date: e.target.value, age: ageStr }));
                            }
                          }}
                          style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '15px',
                            color: '#333',
                            backgroundColor: 'transparent',
                            fontFamily: 'inherit',
                            height: '100%',
                            width: '100%',
                          }}
                        />
                      </View>
                    ) : (
                      <TouchableOpacity style={s.dobBox} onPress={openDobPicker} activeOpacity={0.8}>
                        <Text style={s.dobValueText}>{editForm.birth_date}</Text>
                        <FontAwesome name="calendar" size={16} color="#1A4FA0" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.label}>Age</Text>
                    <TextInput
                      style={[s.input, s.disabledAgeBox]}
                      value={editForm.age}
                      editable={false}
                      placeholder="--"
                    />
                  </View>
                </View>

                {/* Phone Number */}
                <Text style={s.label}>Phone Number</Text>
                <View style={s.inputRow}>
                  <View style={s.iconBox}><FontAwesome name="phone" size={16} color="#FFF" /></View>
                  <TextInput
                    style={s.input}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    value={editForm.phone}
                    onChangeText={v => handleFieldChange('phone', v)}
                  />
                </View>

                {/* Email Address */}
                <Text style={s.label}>Email Address</Text>
                <View style={s.inputRow}>
                  <View style={s.iconBox}><FontAwesome name="envelope" size={14} color="#FFF" /></View>
                  <TextInput
                    style={s.input}
                    placeholder="Email Address"
                    keyboardType="email-address"
                    value={editForm.email}
                    onChangeText={v => handleFieldChange('email', v)}
                  />
                </View>

                {/* Region/Province/City/Barangay */}
                <Text style={s.label}>Region/Province/City/Barangay</Text>
                <View style={s.inputRow}>
                  <View style={s.iconBox}><FontAwesome name="home" size={16} color="#FFF" /></View>
                  <TextInput
                    style={s.input}
                    placeholder="Address Details"
                    value={editForm.address}
                    onChangeText={v => handleFieldChange('address', v)}
                  />
                </View>
              </View>
            ) : (
              
              // ── Password Tab Form ──
              <View>
                <Text style={s.label}>Current Password</Text>
                <View style={s.inputRow}>
                  <View style={s.iconBox}><FontAwesome name="key" size={16} color="#FFF" /></View>
                  <TextInput
                    style={s.input}
                    placeholder="Enter Current Password"
                    secureTextEntry
                    value={passwordForm.current}
                    onChangeText={v => setPasswordForm(p => ({ ...p, current: v }))}
                  />
                </View>

                <Text style={s.label}>New Password</Text>
                <View style={s.inputRow}>
                  <View style={s.iconBox}><FontAwesome name="key" size={16} color="#FFF" /></View>
                  <TextInput
                    style={s.input}
                    placeholder="Enter New Password"
                    secureTextEntry
                    value={passwordForm.new}
                    onChangeText={v => setPasswordForm(p => ({ ...p, new: v }))}
                  />
                </View>

                <Text style={s.label}>Confirm New Password</Text>
                <View style={s.inputRow}>
                  <View style={s.iconBox}><FontAwesome name="key" size={16} color="#FFF" /></View>
                  <TextInput
                    style={s.input}
                    placeholder="Confirm New Password"
                    secureTextEntry
                    value={passwordForm.confirm}
                    onChangeText={v => setPasswordForm(p => ({ ...p, confirm: v }))}
                  />
                </View>
              </View>
            )}

            {/* Form Actions Buttons */}
            <View style={s.formActions}>
              <TouchableOpacity
                style={s.saveButton}
                activeOpacity={0.8}
                onPress={handleUpdate}
              >
                <Text style={s.saveButtonText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.cancelButton}
                activeOpacity={0.8}
                onPress={handleCancel}
              >
                <Text style={s.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* ── Gender Selection Modal ── */}
      <Modal
        visible={genderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setGenderModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Select Gender</Text>
            {['Male', 'Female', 'Other'].map(g => (
              <TouchableOpacity
                key={g}
                style={s.modalItem}
                onPress={() => {
                  handleFieldChange('gender', g);
                  setGenderModal(false);
                }}
              >
                <Text style={s.modalItemText}>{g}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.modalClose} onPress={() => setGenderModal(false)}>
              <Text style={s.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Native Date Pickers ── */}
      {dobPickerShow && Platform.OS === 'android' && (
        <DateTimePicker
          value={dobTempDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onAndroidDobChange}
        />
      )}

      {iosDobModal && Platform.OS === 'ios' && (
        <Modal
          visible={iosDobModal}
          transparent
          animationType="slide"
          onRequestClose={() => setIosDobModal(false)}
        >
          <View style={s.iosOverlay}>
            <View style={s.iosCard}>
              <View style={s.iosHeader}>
                <TouchableOpacity onPress={() => setIosDobModal(false)}>
                  <Text style={s.iosCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveIosDob}>
                  <Text style={s.iosDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dobTempDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={onIosDobChange}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const BLUE = '#1A4FA0';

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE,
  },

  // ── VIEW MODE - DDGNS Style ──
  gridHeader: {
    height: 95,
    backgroundColor: BLUE,
    position: 'relative',
    justifyContent: 'center',
    paddingTop: 30,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
    gap: 8,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  whiteCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  viewScroll: {
    paddingTop: 40,
    paddingBottom: 120,
    alignItems: 'center',
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E3A6E',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  editIconCircle: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A2C2E7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  profileRole: {
    fontSize: 16,
    color: BLUE,
    fontWeight: '700',
    marginTop: 4,
  },

  // Buttons - DDGNS outlined style
  buttonSection: {
    width: '100%',
    paddingHorizontal: 30,
    gap: 14,
  },
  outlinedButton: {
    borderWidth: 2,
    borderColor: BLUE,
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  outlinedButtonText: {
    color: BLUE,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // EDIT MODE
  logoHeader: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: '#EAF1FB',
  },
  logoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoText: {
    lineHeight: 28,
  },
  tagline: {
    fontSize: 8,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 1,
    marginTop: 2,
  },
  tabsHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    backgroundColor: '#EAF1FB',
    paddingBottom: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  tabActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  tabInactive: {
    backgroundColor: '#FFF',
    borderColor: '#A2C2E7',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabActiveText: {
    color: '#FFF',
  },
  tabInactiveText: {
    color: BLUE,
  },
  formScroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A2C2E7',
    borderRadius: 10,
    height: 48,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  iconBox: {
    width: 44,
    height: '100%',
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
  },
  rightChevron: {
    paddingHorizontal: 12,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dobBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#A2C2E7',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  dobWebBox: {
    borderWidth: 1.5,
    borderColor: '#A2C2E7',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  dobValueText: {
    fontSize: 15,
    color: '#333',
  },
  disabledAgeBox: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    color: '#666',
    textAlign: 'center',
  },
  formActions: {
    marginTop: 36,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#73BE7E', // Premium accent green from reference
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#D02A30', // Premium accent red from reference
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BLUE,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalClose: {
    backgroundColor: BLUE,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 18,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // iOS date picker card
  iosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  iosCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  iosCancel: {
    fontSize: 16,
    color: '#999',
  },
  iosDone: {
    fontSize: 16,
    color: BLUE,
    fontWeight: '700',
  },
});
