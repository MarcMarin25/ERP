/**
 * Web fallback for the MapBackground component.
 * react-native-maps is native-only, so this renders a static
 * map image placeholder on web.
 */
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MapBackground() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/map_background.png')}
        style={styles.mapImage}
        resizeMode="cover"
      />
      {/* Floating pin marker */}
      <View style={styles.pinPosition}>
        <View style={styles.pulseWave} />
        <View style={styles.pinOuterCircle}>
          <View style={styles.pinInnerCircle} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height - 85,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  pinPosition: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseWave: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(26, 79, 160, 0.4)',
    backgroundColor: 'rgba(26, 79, 160, 0.08)',
    transform: [{ scale: 1.1 }],
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
