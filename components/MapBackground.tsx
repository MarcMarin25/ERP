/**
 * Web MapBackground component using interactive Google Maps.
 */
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import GoogleMap from './GoogleMap';

const { width, height } = Dimensions.get('window');

export default function MapBackground() {
  return (
    <GoogleMap 
      interactive={true} 
      style={styles.map} 
    />
  );
}

const styles = StyleSheet.create({
  map: {
    width: width,
    height: height - 85,
  },
});
