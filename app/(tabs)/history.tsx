import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePassengerData } from '../_layout';

export default function HistoryScreen() {
  const { trips } = usePassengerData();
  const [filter, setFilter] = useState<'All' | 'Completed' | 'Cancelled'>('All');

  // Filter logic
  const filteredTrips = trips.filter(trip => {
    if (filter === 'All') return true;
    return trip.status === filter;
  });

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A4FA0" />
      
      {/* Header Banner */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Trip History</Text>
        <Text style={s.headerSubtitle}>View and track your ride summaries</Text>
      </View>

      {/* Filter Tabs */}
      <View style={s.filterRow}>
        {(['All', 'Completed', 'Cancelled'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            onPress={() => setFilter(tab)}
            style={[
              s.filterTab,
              filter === tab && s.activeFilterTab
            ]}
          >
            <Text style={[
              s.filterText,
              filter === tab && s.activeFilterText
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trips list */}
      <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>
        {filteredTrips.length === 0 ? (
          <View style={s.emptyContainer}>
            <MaterialCommunityIcons name="car-off" size={60} color="#B2CBEB" />
            <Text style={s.emptyText}>No rides found under this category.</Text>
          </View>
        ) : (
          filteredTrips.map(trip => (
            <View key={trip.id} style={s.tripCard}>
              {/* Header row: date & status */}
              <View style={s.tripHeader}>
                <View style={s.dateTimeBox}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />
                  <Text style={s.dateText}>{trip.date} • {trip.time}</Text>
                </View>
                <View style={[
                  s.statusBadge,
                  trip.status === 'Completed' ? s.completedBadge : s.cancelledBadge
                ]}>
                  <Text style={[
                    s.statusText,
                    trip.status === 'Completed' ? s.completedText : s.cancelledText
                  ]}>
                    {trip.status}
                  </Text>
                </View>
              </View>

              {/* Route details */}
              <View style={s.routeContainer}>
                {/* Pickup node */}
                <View style={s.routeRow}>
                  <View style={[s.indicatorNode, { backgroundColor: '#22B04B' }]} />
                  <Text style={s.locationText} numberOfLines={1}>{trip.pickup}</Text>
                </View>

                {/* Vertical dash connection */}
                <View style={s.dashLine} />

                {/* Destination node */}
                <View style={s.routeRow}>
                  <View style={[s.indicatorNode, { backgroundColor: '#1A4FA0' }]} />
                  <Text style={s.locationText} numberOfLines={1}>{trip.destination}</Text>
                </View>
              </View>

              {/* Footer: cost */}
              <View style={s.tripFooter}>
                <Text style={s.priceLabel}>Total Fare Paid</Text>
                <Text style={s.priceValue}>₱{trip.price.toFixed(2)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    elevation: 4,
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
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginTop: -16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeFilterTab: {
    backgroundColor: '#1A4FA0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterText: {
    color: '#FFF',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Make space for the bottom tab bar
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
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  dateTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: 'rgba(34, 176, 75, 0.1)',
  },
  cancelledBadge: {
    backgroundColor: 'rgba(208, 42, 48, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  completedText: {
    color: '#22B04B',
  },
  cancelledText: {
    color: '#D02A30',
  },
  routeContainer: {
    marginBottom: 14,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indicatorNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  dashLine: {
    width: 1.5,
    height: 14,
    backgroundColor: '#A2C2E7',
    marginLeft: 4,
    marginVertical: 2,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A4FA0',
  }
});
