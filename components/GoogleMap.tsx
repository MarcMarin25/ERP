import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

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

let mapsLoadingPromise: Promise<void> | null = null;
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  if (mapsLoadingPromise) return mapsLoadingPromise;

  mapsLoadingPromise = new Promise((resolve, reject) => {
    const gWindow = window as any;
    if (gWindow.google && gWindow.google.maps) {
      resolve();
      return;
    }
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (err) => reject(err));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return mapsLoadingPromise;
};

export default function GoogleMap({
  pickup,
  destination,
  route = [],
  driverLocation,
  interactive = true,
  style,
}: GoogleMapProps) {
  const containerRef = useRef<View>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapInstanceRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBFHqGzZOVs7b0cCdWuePt0t4kbsPiJ7Kc";

  // Load SDK
  useEffect(() => {
    loadGoogleMapsScript(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error('Failed to load Google Maps SDK', err);
        setError('Failed to load Google Maps API.');
      });
  }, [apiKey]);

  // Initialize Map
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;
    const gWindow = window as any;
    if (!gWindow.google || !gWindow.google.maps) return;

    // Get the DOM node of the view
    const domNode = containerRef.current as any;
    const mapDiv = domNode.target || domNode; // Depending on react-native-web version

    const defaultCenter = { lat: 15.0886, lng: 120.8989 }; // Candaba, Pampanga
    const initialCenter = driverLocation 
      ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
      : pickup
      ? { lat: pickup.latitude, lng: pickup.longitude }
      : defaultCenter;

    const map = new gWindow.google.maps.Map(mapDiv, {
      center: initialCenter,
      zoom: 13,
      disableDefaultUI: !interactive,
      zoomControl: interactive,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'administrative.land_parcel',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'road',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'road.local',
          elementType: 'labels',
          stylers: [{ visibility: 'simplified' }],
        },
        {
          featureType: 'transit',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapInstanceRef.current = map;

    return () => {
      // Cleanup markers
      if (pickupMarkerRef.current) pickupMarkerRef.current.setMap(null);
      if (destinationMarkerRef.current) destinationMarkerRef.current.setMap(null);
      if (driverMarkerRef.current) driverMarkerRef.current.setMap(null);
      if (polylineRef.current) polylineRef.current.setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // Handle Pickup Marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    const gWindow = window as any;

    if (pickup) {
      const latLng = new gWindow.google.maps.LatLng(pickup.latitude, pickup.longitude);
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setPosition(latLng);
      } else {
        pickupMarkerRef.current = new gWindow.google.maps.Marker({
          map: mapInstanceRef.current,
          position: latLng,
          title: 'Pickup Location',
          icon: {
            path: gWindow.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#22B04B',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setMap(null);
      pickupMarkerRef.current = null;
    }
  }, [pickup, isLoaded]);

  // Handle Destination Marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    const gWindow = window as any;

    if (destination) {
      const latLng = new gWindow.google.maps.LatLng(destination.latitude, destination.longitude);
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setPosition(latLng);
      } else {
        destinationMarkerRef.current = new gWindow.google.maps.Marker({
          map: mapInstanceRef.current,
          position: latLng,
          title: 'Destination Location',
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#1A4FA0',
            fillOpacity: 1,
            scale: 1.5,
            strokeColor: '#FFFFFF',
            strokeWeight: 1.5,
            anchor: new gWindow.google.maps.Point(12, 22),
          },
        });
      }
    } else if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
      destinationMarkerRef.current = null;
    }
  }, [destination, isLoaded]);

  // Handle Driver Marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    const gWindow = window as any;

    if (driverLocation) {
      const latLng = new gWindow.google.maps.LatLng(driverLocation.latitude, driverLocation.longitude);
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setPosition(latLng);
      } else {
        driverMarkerRef.current = new gWindow.google.maps.Marker({
          map: mapInstanceRef.current,
          position: latLng,
          title: 'Driver Location',
          icon: {
            path: 'M12 2L2 22l10-6 10 6L12 2z',
            fillColor: '#1A4FA0',
            fillOpacity: 1,
            scale: 1.2,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            anchor: new gWindow.google.maps.Point(12, 12),
          },
        });
      }

      // Center map on driver location
      if (!pickup && !destination) {
        mapInstanceRef.current.setCenter(latLng);
      }
    } else if (driverMarkerRef.current) {
      driverMarkerRef.current.setMap(null);
      driverMarkerRef.current = null;
    }
  }, [driverLocation, pickup, destination, isLoaded]);

  // Handle Polyline and Zoom Autofit
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    const gWindow = window as any;

    if (route && route.length > 0) {
      const path = route.map((p) => new gWindow.google.maps.LatLng(p.latitude, p.longitude));
      if (polylineRef.current) {
        polylineRef.current.setPath(path);
      } else {
        polylineRef.current = new gWindow.google.maps.Polyline({
          map: mapInstanceRef.current,
          path: path,
          strokeColor: '#1A4FA0',
          strokeOpacity: 0.85,
          strokeWeight: 5,
        });
      }

      // Fit bounds to show both pickup and destination
      const bounds = new gWindow.google.maps.LatLngBounds();
      route.forEach((p) => {
        bounds.extend(new gWindow.google.maps.LatLng(p.latitude, p.longitude));
      });
      mapInstanceRef.current.fitBounds(bounds);
    } else {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      
      // If no route but has pins, center on what is available
      if (pickup && destination) {
        const bounds = new gWindow.google.maps.LatLngBounds();
        bounds.extend(new gWindow.google.maps.LatLng(pickup.latitude, pickup.longitude));
        bounds.extend(new gWindow.google.maps.LatLng(destination.latitude, destination.longitude));
        mapInstanceRef.current.fitBounds(bounds);
      } else if (pickup) {
        mapInstanceRef.current.setCenter(new gWindow.google.maps.LatLng(pickup.latitude, pickup.longitude));
      }
    }
  }, [route, pickup, destination, isLoaded]);

  return (
    <View style={[styles.container, style]}>
      {!isLoaded ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1A4FA0" />
        </View>
      ) : error ? (
        <View style={styles.loaderContainer}>
          {/* Fallback rendering of UI in case of failure */}
        </View>
      ) : null}
      <div
        // @ts-ignore
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#EAF1FB',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
    backgroundColor: '#EAF1FB',
  },
});
