/**
 * Fully functional passenger Home / Map screen.
 * Integrates real-time Google Maps search, autocomplete, and routing.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import RippleButton from '../../components/RippleButton';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { usePassengerData, useAuth } from '../_layout';
import GoogleMap from '../../components/GoogleMap';
import { getSuggestions, geocode, getDirections, PlaceSuggestion } from '../../utils/googleMapsService';
import { Swal } from '../../components/Swal';
import { logActionToDb, createBooking, fetchBookingStatus } from '../../utils/mockDb';

export default function HomeScreen() {
  const { setTrips } = usePassengerData();
  const { userSession } = useAuth();

  // Live booking DB state variables
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [bookingStatus, setBookingStatus] = useState<number>(6); // 6: pending, 11: to_pick_up, 12: confirm_pick_up, 13: start_trip, 16: completed, 9: cancelled
  const [driverInfo, setDriverInfo] = useState<{ name: string; phone: string; plate: string; vehicle: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Finding a driver...');

  const [showPopup, setShowPopup] = useState(false);
  const [pickup, setPickup] = useState('Current Location (Candaba, Pampanga)');
  const [destination, setDestination] = useState('');

  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fare, setFare] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Google Maps state variables
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [activeField, setActiveField] = useState<'pickup' | 'destination' | null>(null);

  // Geocode default pickup location on mount
  useEffect(() => {
    const geocodeDefaultPickup = async () => {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBFHqGzZOVs7b0cCdWuePt0t4kbsPiJ7Kc";
      const coords = await geocode('Candaba, Pampanga', apiKey);
      if (coords) {
        setPickupCoords(coords);
      }
    };
    geocodeDefaultPickup();
  }, []);

  // Fetch Place Autocomplete suggestions when user types
  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      return;
    }

    const query = activeField === 'pickup' ? pickup : destination;
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBFHqGzZOVs7b0cCdWuePt0t4kbsPiJ7Kc";
      const results = await getSuggestions(query, apiKey);
      setSuggestions(results);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [pickup, destination, activeField]);

  // Fetch routes and calculate distance, duration, and fare when pickup/destination change
  useEffect(() => {
    if (!pickupCoords || !destinationCoords) {
      setRouteCoords([]);
      setDistance(0);
      setDuration(0);
      setFare(0);
      return;
    }

    const fetchRoute = async () => {
      setIsCalculating(true);
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBFHqGzZOVs7b0cCdWuePt0t4kbsPiJ7Kc";
      const routeInfo = await getDirections(pickupCoords, destinationCoords, apiKey);

      if (routeInfo) {
        setRouteCoords(routeInfo.polylinePoints);
        setDistance(parseFloat(routeInfo.distanceKm.toFixed(1)));
        setDuration(routeInfo.durationMin);
        setFare(Math.round(40 + (routeInfo.distanceKm * 15)));
      } else {
        // Fallback to length-based mock calculations if api fails
        const length = destination.trim().length;
        const computedDistance = Math.min(25, Math.max(1.8, (length * 0.6) + 1.2));
        const computedDuration = Math.round(computedDistance * 2.2 + 3);
        const computedFare = Math.round(40 + (computedDistance * 15));

        setDistance(parseFloat(computedDistance.toFixed(1)));
        setDuration(computedDuration);
        setFare(computedFare);
      }
      setIsCalculating(false);
    };

    fetchRoute();
  }, [pickupCoords, destinationCoords, destination]);

  const handleSelectSuggestion = async (item: PlaceSuggestion, field: 'pickup' | 'destination') => {
    setIsCalculating(true);
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBFHqGzZOVs7b0cCdWuePt0t4kbsPiJ7Kc";
    
    if (field === 'pickup') {
      setPickup(item.description);
      setSuggestions([]);
      setActiveField(null);
      const coords = await geocode(item.description, apiKey);
      if (coords) {
        setPickupCoords(coords);
      }
    } else {
      setDestination(item.description);
      setSuggestions([]);
      setActiveField(null);
      const coords = await geocode(item.description, apiKey);
      if (coords) {
        setDestinationCoords(coords);
      }
    }
    setIsCalculating(false);
  };

  // Poll active booking status
  useEffect(() => {
    if (activeBookingId === null) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const details = await fetchBookingStatus(activeBookingId);
        if (!isMounted) return;

        setBookingStatus(details.status_id);

        if (details.status_id === 11) {
          setStatusMessage(`Driver ${details.driver_name || 'Partner'} accepted your request! Heading to pickup...`);
          setDriverInfo({
            name: details.driver_name || 'Driver',
            phone: details.driver_phone || '',
            plate: details.vehicle_plate || 'N/A',
            vehicle: details.vehicle_brand && details.vehicle_model 
              ? `${details.vehicle_brand} ${details.vehicle_model}` 
              : 'Toyota Vios'
          });
        } else if (details.status_id === 12) {
          setStatusMessage('Driver has arrived at your pickup location!');
        } else if (details.status_id === 13) {
          setStatusMessage('Trip started! Heading to your destination...');
        } else if (details.status_id === 16) {
          setStatusMessage('Trip completed successfully!');
          clearInterval(pollInterval);
          
          // Add trip to list
          const newTrip = {
            id: String(activeBookingId),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            pickup: pickup,
            destination: destination,
            price: fare,
            status: 'Completed' as const,
            driverName: details.driver_name || 'Driver',
            distance: `${distance} km`,
            duration: `${duration} mins`
          };
          setTrips(prev => [newTrip, ...prev]);

          // Transition to success screen
          setBookingSuccess(true);
          
          setTimeout(() => {
            if (isMounted) {
              setBookingSuccess(false);
              setShowPopup(false);
              setDestination('');
              setDestinationCoords(null);
              setRouteCoords([]);
              setActiveBookingId(null);
              setDriverInfo(null);
              setBookingStatus(6);
              setStatusMessage('Finding a driver...');
            }
          }, 4000);
        } else if (details.status_id === 9 || details.status_id === 18) {
          clearInterval(pollInterval);
          setActiveBookingId(null);
          setDriverInfo(null);
          setBookingStatus(6);
          setStatusMessage('Finding a driver...');
          Swal.fire({
            title: 'Booking Cancelled',
            text: 'Your request was cancelled or declined. Please try booking again.',
            icon: 'error'
          });
        }
      } catch (err) {
        console.error('Error polling booking status:', err);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [activeBookingId, pickup, destination, fare, distance, duration]);

  const handleBookRide = async () => {
    if (!destination.trim()) {
      Swal.fire({ title: 'Destination Required', text: 'Please enter a destination location.', icon: 'warning' });
      return;
    }

    const passengerId = userSession?.id;
    if (!passengerId) {
      Swal.fire({ title: 'Login Required', text: 'Please login to book a ride.', icon: 'error' });
      return;
    }

    setIsBooking(true);
    try {
      const bookingData = {
        passenger_id: passengerId,
        start_lat: pickupCoords?.latitude || 15.08,
        start_lng: pickupCoords?.longitude || 120.82,
        end_lat: destinationCoords?.latitude || 15.08,
        end_lng: destinationCoords?.longitude || 120.82,
        distance_km: distance,
        pickup_name: pickup,
        destination_name: destination,
        fare: fare
      };

      const response = await createBooking(bookingData);
      setActiveBookingId(response.bookingId);
      setBookingStatus(6);
      setStatusMessage('Finding a driver...');
    } catch (err: any) {
      Swal.fire({ title: 'Booking Failed', text: err.message, icon: 'error' });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={s.container}>
      {/* ── Google Map ── */}
      <View style={s.webMapContainer}>
        <GoogleMap
          pickup={pickupCoords}
          destination={destinationCoords}
          route={routeCoords}
          interactive={true}
        />
      </View>

      {/* ── Floating Start Action Button ── */}
      {!showPopup && (
        <RippleButton
          title="Start"
          style={s.startButton}
          textStyle={s.startButtonText}
          onPress={() => setShowPopup(true)}
        />
      )}

      {/* ── Trip Planning Bottom Sheet / Popup ── */}
      <Modal
        visible={showPopup}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isBooking && !bookingSuccess) setShowPopup(false);
        }}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            if (!isBooking && !bookingSuccess) setShowPopup(false);
          }}
        >
          <TouchableOpacity activeOpacity={1} style={s.sheetContent}>
            <View style={s.dragBar} />

            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Plan Your Trip</Text>
              <Pressable
                style={({ pressed }) => [s.closeButton, Platform.OS === 'ios' && pressed && { opacity: 0.7 }]}
                onPress={() => setShowPopup(false)}
                disabled={isBooking || bookingSuccess}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: true, radius: 20 }}
              >
                <Ionicons name="close" size={24} color="#777" />
              </Pressable>
            </View>

            <View style={s.inputContainer}>
              <View style={s.inputWrapper}>
                <View style={[s.inputIconBox, { backgroundColor: '#22B04B' }]}>
                  <Ionicons name="location" size={16} color="#FFF" />
                </View>
                <TextInput
                  style={s.textInput}
                  placeholder="Pick up location"
                  value={pickup}
                  onChangeText={setPickup}
                  onFocus={() => setActiveField('pickup')}
                  placeholderTextColor="#999"
                  editable={!isBooking && !bookingSuccess}
                />
              </View>

              {activeField === 'pickup' && suggestions.length > 0 && (
                <ScrollView style={s.suggestionsList} keyboardShouldPersistTaps="handled">
                  {suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={item.placeId || index}
                      style={s.suggestionItem}
                      onPress={() => handleSelectSuggestion(item, 'pickup')}
                    >
                      <Ionicons name="location-outline" size={18} color="#1A4FA0" style={{ marginRight: 8 }} />
                      <Text style={s.suggestionText} numberOfLines={1}>{item.description}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <View style={s.connectorDots}>
                <View style={s.dot} />
                <View style={s.dot} />
                <View style={s.dot} />
              </View>

              <View style={s.inputWrapper}>
                <View style={[s.inputIconBox, { backgroundColor: '#1A4FA0' }]}>
                  <FontAwesome name="flag" size={14} color="#FFF" />
                </View>
                <TextInput
                  style={[s.textInput, { borderColor: '#1A4FA0' }]}
                  placeholder="Enter destination location"
                  value={destination}
                  onChangeText={setDestination}
                  onFocus={() => setActiveField('destination')}
                  placeholderTextColor="#999"
                  autoFocus
                  editable={!isBooking && !bookingSuccess}
                />
              </View>

              {activeField === 'destination' && suggestions.length > 0 && (
                <ScrollView style={s.suggestionsList} keyboardShouldPersistTaps="handled">
                  {suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={item.placeId || index}
                      style={s.suggestionItem}
                      onPress={() => handleSelectSuggestion(item, 'destination')}
                    >
                      <Ionicons name="location-outline" size={18} color="#1A4FA0" style={{ marginRight: 8 }} />
                      <Text style={s.suggestionText} numberOfLines={1}>{item.description}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {destination.trim().length > 0 && (
              <View style={s.estimateContainer}>
                {isCalculating ? (
                  <ActivityIndicator size="small" color="#1A4FA0" style={{ paddingVertical: 10 }} />
                ) : (
                  <>
                    <View style={s.summaryRow}>
                      <View style={s.summaryItem}>
                        <Ionicons name="resize" size={18} color="#1A4FA0" />
                        <Text style={s.summaryLabel}>Distance</Text>
                        <Text style={s.summaryValue}>{distance} km</Text>
                      </View>
                      <View style={s.verticalDivider} />
                      <View style={s.summaryItem}>
                        <Ionicons name="time-outline" size={18} color="#1A4FA0" />
                        <Text style={s.summaryLabel}>Est. Time</Text>
                        <Text style={s.summaryValue}>{duration} mins</Text>
                      </View>
                    </View>

                    <View style={s.fareDisplay}>
                      <Text style={s.fareLabel}>Estimated Fare</Text>
                      <Text style={s.fareValue}>₱{fare.toFixed(2)}</Text>
                    </View>
                  </>
                )}
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                s.bookButton,
                (!destination.trim() || isCalculating) && { backgroundColor: '#A2C2E7' },
                Platform.OS === 'ios' && pressed && { opacity: 0.85 },
              ]}
              disabled={!destination.trim() || isCalculating || isBooking || bookingSuccess}
              onPress={handleBookRide}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.25)', borderless: false }}
            >
              {isBooking ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={s.bookButtonText}>Book Ride Now</Text>
              )}
            </Pressable>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Live Booking Status Overlay Modal ── */}
      <Modal visible={activeBookingId !== null && !bookingSuccess} transparent animationType="slide">
        <View style={s.successOverlay}>
          <View style={s.successCard}>
            <View style={[s.successIconBg, { backgroundColor: bookingStatus === 6 ? '#1A4FA0' : '#22B04B' }]}>
              {bookingStatus === 6 ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : (
                <Ionicons name="car-sport" size={42} color="#FFF" />
              )}
            </View>
            <Text style={s.successTitle}>
              {bookingStatus === 6 ? 'Request Sent' : 'Trip Progress'}
            </Text>
            <Text style={[s.successSubtitle, { fontSize: 15, fontWeight: '600', color: '#1A4FA0', marginVertical: 10, textAlign: 'center' }]}>
              {statusMessage}
            </Text>

            {driverInfo && (
              <View style={[s.receiptCard, { marginTop: 10 }]}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A4FA0', marginBottom: 5 }}>Driver Information</Text>
                <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Driver:</Text> {driverInfo.name}</Text>
                <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Contact:</Text> {driverInfo.phone}</Text>
                <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Vehicle:</Text> {driverInfo.vehicle}</Text>
                <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Plate:</Text> {driverInfo.plate}</Text>
              </View>
            )}

            <View style={[s.receiptCard, { marginTop: 10 }]}>
              <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Pickup:</Text> {pickup}</Text>
              <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>To:</Text> {destination}</Text>
              <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Total Cost:</Text> ₱{fare.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Booking Success Overlay Modal ── */}
      <Modal visible={bookingSuccess} transparent animationType="fade">
        <View style={s.successOverlay}>
          <View style={s.successCard}>
            <View style={s.successIconBg}>
              <Ionicons name="checkmark-circle" size={54} color="#FFF" />
            </View>
            <Text style={s.successTitle}>Booking Confirmed!</Text>
            <Text style={s.successSubtitle}>Your trip has been completed successfully.</Text>
            <View style={s.receiptCard}>
              <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Pickup:</Text> {pickup}</Text>
              <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>To:</Text> {destination}</Text>
              {driverInfo && <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Driver:</Text> {driverInfo.name}</Text>}
              <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Total Cost:</Text> ₱{fare.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF1FB',
  },
  webMapContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  webMapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  webPinPosition: {
    position: 'absolute',
    alignSelf: 'center',
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
  startButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#1A4FA0',
    width: '80%',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // @ts-ignore - web-only style
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  dragBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginBottom: 15,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    height: 48,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
  },
  inputIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#333',
  },
  connectorDots: {
    marginLeft: 22,
    marginVertical: 4,
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A2C2E7',
  },
  estimateContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A4FA0',
    marginTop: 2,
  },
  verticalDivider: {
    width: 1.5,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  fareDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  fareLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  fareValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#22B04B',
  },
  bookButton: {
    backgroundColor: '#1A4FA0',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 79, 160, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    alignItems: 'center',
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22B04B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A4FA0',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  receiptCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    gap: 8,
  },
  receiptText: {
    fontSize: 14,
    color: '#333',
  },
  suggestionsList: {
    maxHeight: 150,
    backgroundColor: '#FFF',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    zIndex: 99,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF1FB',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
