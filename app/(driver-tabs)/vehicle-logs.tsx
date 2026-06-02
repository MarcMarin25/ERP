import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { TabHeader } from './home';

interface LogItem {
  id: string;
  date: string;
  startOdo: number;
  endOdo: number;
  distance: number;
  fuelEst: string;
}

export default function DriverVehicleLogsScreen() {
  const logs: LogItem[] = [
    { id: '1', date: 'May 28, 2026', startOdo: 12450.2, endOdo: 12472.5, distance: 22.3, fuelEst: '1.8L' },
    { id: '2', date: 'May 27, 2026', startOdo: 12410.8, endOdo: 12450.2, distance: 39.4, fuelEst: '3.1L' },
    { id: '3', date: 'May 26, 2026', startOdo: 12380.1, endOdo: 12410.8, distance: 30.7, fuelEst: '2.5L' },
    { id: '4', date: 'May 25, 2026', startOdo: 12345.5, endOdo: 12380.1, distance: 34.6, fuelEst: '2.8L' },
  ];

  const totalDistance = logs.reduce((sum, item) => sum + item.distance, 0);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A4FA0" />
      <TabHeader title="Vehicle Logs" />

      <View style={s.sheet}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Total Distance Travelled High-Contrast Banner */}
          <View style={s.distanceBanner}>
            <Text style={s.distanceText}>Total Distance Travel:</Text>
            <View style={s.mileagePill}>
              <Text style={s.mileageValue}>+{totalDistance.toFixed(1)} km</Text>
            </View>
          </View>

          {/* Vehicle Info Section */}
          <Text style={s.sectionTitle}>Assigned Vehicle Info</Text>
          <View style={s.vehicleCard}>
            <View style={s.vehicleHeader}>
              <FontAwesome name="car" size={24} color="#1A4FA0" />
              <View style={s.vehicleMeta}>
                <Text style={s.vehicleModel}>Toyota Vios (Automatic)</Text>
                <Text style={s.vehiclePlate}>Plate No: NQR 8459</Text>
              </View>
              <View style={s.statusPill}>
                <Text style={s.statusText}>Active</Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.infoGrid}>
              <View style={s.infoItem}>
                <Text style={s.infoLabel}>Operator Name</Text>
                <Text style={s.infoValue}>DeviceDesign Inc.</Text>
              </View>
              <View style={s.infoItem}>
                <Text style={s.infoLabel}>Fuel Type</Text>
                <Text style={s.infoValue}>Gasoline (95)</Text>
              </View>
              <View style={s.infoItem}>
                <Text style={s.infoLabel}>Odometer</Text>
                <Text style={s.infoValue}>12,472 km</Text>
              </View>
              <View style={s.infoItem}>
                <Text style={s.infoLabel}>Last Serviced</Text>
                <Text style={s.infoValue}>2026-05-10</Text>
              </View>
            </View>
          </View>

          {/* Odometer Logs Title */}
          <Text style={s.sectionTitle}>Shift Mileage History</Text>

          {/* Table of logs */}
          <View style={s.tableContainer}>
            <View style={s.tableHeader}>
              <Text style={[s.th, { flex: 1.5 }]}>Date</Text>
              <Text style={s.th}>Start Odo</Text>
              <Text style={s.th}>End Odo</Text>
              <Text style={s.th}>Distance</Text>
            </View>
            
            {logs.map((log) => (
              <View key={log.id} style={s.tableRow}>
                <Text style={[s.td, s.dateTd, { flex: 1.5 }]}>{log.date}</Text>
                <Text style={s.td}>{log.startOdo.toFixed(1)}</Text>
                <Text style={s.td}>{log.endOdo.toFixed(1)}</Text>
                <Text style={[s.td, s.distanceTd]}>+{log.distance.toFixed(1)} km</Text>
              </View>
            ))}
          </View>

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
  distanceBanner: {
    backgroundColor: '#1A4FA0',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 22,
    paddingRight: 8,
    marginBottom: 26,
    height: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#1A4FA0',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 3px 6px rgba(26, 79, 160, 0.15)',
      }
    })
  },
  distanceText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  mileagePill: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mileageValue: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A4FA0',
    marginBottom: 12,
    marginTop: 8,
  },
  vehicleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.04)',
      }
    })
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleMeta: {
    marginLeft: 12,
    flex: 1,
  },
  vehicleModel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  vehiclePlate: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F0F4FA',
    marginVertical: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },
  infoItem: {
    width: '50%',
  },
  infoLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.04)',
      }
    })
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F0F6FE',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EAF1FB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  th: {
    flex: 1,
    fontSize: 11,
    color: '#1A4FA0',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0F4FA',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  td: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  dateTd: {
    textAlign: 'left',
    color: '#555',
  },
  distanceTd: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});
