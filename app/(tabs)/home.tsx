/**
 * Passenger Home / Map screen.
 * – Tap the map to pin pickup/destination
 * – Real Google Directions API for distance, duration, fare
 * – All bookings recorded to phpMyAdmin (routes table)
 * – Swal notifications for every booking state
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

// ── Fare constants ────────────────────────────────────────────────────────────
const BASE_FARE    = 40;   // PHP
const PER_KM_RATE  = 15;   // PHP per km

function calcFare(distanceKm: number): number {
  return Math.round(BASE_FARE + distanceKm * PER_KM_RATE);
}

// ── Booking status IDs ────────────────────────────────────────────────────────
const STATUS = {
  PENDING:    6,   // waiting for driver
  TO_PICKUP:  11,  // driver accepted, heading to pickup
  ARRIVED:    12,  // driver arrived at pickup
  IN_TRIP:    13,  // trip started
  COMPLETED:  16,  // trip completed
  CANCELLED:  9,
  REJECTED:   18,
};

export default function HomeScreen() {
  const { setTrips } = usePassengerData();
  const { userSession } = useAuth();

  // ── Map & location state ──────────────────────────────────────────────────
  const [pickupCoords,      setPickupCoords]      = useState<{ latitude: number; longitude: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoords,       setRouteCoords]       = useState<{ latitude: number; longitude: number }[]>([]);
  const [pinMode,           setPinMode]           = useState<'none' | 'pickup' | 'destination'>('none');

  // ── Search / autocomplete state ───────────────────────────────────────────
  const [pickup,       setPickup]       = useState('');
  const [destination,  setDestination]  = useState('');
  const [suggestions,  setSuggestions]  = useState<PlaceSuggestion[]>([]);
  const [activeField,  setActiveField]  = useState<'pickup' | 'destination' | null>(null);

  // ── Route calculation state ───────────────────────────────────────────────
  const [distance,      setDistance]      = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [fare,          setFare]          = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // ── Booking UI state ──────────────────────────────────────────────────────
  const [showPopup,       setShowPopup]       = useState(false);
  const [isBooking,       setIsBooking]       = useState(false);
  const [bookingSuccess,  setBookingSuccess]  = useState(false);

  // ── Live booking tracking ─────────────────────────────────────────────────
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [bookingStatus,   setBookingStatus]   = useState<number>(STATUS.PENDING);
  const [statusMessage,   setStatusMessage]   = useState('Finding a driver...');
  const [driverInfo,      setDriverInfo]      = useState<{ name: string; phone: string; plate: string; vehicle: string } | null>(null);

  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBFHqGzZOVs7b0cCdWuePt0t4kbsPiJ7Kc';

  // ── Geocode default pickup on mount ──────────────────────────────────────
  useEffect(() => {
    const defaultPickup = async () => {
      const coords = await geocode('Candaba, Pampanga', GOOGLE_API_KEY);
      if (coords) {
        setPickupCoords(coords);
        setPickup('Candaba, Pampanga');
      }
    };
    defaultPickup();
  }, []);

  // ── Autocomplete suggestions ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeField) { setSuggestions([]); return; }
    const query = activeField === 'pickup' ? pickup : destination;
    if (!query || query.trim().length < 3) { setSuggestions([]); return; }

    const timer = setTimeout(async () => {
      const results = await getSuggestions(query, GOOGLE_API_KEY);
      setSuggestions(results);
    }, 400);
    return () => clearTimeout(timer);
  }, [pickup, destination, activeField]);

  // ── Fetch route when both coords are set ─────────────────────────────────
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
      const routeInfo = await getDirections(pickupCoords, destinationCoords, GOOGLE_API_KEY);

      if (routeInfo) {
        const km = parseFloat(routeInfo.distanceKm.toFixed(1));
        setRouteCoords(routeInfo.polylinePoints);
        setDistance(km);
        setDuration(routeInfo.durationMin);
        setFare(calcFare(km));
      } else {
        // Fallback: straight-line approximation
        const R = 6371;
        const dLat = ((destinationCoords.latitude  - pickupCoords.latitude)  * Math.PI) / 180;
        const dLon = ((destinationCoords.longitude - pickupCoords.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((pickupCoords.latitude * Math.PI) / 180) *
          Math.cos((destinationCoords.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
        const km = parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
        const mins = Math.round(km * 2.5 + 3);
        setDistance(km);
        setDuration(mins);
        setFare(calcFare(km));
      }
      setIsCalculating(false);
    };

    fetchRoute();
  }, [pickupCoords, destinationCoords]);

  // ── Handle autocomplete selection ─────────────────────────────────────────
  const handleSelectSuggestion = async (item: PlaceSuggestion, field: 'pickup' | 'destination') => {
    setIsCalculating(true);
    setSuggestions([]);
    setActiveField(null);

    const coords = await geocode(item.description, GOOGLE_API_KEY);
    if (field === 'pickup') {
      setPickup(item.description);
      if (coords) setPickupCoords(coords);
    } else {
      setDestination(item.description);
      if (coords) setDestinationCoords(coords);
    }
    setIsCalculating(false);
  };

  // ── Handle map tap for pinning ────────────────────────────────────────────
  const handleMapPress = async (coords: { latitude: number; longitude: number }) => {
    if (pinMode === 'none') return;

    setIsCalculating(true);

    // Reverse geocode the tapped coords to get a human-readable name
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}`;
    let placeName = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
    try {
      const res  = await fetch(url, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
      const json = await res.json();
      if (json.status === 'OK' && json.results && json.results[0]) {
        placeName = json.results[0].formatted_address;
      }
    } catch (_) {}

    if (pinMode === 'pickup') {
      setPickupCoords(coords);
      setPickup(placeName);
      setPinMode('none');
    } else {
      setDestinationCoords(coords);
      setDestination(placeName);
      setPinMode('none');
    }

    setIsCalculating(false);
  };

  // ── Poll booking status ───────────────────────────────────────────────────
  useEffect(() => {
    if (activeBookingId === null) return;

    let mounted = true;
    const interval = setInterval(async () => {
      try {
        const details = await fetchBookingStatus(activeBookingId);
        if (!mounted) return;

        setBookingStatus(details.status_id);

        if (details.status_id === STATUS.TO_PICKUP) {
          setStatusMessage(`Driver ${details.driver_name || 'Partner'} accepted! Heading to pickup...`);
          setDriverInfo({
            name:    details.driver_name    || 'Driver',
            phone:   details.driver_phone   || '',
            plate:   details.vehicle_plate  || 'N/A',
            vehicle: details.vehicle_brand && details.vehicle_model
              ? `${details.vehicle_brand} ${details.vehicle_model}`
              : 'Vehicle',
          });
        } else if (details.status_id === STATUS.ARRIVED) {
          setStatusMessage('Driver has arrived at your pickup location!');
        } else if (details.status_id === STATUS.IN_TRIP) {
          setStatusMessage('Trip started! Heading to your destination...');
        } else if (details.status_id === STATUS.COMPLETED) {
          clearInterval(interval);
          setStatusMessage('Trip completed successfully!');

          // Add to trip history
          setTrips(prev => [{
            id:          String(activeBookingId),
            date:        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time:        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            pickup:      pickup,
            destination: destination,
            price:       fare,
            status:      'Completed' as const,
            driverName:  details.driver_name || 'Driver',
            distance:    `${distance} km`,
            duration:    `${duration} mins`,
          }, ...prev]);

          setBookingSuccess(true);
          setTimeout(() => {
            if (mounted) {
              setBookingSuccess(false);
              setShowPopup(false);
              setDestination('');
              setDestinationCoords(null);
              setRouteCoords([]);
              setActiveBookingId(null);
              setDriverInfo(null);
              setBookingStatus(STATUS.PENDING);
              setStatusMessage('Finding a driver...');
            }
          }, 5000);
        } else if (details.status_id === STATUS.CANCELLED || details.status_id === STATUS.REJECTED) {
          clearInterval(interval);
          setActiveBookingId(null);
          setDriverInfo(null);
          setBookingStatus(STATUS.PENDING);
          setStatusMessage('Finding a driver...');
          Swal.fire({ title: 'Booking Cancelled', text: 'Your booking was cancelled. Please try again.', icon: 'error' });
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }, 2500);

    return () => { mounted = false; clearInterval(interval); };
  }, [activeBookingId, pickup, destination, fare, distance, duration]);

  // ── Book a ride ───────────────────────────────────────────────────────────
  const handleBookRide = async () => {
    if (!destination.trim()) {
      Swal.fire({ title: 'Destination Required', text: 'Please enter or pin a destination on the map.', icon: 'warning' });
      return;
    }
    if (!pickupCoords) {
      Swal.fire({ title: 'Pickup Required', text: 'Please set a pickup location.', icon: 'warning' });
      return;
    }

    const passengerId = userSession?.id;
    if (!passengerId) {
      Swal.fire({ title: 'Not Logged In', text: 'Please log in to book a ride.', icon: 'error' });
      return;
    }

    setIsBooking(true);
    try {
      const response = await createBooking({
        passenger_id:     passengerId,
        start_lat:        pickupCoords.latitude,
        start_lng:        pickupCoords.longitude,
        end_lat:          destinationCoords?.latitude  ?? pickupCoords.latitude,
        end_lng:          destinationCoords?.longitude ?? pickupCoords.longitude,
        distance_km:      distance,
        pickup_name:      pickup,
        destination_name: destination,
        fare:             fare,
      });

      setActiveBookingId(response.bookingId);
      setBookingStatus(STATUS.PENDING);
      setStatusMessage('Finding a driver...');

      // Log to action history
      logActionToDb('Book Ride', `Booking #${response.bookingId} — ${pickup} → ${destination} | ${distance} km | ₱${fare}`);

      await Swal.fire({
        title: 'Booking Sent!',
        text: `Looking for an available driver...\nRoute: ${pickup} → ${destination}\nDistance: ${distance} km | Fare: ₱${fare}`,
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (err: any) {
      Swal.fire({ title: 'Booking Failed', text: err.message || 'Failed to create booking. Please try again.', icon: 'error' });
    } finally {
      setIsBooking(false);
    }
  };

  // ── Cancel booking ─────────────────────────────────────────────────────────
  const handleCancelBooking = () => {
    Swal.fire({
      title: 'Cancel Booking?',
      text: 'Are you sure you want to cancel your booking request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'Keep Waiting',
    }).then((confirmed) => {
      if (confirmed) {
        setActiveBookingId(null);
        setDriverInfo(null);
        setBookingStatus(STATUS.PENDING);
        setStatusMessage('Finding a driver...');
        logActionToDb('Cancel Booking', `Cancelled booking while waiting for driver`);
      }
    });
  };

  return (
    <View style={s.container}>

      {/* ── Google Map ── */}
      <View style={s.mapContainer}>
        <GoogleMap
          pickup={pickupCoords}
          destination={destinationCoords}
          route={routeCoords}
          interactive={true}
          onMapPress={handleMapPress}
        />

        {/* Pin mode banner */}
        {pinMode !== 'none' && (
          <View style={s.pinBanner}>
            <Ionicons name="pin" size={18} color="#FFF" />
            <Text style={s.pinBannerText}>
              Tap map to set {pinMode === 'pickup' ? 'PICKUP' : 'DESTINATION'} pin
            </Text>
            <TouchableOpacity onPress={() => setPinMode('none')} style={s.pinBannerCancel}>
              <Ionicons name="close-circle" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Map pin buttons overlay */}
        {!showPopup && pinMode === 'none' && (
          <View style={s.mapPinButtons}>
            <TouchableOpacity
              style={[s.mapPinBtn, { backgroundColor: '#22B04B' }]}
              onPress={() => setPinMode('pickup')}
            >
              <Ionicons name="location" size={16} color="#FFF" />
              <Text style={s.mapPinBtnText}>Pin Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.mapPinBtn, { backgroundColor: '#1A4FA0' }]}
              onPress={() => setPinMode('destination')}
            >
              <FontAwesome name="flag" size={14} color="#FFF" />
              <Text style={s.mapPinBtnText}>Pin Destination</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Start Button ── */}
      {!showPopup && (
        <RippleButton
          title="Book a Ride"
          style={s.startButton}
          textStyle={s.startButtonText}
          onPress={() => setShowPopup(true)}
        />
      )}

      {/* ── Trip Planning Bottom Sheet ── */}
      <Modal
        visible={showPopup}
        transparent
        animationType="slide"
        onRequestClose={() => { if (!isBooking && !bookingSuccess) setShowPopup(false); }}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => { if (!isBooking && !bookingSuccess) setShowPopup(false); }}
        >
          <TouchableOpacity activeOpacity={1} style={s.sheetContent}>
            <View style={s.dragBar} />

            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Plan Your Trip</Text>
              <Pressable
                style={s.closeButton}
                onPress={() => setShowPopup(false)}
                disabled={isBooking || bookingSuccess}
              >
                <Ionicons name="close" size={24} color="#777" />
              </Pressable>
            </View>

            {/* ── Pickup input ── */}
            <View style={s.inputContainer}>
              <View style={s.inputWrapper}>
                <View style={[s.inputIconBox, { backgroundColor: '#22B04B' }]}>
                  <Ionicons name="location" size={16} color="#FFF" />
                </View>
                <TextInput
                  style={s.textInput}
                  placeholder="Pick up location"
                  value={pickup}
                  onChangeText={(t) => { setPickup(t); setActiveField('pickup'); }}
                  onFocus={() => setActiveField('pickup')}
                  placeholderTextColor="#999"
                  editable={!isBooking && !bookingSuccess}
                />
                <TouchableOpacity
                  style={s.pinIconButton}
                  onPress={() => { setShowPopup(false); setPinMode('pickup'); }}
                >
                  <Ionicons name="pin" size={20} color="#22B04B" />
                </TouchableOpacity>
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
                <View style={s.dot} /><View style={s.dot} /><View style={s.dot} />
              </View>

              {/* ── Destination input ── */}
              <View style={s.inputWrapper}>
                <View style={[s.inputIconBox, { backgroundColor: '#1A4FA0' }]}>
                  <FontAwesome name="flag" size={14} color="#FFF" />
                </View>
                <TextInput
                  style={[s.textInput, { borderColor: '#1A4FA0' }]}
                  placeholder="Enter destination"
                  value={destination}
                  onChangeText={(t) => { setDestination(t); setActiveField('destination'); }}
                  onFocus={() => setActiveField('destination')}
                  placeholderTextColor="#999"
                  autoFocus
                  editable={!isBooking && !bookingSuccess}
                />
                <TouchableOpacity
                  style={s.pinIconButton}
                  onPress={() => { setShowPopup(false); setPinMode('destination'); }}
                >
                  <Ionicons name="pin" size={20} color="#1A4FA0" />
                </TouchableOpacity>
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

            {/* ── Fare estimate ── */}
            {destination.trim().length > 0 && (
              <View style={s.estimateContainer}>
                {isCalculating ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#1A4FA0" />
                    <Text style={{ color: '#1A4FA0', fontWeight: '600' }}>Calculating route...</Text>
                  </View>
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
                      <View>
                        <Text style={s.fareLabel}>Estimated Fare</Text>
                        <Text style={s.fareBreakdown}>₱40 base + ₱15 × {distance} km</Text>
                      </View>
                      <Text style={s.fareValue}>₱{fare.toFixed(2)}</Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* ── Book button ── */}
            <Pressable
              style={[
                s.bookButton,
                (!destination.trim() || isCalculating || isBooking) && { backgroundColor: '#A2C2E7' },
              ]}
              disabled={!destination.trim() || isCalculating || isBooking || bookingSuccess}
              onPress={handleBookRide}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.25)' }}
            >
              {isBooking ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={s.bookButtonText}>
                  {distance > 0 ? `Book Ride — ₱${fare}` : 'Book Ride Now'}
                </Text>
              )}
            </Pressable>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Live Booking Status Overlay ── */}
      <Modal visible={activeBookingId !== null && !bookingSuccess} transparent animationType="slide">
        <View style={s.successOverlay}>
          <View style={s.successCard}>
            <View style={[s.successIconBg, { backgroundColor: bookingStatus === STATUS.PENDING ? '#1A4FA0' : '#22B04B' }]}>
              {bookingStatus === STATUS.PENDING ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : (
                <Ionicons name="car-sport" size={42} color="#FFF" />
              )}
            </View>

            <Text style={s.successTitle}>
              {bookingStatus === STATUS.PENDING   ? 'Finding Driver...' :
               bookingStatus === STATUS.TO_PICKUP ? 'Driver On The Way' :
               bookingStatus === STATUS.ARRIVED   ? 'Driver Arrived!'  :
               bookingStatus === STATUS.IN_TRIP   ? 'Trip In Progress' : 'Almost There!'}
            </Text>

            <Text style={s.statusMsg}>{statusMessage}</Text>

            {driverInfo && (
              <View style={s.receiptCard}>
                <Text style={s.receiptSectionTitle}>Driver Information</Text>
                <View style={s.receiptRow}>
                  <Text style={s.receiptLabel}>Driver:</Text>
                  <Text style={s.receiptVal}>{driverInfo.name}</Text>
                </View>
                <View style={s.receiptRow}>
                  <Text style={s.receiptLabel}>Contact:</Text>
                  <Text style={s.receiptVal}>{driverInfo.phone}</Text>
                </View>
                <View style={s.receiptRow}>
                  <Text style={s.receiptLabel}>Vehicle:</Text>
                  <Text style={s.receiptVal}>{driverInfo.vehicle}</Text>
                </View>
                <View style={s.receiptRow}>
                  <Text style={s.receiptLabel}>Plate:</Text>
                  <Text style={s.receiptVal}>{driverInfo.plate}</Text>
                </View>
              </View>
            )}

            <View style={[s.receiptCard, { marginTop: 10 }]}>
              <Text style={s.receiptSectionTitle}>Trip Details</Text>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Pickup:</Text>
                <Text style={s.receiptVal} numberOfLines={2}>{pickup}</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>To:</Text>
                <Text style={s.receiptVal} numberOfLines={2}>{destination}</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Distance:</Text>
                <Text style={s.receiptVal}>{distance} km</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Total Fare:</Text>
                <Text style={[s.receiptVal, { color: '#22B04B', fontWeight: '900', fontSize: 16 }]}>₱{fare.toFixed(2)}</Text>
              </View>
            </View>

            {bookingStatus === STATUS.PENDING && (
              <TouchableOpacity style={s.cancelBtn} onPress={handleCancelBooking}>
                <Text style={s.cancelBtnText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Trip Complete Overlay ── */}
      <Modal visible={bookingSuccess} transparent animationType="fade">
        <View style={s.successOverlay}>
          <View style={s.successCard}>
            <View style={s.successIconBg}>
              <Ionicons name="checkmark-circle" size={54} color="#FFF" />
            </View>
            <Text style={s.successTitle}>Trip Complete! 🎉</Text>
            <Text style={s.statusMsg}>Your ride has been completed successfully.</Text>
            <View style={s.receiptCard}>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>From:</Text>
                <Text style={s.receiptVal} numberOfLines={2}>{pickup}</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>To:</Text>
                <Text style={s.receiptVal} numberOfLines={2}>{destination}</Text>
              </View>
              {driverInfo && (
                <View style={s.receiptRow}>
                  <Text style={s.receiptLabel}>Driver:</Text>
                  <Text style={s.receiptVal}>{driverInfo.name}</Text>
                </View>
              )}
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Distance:</Text>
                <Text style={s.receiptVal}>{distance} km</Text>
              </View>
              <View style={s.receiptRow}>
                <Text style={s.receiptLabel}>Total Paid:</Text>
                <Text style={[s.receiptVal, { color: '#22B04B', fontWeight: '900', fontSize: 17 }]}>₱{fare.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#EAF1FB' },
  mapContainer:  { flex: 1, position: 'relative' },

  // Map overlay buttons
  pinBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#1A4FA0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    elevation: 8,
    zIndex: 10,
  },
  pinBannerText:   { flex: 1, color: '#FFF', fontWeight: '700', fontSize: 14 },
  pinBannerCancel: { padding: 2 },

  mapPinButtons: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
    zIndex: 10,
  },
  mapPinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 4,
  },
  mapPinBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  // Start button
  startButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#1A4FA0',
    width: '80%',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  startButtonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },

  // Bottom sheet modal
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  dragBar:    { width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 15 },
  sheetHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A4FA0' },
  closeButton:{ padding: 4 },

  // Inputs
  inputContainer: { marginBottom: 16 },
  inputWrapper:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, height: 48, backgroundColor: '#FFF', paddingHorizontal: 12, marginBottom: 4 },
  inputIconBox:   { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  textInput:      { flex: 1, height: '100%', fontSize: 15, color: '#333' },
  pinIconButton:  { padding: 4 },
  connectorDots:  { marginLeft: 22, marginVertical: 4, gap: 3 },
  dot:            { width: 4, height: 4, borderRadius: 2, backgroundColor: '#A2C2E7' },

  // Suggestions
  suggestionsList: { maxHeight: 150, backgroundColor: '#FFF', borderColor: '#E2E8F0', borderWidth: 1.5, borderRadius: 10, marginBottom: 8 },
  suggestionItem:  { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#EAF1FB' },
  suggestionText:  { fontSize: 14, color: '#333', flex: 1 },

  // Estimate
  estimateContainer: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: '#EAF1FB', marginBottom: 20 },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 14 },
  summaryItem:    { alignItems: 'center', flex: 1 },
  summaryLabel:   { fontSize: 12, color: '#666', marginTop: 4 },
  summaryValue:   { fontSize: 16, fontWeight: 'bold', color: '#1A4FA0', marginTop: 2 },
  verticalDivider:{ width: 1.5, height: 36, backgroundColor: '#E2E8F0' },
  fareDisplay:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12 },
  fareLabel:      { fontSize: 15, fontWeight: '600', color: '#333' },
  fareBreakdown:  { fontSize: 11, color: '#999', marginTop: 2 },
  fareValue:      { fontSize: 22, fontWeight: '900', color: '#22B04B' },

  // Book button
  bookButton:     { backgroundColor: '#1A4FA0', borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center' },
  bookButtonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },

  // Status / success overlays
  successOverlay: { flex: 1, backgroundColor: 'rgba(26,79,160,0.92)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successCard:    { backgroundColor: '#FFF', borderRadius: 24, padding: 28, width: '100%', maxWidth: 380, alignItems: 'center' },
  successIconBg:  { width: 84, height: 84, borderRadius: 42, backgroundColor: '#22B04B', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  successTitle:   { fontSize: 22, fontWeight: 'bold', color: '#1A4FA0', marginBottom: 6, textAlign: 'center' },
  statusMsg:      { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 16, lineHeight: 20 },

  receiptCard:         { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, width: '100%', borderWidth: 1.5, borderColor: '#EAF1FB', gap: 6 },
  receiptSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A4FA0', marginBottom: 4 },
  receiptRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  receiptLabel:        { fontSize: 13, color: '#888', fontWeight: '600', minWidth: 70 },
  receiptVal:          { fontSize: 13, color: '#333', flex: 1, textAlign: 'right', fontWeight: '500' },

  cancelBtn:     { marginTop: 16, borderWidth: 1.5, borderColor: '#D02A30', borderRadius: 10, paddingHorizontal: 28, paddingVertical: 10 },
  cancelBtnText: { color: '#D02A30', fontWeight: '700', fontSize: 15 },
});
