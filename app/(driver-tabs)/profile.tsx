import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, Platform } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TabHeader } from './home';
import { useAuth } from '../_layout';

export default function DriverProfileScreen() {
  const router = useRouter();
  const { userSession, logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [personalInfoModalVisible, setPersonalInfoModalVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await logout();
      alert('Logged out successfully.');
      router.replace('/welcome');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A4FA0" />
      <TabHeader title="Profile" onBack={() => router.push('/(driver-tabs)/home')} />

      <View style={s.sheet}>
        <View style={s.profileContainer}>
          {/* Circular Driver Avatar */}
          <View style={s.avatarWrapper}>
            <View style={s.avatarImagePlaceholder}>
              {/* Formal photo silhouette representation */}
              <Ionicons name="person" size={80} color="#1A4FA0" />
            </View>
            {/* Floating Pencil Edit Icon */}
            <TouchableOpacity style={s.editPencilButton} activeOpacity={0.8}>
              <FontAwesome name="pencil" size={14} color="#1A4FA0" />
            </TouchableOpacity>
          </View>

          {/* Driver Name & Tag */}
          <Text style={s.driverName}>{userSession?.fullName || 'Mico'}</Text>
          <Text style={s.driverTag}>Driver</Text>

          {/* Action Buttons */}
          <View style={s.buttonContainer}>
            <TouchableOpacity 
              style={s.outlineButton} 
              activeOpacity={0.7}
              onPress={() => setPersonalInfoModalVisible(true)}
            >
              <Text style={s.outlineButtonText}>Personal Info</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={s.outlineButton} 
              activeOpacity={0.7}
              onPress={() => setLogoutModalVisible(true)}
            >
              <Text style={s.outlineButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Personal Info Modal (Realistic extra feature for premium feel) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={personalInfoModalVisible}
        onRequestClose={() => setPersonalInfoModalVisible(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.infoCard}>
            <View style={s.infoCardHeader}>
              <Text style={s.infoCardTitle}>Personal Information</Text>
              <TouchableOpacity onPress={() => setPersonalInfoModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Full Name</Text>
              <Text style={s.infoVal}>{userSession?.fullName || 'Mico Francis P. Marin'}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Role</Text>
              <Text style={s.infoVal}>Licensed Professional Driver</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Phone Number</Text>
              <Text style={s.infoVal}>{userSession?.mobile || '0961 335 4271'}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Plate Assigned</Text>
              <Text style={s.infoVal}>NQR 8459 (Toyota Vios)</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Shift Time</Text>
              <Text style={s.infoVal}>{userSession?.preferredShift || 'Morning'} (06:00 AM - 02:00 PM)</Text>
            </View>
            {userSession?.createdAt ? (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Member Since</Text>
                <Text style={s.infoVal}>{new Date(userSession.createdAt).toLocaleString()}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={s.closeInfoButton}
              onPress={() => setPersonalInfoModalVisible(false)}
            >
              <Text style={s.closeInfoText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.logoutAlertPanel}>
            
            {/* Circular Red Power Symbol Header */}
            <View style={s.powerSymbolWrapper}>
              <View style={s.powerSymbolCircle}>
                <Ionicons name="power" size={38} color="#FFF" />
              </View>
            </View>

            {/* Title & Prompt Text */}
            <Text style={s.logoutTitle}>Logout</Text>
            <Text style={s.logoutSubtitle}>Hi, Are you sure you want to logout ?</Text>

            {/* Interaction Choices (No & Yes) */}
            <View style={s.logoutActionsRow}>
              <TouchableOpacity 
                style={s.noButton} 
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.6}
              >
                <Text style={s.noButtonText}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={s.yesButton} 
                onPress={handleLogout}
                activeOpacity={0.9}
              >
                <Text style={s.yesButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF1FB',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    overflow: 'hidden',
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  avatarWrapper: {
    position: 'relative',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#1A4FA0',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  avatarImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EAF1FB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  editPencilButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
      }
    })
  },
  driverName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
  },
  driverTag: {
    fontSize: 15,
    color: '#1A4FA0',
    fontWeight: '600',
    marginTop: 2,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  outlineButton: {
    width: '100%',
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1A4FA0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  outlineButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#FFF',
    width: '95%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0F4FA',
    paddingBottom: 12,
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
    color: '#1A4FA0',
    fontWeight: 'bold',
  },
  closeInfoButton: {
    backgroundColor: '#1A4FA0',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  closeInfoText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoutAlertPanel: {
    backgroundColor: '#FFF',
    width: '90%',
    maxWidth: 360,
    borderRadius: 20,
    paddingTop: 36,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 25px rgba(0,0,0,0.2)',
      }
    })
  },
  powerSymbolWrapper: {
    position: 'absolute',
    top: -44,
    alignSelf: 'center',
  },
  powerSymbolCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#E74C3C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(231, 76, 60, 0.3)',
      }
    })
  },
  logoutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    marginBottom: 8,
  },
  logoutSubtitle: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 28,
  },
  logoutActionsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  noButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  noButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  yesButton: {
    backgroundColor: '#1A4FA0',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 36,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1A4FA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(26, 79, 160, 0.2)',
      }
    })
  },
  yesButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
