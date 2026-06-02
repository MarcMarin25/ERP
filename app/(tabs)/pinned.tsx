import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePassengerData, PinnedLocation } from '../_layout';

export default function PinnedScreen() {
  const { pinnedLocations, setPinnedLocations } = usePassengerData();
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PinnedLocation | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setAddress('');
    setModalVisible(true);
  };

  const handleOpenEdit = (item: PinnedLocation) => {
    setEditingItem(item);
    setName(item.name);
    setAddress(item.address);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setPinnedLocations(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (!name.trim() || !address.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    if (editingItem) {
      // Edit mode
      setPinnedLocations(prev =>
        prev.map(item =>
          item.id === editingItem.id ? { ...item, name, address } : item
        )
      );
    } else {
      // Add mode
      const newItem = {
        id: String(Date.now()),
        name,
        address,
      };
      setPinnedLocations(prev => [...prev, newItem]);
    }
    setModalVisible(false);
  };

  // Icon selector based on name
  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) return 'home';
    if (l.includes('work') || l.includes('office')) return 'briefcase';
    if (l.includes('school') || l.includes('university') || l.includes('college')) return 'school';
    return 'bookmark';
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A4FA0" />
      
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTextContainer}>
          <Text style={s.headerTitle}>Favorite Locations</Text>
          <Text style={s.headerSubtitle}>Quick access to your pinned destinations</Text>
        </View>
        <TouchableOpacity
          style={s.addButton}
          activeOpacity={0.8}
          onPress={handleOpenAdd}
        >
          <Ionicons name="add" size={24} color="#1A4FA0" />
        </TouchableOpacity>
      </View>

      {/* Main address list */}
      <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>
        {pinnedLocations.length === 0 ? (
          <View style={s.emptyContainer}>
            <MaterialCommunityIcons name="map-marker-off" size={60} color="#B2CBEB" />
            <Text style={s.emptyText}>No pinned locations found.</Text>
            <TouchableOpacity style={s.emptyButton} onPress={handleOpenAdd}>
              <Text style={s.emptyButtonText}>Add Your First Location</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pinnedLocations.map(item => (
            <View key={item.id} style={s.pinnedCard}>
              <View style={s.cardLeft}>
                <View style={s.iconBg}>
                  <Ionicons name={getIcon(item.name)} size={20} color="#1A4FA0" />
                </View>
                <View style={s.addressDetails}>
                  <Text style={s.locationName}>{item.name}</Text>
                  <Text style={s.locationAddress} numberOfLines={2}>{item.address}</Text>
                </View>
              </View>

              {/* Edit/Delete Actions */}
              <View style={s.actionsContainer}>
                <TouchableOpacity
                  style={s.actionButton}
                  onPress={() => handleOpenEdit(item)}
                >
                  <Ionicons name="create-outline" size={20} color="#1A4FA0" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[s.actionButton, { borderColor: '#FCA5A5' }]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#D02A30" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Add/Edit Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>
              {editingItem ? 'Edit Favorite Location' : 'Add New Location'}
            </Text>

            <Text style={s.label}>Label (e.g. Home, Work, Gym)</Text>
            <View style={s.inputRow}>
              <View style={s.iconBox}><Ionicons name="bookmark-outline" size={16} color="#FFF" /></View>
              <TextInput
                style={s.input}
                placeholder="Location Label"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <Text style={s.label}>Full Address</Text>
            <View style={[s.inputRow, s.addressInputRow]}>
              <View style={[s.iconBox, { height: '100%', paddingTop: 14 }]}><Ionicons name="location-outline" size={16} color="#FFF" /></View>
              <TextInput
                style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Street Address, City, Region"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Modal Buttons */}
            <View style={s.modalButtonsRow}>
              <TouchableOpacity
                style={[s.modalBtn, s.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[s.modalBtn, s.saveBtn]}
                onPress={handleSave}
              >
                <Text style={s.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF1FB',
  },
  header: {
    backgroundColor: '#1A4FA0',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#D0E1F9',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#FFF',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    marginTop: 14,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#1A4FA0',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pinnedCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF1FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  locationAddress: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#A2C2E7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    elevation: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      }
    })
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A4FA0',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
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
  addressInputRow: {
    height: 80,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: '100%',
    backgroundColor: '#1A4FA0',
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
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 28,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#D02A30',
    backgroundColor: '#FFF',
  },
  cancelBtnText: {
    color: '#D02A30',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#22B04B',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
