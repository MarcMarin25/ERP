import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabHeader } from './home';

interface TripHistoryItem {
  id: string;
  passenger: string;
  pickup: string;
  dropoff: string;
  startTime: string;
  endTime: string;
  payment: number;
}

export default function DriverEarningsScreen() {
  const trips: TripHistoryItem[] = [
    {
      id: '1',
      passenger: 'Marc Francis',
      pickup: 'Holy Angel University, Angeles City',
      dropoff: 'Candaba, Pampanga',
      startTime: '09:30 AM',
      endTime: '10:15 AM',
      payment: 320.00,
    },
    {
      id: '2',
      passenger: 'Mico Marin',
      pickup: 'Candaba, Pampanga',
      dropoff: 'SM City Pampanga, San Fernando',
      startTime: '02:15 PM',
      endTime: '02:55 PM',
      payment: 240.00,
    },
    {
      id: '3',
      passenger: 'John Doe',
      pickup: 'Clark Airport, Angeles City',
      dropoff: 'Candaba, Pampanga',
      startTime: '11:00 AM',
      endTime: '11:45 AM',
      payment: 450.00,
    }
  ];

  const totalEarnings = trips.reduce((sum, trip) => sum + trip.payment, 0);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A4FA0" />
      <TabHeader title="Your Earning" />

      <View style={s.sheet}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Active counts & Date */}
          <View style={s.metricsRow}>
            <View style={s.metricBox}>
              <Text style={s.metricLabel}>Active counts</Text>
              <Text style={s.metricValue}>{trips.length}</Text>
            </View>
            <View style={s.metricBox}>
              <Text style={s.metricLabel}>Transaction Date</Text>
              <Text style={s.metricValue}>2034-06-22</Text>
            </View>
          </View>

          {/* Bold Blue Total Earnings Bar */}
          <View style={s.totalEarningsBar}>
            <Text style={s.totalEarningsLabel}>Total earnings :</Text>
            <Text style={s.totalEarningsValue}>₱ {totalEarnings.toFixed(2)}</Text>
          </View>

          {/* Section Divider / Title */}
          <View style={s.sectionHeader}>
            <MaterialCommunityIcons name="history" size={20} color="#1A4FA0" />
            <Text style={s.sectionTitle}>Details History</Text>
          </View>

          {/* List of Trip Cards */}
          {trips.map((trip) => (
            <View key={trip.id} style={s.tripCard}>
              {/* Passenger Row */}
              <View style={s.cardHeader}>
                <Ionicons name="person-circle" size={32} color="#1A4FA0" />
                <View style={s.passengerInfo}>
                  <Text style={s.passengerLabel}>Passenger Name</Text>
                  <Text style={s.passengerName}>{trip.passenger}</Text>
                </View>
              </View>

              {/* Path / Time Timeline */}
              <View style={s.timelineContainer}>
                {/* Visual line and dots */}
                <View style={s.timelineGfx}>
                  <View style={[s.timelineDot, { backgroundColor: '#2E7D32' }]} />
                  <View style={s.timelineLine} />
                  <View style={[s.timelineDot, { backgroundColor: '#C62828' }]} />
                </View>

                {/* Details text */}
                <View style={s.timelineDetails}>
                  <View style={s.locationRow}>
                    <Text style={s.locationText}>{trip.pickup}</Text>
                    <Text style={[s.timeText, { color: '#2E7D32' }]}>{trip.startTime}</Text>
                  </View>
                  
                  <View style={s.locationRow}>
                    <Text style={s.locationText}>{trip.dropoff}</Text>
                    <Text style={[s.timeText, { color: '#C62828' }]}>{trip.endTime}</Text>
                  </View>
                </View>
              </View>

              {/* Trip Payment Banner Indicator */}
              <View style={s.paymentBanner}>
                <Text style={s.paymentLabel}>Trip Payment</Text>
                <Text style={s.paymentValue}>₱ {trip.payment.toFixed(2)}</Text>
              </View>
            </View>
          ))}

        </ScrollView>
      </View>
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
    backgroundColor: '#EAF1FB',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    overflow: 'hidden',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 110,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
      }
    })
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  totalEarningsBar: {
    backgroundColor: '#1A4FA0',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
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
  totalEarningsLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalEarningsValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  tripCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
      }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0F4FA',
    paddingBottom: 10,
    marginBottom: 12,
  },
  passengerInfo: {
    marginLeft: 10,
  },
  passengerLabel: {
    fontSize: 11,
    color: '#777',
    fontWeight: '600',
  },
  passengerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  timelineContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  timelineGfx: {
    alignItems: 'center',
    width: 16,
    paddingTop: 4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineDetails: {
    flex: 1,
    marginLeft: 10,
    gap: 16,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  paymentBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EAF1FB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1A4FA0',
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#22B04B',
  },
});
