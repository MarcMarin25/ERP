import { Platform } from 'react-native';
import { decodePolyline } from './mapUtils';

export interface PlaceSuggestion {
  description: string;
  placeId: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RouteInfo {
  polylinePoints: LatLng[];
  distanceKm: number;
  durationMin: number;
}

/**
 * Fetches place suggestions from Google Places autocomplete.
 */
export const getSuggestions = async (
  query: string,
  apiKey: string
): Promise<PlaceSuggestion[]> => {
  if (!query || query.trim().length < 2) return [];

  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const gWindow = window as any;
      if (!gWindow.google || !gWindow.google.maps || !gWindow.google.maps.places) {
        console.warn('Google Maps JS SDK not loaded yet on web.');
        resolve([]);
        return;
      }
      try {
        const service = new gWindow.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          { input: query, componentRestrictions: { country: 'ph' } },
          (predictions: any[], status: any) => {
            if (status === gWindow.google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(
                predictions.map((p) => ({
                  description: p.description,
                  placeId: p.place_id,
                }))
              );
            } else {
              resolve([]);
            }
          }
        );
      } catch (error) {
        console.error('Error with web AutocompleteService:', error);
        resolve([]);
      }
    });
  } else {
    // Native
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&key=${apiKey}&components=country:ph`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'OK' && json.predictions) {
        return json.predictions.map((p: any) => ({
          description: p.description,
          placeId: p.place_id,
        }));
      }
      return [];
    } catch (e) {
      console.error('Error fetching native autocomplete predictions:', e);
      return [];
    }
  }
};

/**
 * Geocodes an address or location name to latitude and longitude.
 */
export const geocode = async (address: string, apiKey: string): Promise<LatLng | null> => {
  if (!address || !address.trim()) return null;

  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const gWindow = window as any;
      if (!gWindow.google || !gWindow.google.maps) {
        console.warn('Google Maps JS SDK not loaded yet on web.');
        resolve(null);
        return;
      }
      try {
        const geocoder = new gWindow.google.maps.Geocoder();
        geocoder.geocode({ address }, (results: any[], status: any) => {
          if (status === gWindow.google.maps.GeocoderStatus.OK && results && results[0]) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            resolve({ latitude: lat, longitude: lng });
          } else {
            resolve(null);
          }
        });
      } catch (error) {
        console.error('Error with web Geocoder:', error);
        resolve(null);
      }
    });
  } else {
    // Native
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'OK' && json.results && json.results[0]) {
        const { lat, lng } = json.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      }
      return null;
    } catch (e) {
      console.error('Error fetching native geocode:', e);
      return null;
    }
  }
};

/**
 * Calculates direction routes and returns polyline points, distance, and duration.
 */
export const getDirections = async (
  origin: LatLng,
  destination: LatLng,
  apiKey: string
): Promise<RouteInfo | null> => {
  if (!origin || !destination) return null;

  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const gWindow = window as any;
      if (!gWindow.google || !gWindow.google.maps) {
        console.warn('Google Maps JS SDK not loaded yet on web.');
        resolve(null);
        return;
      }
      try {
        const service = new gWindow.google.maps.DirectionsService();
        service.route(
          {
            origin: new gWindow.google.maps.LatLng(origin.latitude, origin.longitude),
            destination: new gWindow.google.maps.LatLng(destination.latitude, destination.longitude),
            travelMode: gWindow.google.maps.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (
              status === gWindow.google.maps.DirectionsStatus.OK &&
              result &&
              result.routes &&
              result.routes[0]
            ) {
              const route = result.routes[0];
              const leg = route.legs[0];

              const polylinePoints = route.overview_path.map((p: any) => ({
                latitude: p.lat(),
                longitude: p.lng(),
              }));

              const distanceKm = leg.distance ? leg.distance.value / 1000 : 0;
              const durationMin = leg.duration ? Math.round(leg.duration.value / 60) : 0;

              resolve({ polylinePoints, distanceKm, durationMin });
            } else {
              resolve(null);
            }
          }
        );
      } catch (error) {
        console.error('Error with web DirectionsService:', error);
        resolve(null);
      }
    });
  } else {
    // Native
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'OK' && json.routes && json.routes[0]) {
        const route = json.routes[0];
        const leg = route.legs[0];
        const encodedPolyline = route.overview_polyline.points;
        const polylinePoints = decodePolyline(encodedPolyline);

        const distanceKm = leg.distance ? leg.distance.value / 1000 : 0;
        const durationMin = leg.duration ? Math.round(leg.duration.value / 60) : 0;

        return { polylinePoints, distanceKm, durationMin };
      }
      return null;
    } catch (e) {
      console.error('Error fetching native directions:', e);
      return null;
    }
  }
};
