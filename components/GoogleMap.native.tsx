import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface GoogleMapProps {
  pickup?: LatLng | null;
  destination?: LatLng | null;
  route?: LatLng[];
  driverLocation?: LatLng | null;
  interactive?: boolean;
  style?: any;
}

const DEFAULT_REGION = {
  latitude: 15.0886,
  longitude: 120.8989,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function GoogleMap({
  pickup,
  destination,
  route = [],
  driverLocation,
  interactive = true,
  style,
}: GoogleMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (route && route.length > 0) {
      mapRef.current.fitToCoordinates(route, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    } else if (pickup && destination) {
      mapRef.current.fitToCoordinates([pickup, destination], {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    } else if (pickup) {
      mapRef.current.animateToRegion(
        {
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        500
      );
    } else if (driverLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        500
      );
    }
  }, [route, pickup, destination, driverLocation]);

  const initialRegion = driverLocation
    ? {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }
    : pickup
    ? {
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }
    : DEFAULT_REGION;

  return (
    <MapView
      ref={mapRef}
      style={[styles.map, style]}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      rotateEnabled={interactive}
      pitchEnabled={interactive}
    >
      {/* Pickup Marker */}
      {pickup && (
        <Marker
          coordinate={pickup}
          title="Pickup Location"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.pickupMarkerOuter}>
            <View style={styles.pickupMarkerInner} />
          </View>
        </Marker>
      )}

      {/* Destination Marker */}
      {destination && (
        <Marker
          coordinate={destination}
          title="Destination Location"
          pinColor="#1A4FA0"
        />
      )}

      {/* Driver Location Marker */}
      {driverLocation && (
        <Marker
          coordinate={driverLocation}
          title="Driver Location"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.driverMarkerContainer}>
            <View style={styles.driverMarkerShadow} />
            <View style={styles.driverMarkerArrow} />
          </View>
        </Marker>
      )}

      {/* Route Polyline */}
      {route && route.length > 0 && (
        <Polyline
          coordinates={route}
          strokeColor="#1A4FA0"
          strokeWidth={5}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pickupMarkerOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 176, 75, 0.25)',
    borderWidth: 1.5,
    borderColor: '#22B04B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22B04B',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  driverMarkerShadow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.15)',
    transform: [{ rotate: '45deg' }, { translateX: 1 }, { translateY: 1 }],
  },
  driverMarkerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1A4FA0',
  },
});
