/**
 * Web fallback for the Home / Map screen.
 * react-native-maps is a native-only package, so this file is
 * used by Metro on web while home.native.tsx is used on iOS/Android.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import RippleButton from '../../components/RippleButton';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { usePassengerData } from '../_layout';

export default function HomeScreen() {
  const { setTrips } = usePassengerData();
  const [showPopup, setShowPopup] = useState(false);
  const [pickup, setPickup] = useState('Current Location (Candaba, Pampanga)');
  const [destination, setDestination] = useState('');

  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fare, setFare] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!destination.trim()) {
      setDistance(0);
      setDuration(0);
      setFare(0);
      return;
    }

    setIsCalculating(true);
    const timer = setTimeout(() => {
      const length = destination.trim().length;
      const computedDistance = Math.min(25, Math.max(1.8, (length * 0.6) + 1.2));
      const computedDuration = Math.round(computedDistance * 2.2 + 3);
      const computedFare = Math.round(40 + (computedDistance * 15));

      setDistance(parseFloat(computedDistance.toFixed(1)));
      setDuration(computedDuration);
      setFare(computedFare);
      setIsCalculating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [destination]);

  const handleBookRide = () => {
    if (!destination.trim()) {
      alert('Please enter a destination location.');
      return;
    }

    setIsBooking(true);

    setTimeout(() => {
      setIsBooking(false);
      setBookingSuccess(true);

      const newTrip = {
        id: String(Date.now()),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        pickup: pickup,
        destination: destination,
        price: fare,
        status: 'Completed' as const,
      };

      setTrips(prev => [newTrip, ...prev]);

      setTimeout(() => {
        setBookingSuccess(false);
        setShowPopup(false);
        setDestination('');
      }, 2500);
    }, 2000);
  };

  return (
    <View style={s.container}>
      {/* ── Web Map Fallback ── */}
      <View style={s.webMapContainer}>
        <Image
          source={require('../../assets/images/map_background.png')}
          style={s.webMapImage}
          resizeMode="cover"
        />
        {/* Custom floating marker */}
        <View style={s.webPinPosition}>
          <View style={s.pulseWave} />
          <View style={s.pinOuterCircle}>
            <View style={s.pinInnerCircle} />
          </View>
        </View>
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
                  placeholderTextColor="#999"
                  editable={!isBooking && !bookingSuccess}
                />
              </View>

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
                  placeholderTextColor="#999"
                  autoFocus
                  editable={!isBooking && !bookingSuccess}
                />
              </View>
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

      {/* ── Booking Success Overlay Modal ── */}
      <Modal visible={bookingSuccess} transparent animationType="fade">
        <View style={s.successOverlay}>
          <View style={s.successCard}>
            <View style={s.successIconBg}>
              <Ionicons name="checkmark-circle" size={54} color="#FFF" />
            </View>
            <Text style={s.successTitle}>Booking Confirmed!</Text>
            <Text style={s.successSubtitle}>Your driver is on the way to pick you up.</Text>
            <View style={s.receiptCard}>
              <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>Pickup:</Text> {pickup}</Text>
              <Text style={s.receiptText}><Text style={{ fontWeight: '700' }}>To:</Text> {destination}</Text>
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
});
