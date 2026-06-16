import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePassengerData } from '../_layout';
import { logActionToDb } from '../../utils/mockDb';

export default function HistoryScreen() {
  const { trips, setTrips } = usePassengerData();
  const [searchText, setSearchText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'History' | 'Cancelled'>('Cancelled');

  const toggleFavorite = (tripId: string) => {
    let tripDetails = '';
    let willBeFavorite = false;

    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        const isFav = !t.isFavorite;
        willBeFavorite = isFav;
        tripDetails = `Trip ID: ${t.id}, pickup: ${t.pickup}, destination: ${t.destination}`;
        return { ...t, isFavorite: isFav };
      }
      return t;
    }));

    // Log action to phpMyAdmin database
    const actionName = willBeFavorite ? 'Add to Favorites' : 'Remove Favorite';
    logActionToDb(actionName, tripDetails);
  };

  // Filter completed or cancelled trips to match active tab
  const filteredTrips = trips.filter(trip => {
    const matchesTab = activeSubTab === 'Cancelled'
      ? trip.status === 'Cancelled'
      : trip.status === 'Completed';

    const matchesSearch = searchText
      ? trip.date.toLowerCase().includes(searchText.toLowerCase()) ||
        trip.pickup.toLowerCase().includes(searchText.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchText.toLowerCase())
      : true;
    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAF1FB" />

      {/* ── DeviceGNS Logo Card Header ── */}
      <ImageBackground 
        source={require('../../assets/images/BLUE NAV TOP.png')} 
        style={s.logoHeader}
        resizeMode="cover"
      >
        <View style={s.logoCard}>
          <Image 
            source={require('../../assets/images/devicegns-logo.jpg')} 
            style={s.logoImage} 
            resizeMode="contain"
          />
        </View>
      </ImageBackground>

      {/* ── Trip Summary Content Sheet ── */}
      <View style={s.sheet}>
        
        {/* Header Row: Title & Filter */}
        <View style={s.sheetHeaderRow}>
          <Text style={s.sheetTitle}>Trip Summary</Text>
          <TouchableOpacity style={s.filterButton} activeOpacity={0.7}>
            <Text style={s.filterButtonText}>Filter: By Date</Text>
          </TouchableOpacity>
        </View>

        {/* Sub-Header Tabs Row */}
        <View style={s.subHeaderTabs}>
          <TouchableOpacity onPress={() => setActiveSubTab('History')} activeOpacity={0.7}>
            <Text style={[
              s.historyLabel,
              activeSubTab === 'History' ? s.tabActiveHistory : s.tabInactive
            ]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveSubTab('Cancelled')} activeOpacity={0.7}>
            <Text style={[
              s.cancelledLabel,
              activeSubTab === 'Cancelled' ? s.tabActiveCancelled : s.tabInactive
            ]}>Cancelled</Text>
          </TouchableOpacity>
        </View>

        {/* Date / YYYY/MM/DD Search Input */}
        <View style={s.searchBarContainer}>
          <TextInput
            style={s.searchInput}
            placeholder="YYYY/MM/DD"
            placeholderTextColor="#889BB5"
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={s.searchActions}>
            <Ionicons name="calendar-outline" size={18} color="#1A4FA0" style={s.searchIcon} />
            <View style={s.searchDivider} />
            <Ionicons name="search" size={18} color="#1A4FA0" style={s.searchIcon} />
          </View>
        </View>

        <Text style={s.recentLabel}>Recent</Text>

        {/* Scrollable list of trips */}
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {filteredTrips.map(trip => (
            <View key={trip.id} style={s.tripCard}>
              {/* Driver Info & Date */}
              <View style={s.tripHeader}>
                <Text style={s.driverText}>Driven by: {trip.driverName || 'Mico'}</Text>
                <Text style={s.dateText}>Past trip • {trip.date} • {trip.time}</Text>
              </View>

              {/* Route bubbles */}
              <View style={s.routeContainer}>
                {/* Pickup */}
                <View style={s.routeRow}>
                  <Ionicons name="location" size={18} color="#D02A30" style={s.pinIcon} />
                  <View style={[s.locationBubble, s.pickupBubble]}>
                    <Text style={s.pickupText} numberOfLines={1}>{trip.pickup}</Text>
                  </View>
                </View>

                {/* Destination */}
                <View style={s.routeRow}>
                  <Ionicons name="location" size={18} color="#22B04B" style={s.pinIcon} />
                  <View style={[s.locationBubble, s.destinationBubble]}>
                    <Text style={s.destinationText} numberOfLines={1}>{trip.destination}</Text>
                  </View>
                </View>
              </View>

              {/* Distance and Duration Info */}
              <View style={s.tripMetrics}>
                <Text style={s.metricText}>Distance: {trip.distance || '166.63 km'}</Text>
                <Text style={s.metricText}>Time Duration : {trip.duration || '6 mins'}</Text>
              </View>

              {/* Fare */}
              <View style={s.fareRow}>
                <Text style={s.fareLabel}>Fare</Text>
                <Text style={s.fareValue}>₱ {trip.price.toFixed(2)}</Text>
              </View>

              {/* Side-by-side action buttons */}
              <View style={s.actionsRow}>
                <TouchableOpacity style={s.actionBtn} activeOpacity={0.8}>
                  <Text style={s.actionBtnText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[s.actionBtn, trip.isFavorite && s.actionBtnActive]} 
                  activeOpacity={0.8}
                  onPress={() => toggleFavorite(trip.id)}
                >
                  <Text style={s.actionBtnText}>
                    {trip.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Book Again button */}
              <TouchableOpacity style={s.bookAgainBtn} activeOpacity={0.85}>
                <Text style={s.bookAgainBtnText}>Book Again</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF1FB',
  },
  logoHeader: {
    width: '100%',
    paddingTop: 45,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
    height: 60,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#EDF5FD', // Soft blue background color matching Screenshot 2 & 5
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    borderBottomWidth: 0,
    marginTop: -18,
    paddingHorizontal: 20,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#104595',
  },
  filterButton: {
    borderColor: '#104595',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  filterButtonText: {
    color: '#104595',
    fontWeight: '600',
    fontSize: 13,
  },
  subHeaderTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 16,
  },
  historyLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A5D78',
  },
  cancelledLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22B04B',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A4C3E8',
    borderRadius: 8,
    height: 40,
    backgroundColor: '#FFF',
    paddingLeft: 12,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingRight: 10,
  },
  searchDivider: {
    width: 1.5,
    height: 20,
    backgroundColor: '#A4C3E8',
    marginHorizontal: 8,
  },
  searchIcon: {
    paddingHorizontal: 2,
  },
  recentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#104595',
    marginTop: 14,
    marginBottom: 8,
  },
  scroll: {
    paddingBottom: 110,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noBookingImage: {
    width: 250,
    height: 250,
  },
  tripCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverText: {
    fontSize: 13,
    color: '#104595',
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: '#104595',
    fontWeight: '500',
  },
  routeContainer: {
    gap: 8,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinIcon: {
    width: 18,
    alignItems: 'center',
  },
  locationBubble: {
    flex: 1,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#C6D9F2',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#F7FAFC',
  },
  pickupBubble: {},
  destinationBubble: {},
  pickupText: {
    fontSize: 12,
    color: '#B63A3A',
    fontWeight: '500',
  },
  destinationText: {
    fontSize: 12,
    color: '#22B04B',
    fontWeight: '500',
  },
  tripMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricText: {
    fontSize: 12.5,
    color: '#104595',
    fontWeight: '600',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F5FC',
    paddingTop: 10,
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B63A3A',
  },
  fareValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#B63A3A',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#5A94FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bookAgainBtn: {
    height: 42,
    backgroundColor: '#004DAA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookAgainBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  tabActiveHistory: {
    fontSize: 16,
    fontWeight: '700',
    color: '#104595',
  },
  tabActiveCancelled: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22B04B',
  },
  tabInactive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#889BB5',
  },
  actionBtnActive: {
    backgroundColor: '#E25B5B',
  },
});
