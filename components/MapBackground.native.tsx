import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const MAP_REGION = {
  latitude: 15.0886,
  longitude: 120.8989,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function MapBackground() {
  return (
    <MapView style={styles.map} initialRegion={MAP_REGION}>
      <Marker
        coordinate={{ latitude: 15.0886, longitude: 120.8989 }}
        title="Your Location"
        description="Candaba, Pampanga"
      >
        <View style={styles.pinContainer}>
          <View style={styles.pinOuterCircle}>
            <View style={styles.pinInnerCircle} />
          </View>
        </View>
      </Marker>
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: width,
    height: height - 85,
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  pinOuterCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(26, 79, 160, 0.25)',
    borderWidth: 1.5,
    borderColor: '#1A4FA0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInnerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1A4FA0',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
});
