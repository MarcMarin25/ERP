import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const USER_SESSION_KEY = '@user_session';

export interface Passenger {
  id?: number;
  username: string;
  name: string;
  gender: string;
  birth_date: string;
  age: string;
  phone: string;
  email: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  address: string;
  password?: string;
  created_at: string;
}

export interface Driver {
  id?: number;
  username: string;
  name: string;
  birth_date: string;
  age: string;
  phone: string;
  email: string;
  region: string;
  province: string;
  city_barangay: string;
  address: string;
  license_number: string;
  license_issued: string;
  license_expiry: string;
  shift: string;
  password?: string;
  created_at: string;
}

export interface UserSession {
  id?: number;
  role: 'passenger' | 'driver';
  username: string;
  name: string;
  birth_date: string;
  age: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
  // Specific to passenger or driver
  gender?: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  city_barangay?: string;
  license_number?: string;
  license_issued?: string;
  license_expiry?: string;
  shift?: string;
}

// Automatically detect the PC host IP for Metro/Expo bundling environment,
// so it connects cleanly across Android emulators, iOS simulators, and physical phones on local Wi-Fi.
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Default Android Emulator host bridge
  }
  return 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();
console.log('React Native API Base URL configured:', BASE_URL);

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 12000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          ...(init?.headers || {}),
          'Bypass-Tunnel-Reminder': 'true',
        },
      });

      clearTimeout(timeoutId);
      return res;
    } catch (err: any) {
      console.warn(`[Attempt ${attempt}/${MAX_RETRIES}] Network error for ${url}:`, err.message);

      if (attempt === MAX_RETRIES) {
        console.error('All retry attempts exhausted for:', url);
        throw new Error(
          'Unable to connect to the server. Please check your internet connection and make sure the server is running.'
        );
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Fallback (should never reach here)
  throw new Error('Network request failed after retries.');
}

/**
 * Register a new passenger to the live MySQL database via backend
 */
export async function registerPassenger(passenger: Passenger): Promise<Passenger> {
  const res = await safeFetch(`${BASE_URL}/api/passengers/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    },
    body: JSON.stringify(passenger)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Passenger registration failed.');
  }
  return data;
}

/**
 * Register a new driver to the live MySQL database via backend
 */
export async function registerDriver(driver: Driver): Promise<Driver> {
  const res = await safeFetch(`${BASE_URL}/api/drivers/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    },
    body: JSON.stringify(driver)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Driver registration failed.');
  }
  return data;
}

/**
 * Authenticate passenger by phone and password in MySQL
 */
export async function loginPassenger(phone: string, password: string): Promise<Passenger> {
  const res = await safeFetch(`${BASE_URL}/api/passengers/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    },
    body: JSON.stringify({ phone, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Invalid phone number or password.');
  }
  return data;
}

/**
 * Authenticate driver by phone and password in MySQL
 */
export async function loginDriver(phone: string, password: string): Promise<Driver> {
  const res = await safeFetch(`${BASE_URL}/api/drivers/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    },
    body: JSON.stringify({ phone, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Invalid phone number or password.');
  }
  return data;
}

/**
 * Update user profile details in the live MySQL database
 */
export async function updateProfileInDb(session: UserSession): Promise<void> {
  const res = await safeFetch(`${BASE_URL}/api/session/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    },
    body: JSON.stringify(session)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to save profile changes to the database.');
  }
}

/**
 * Log user action history directly to the phpMyAdmin database
 */
export async function logActionToDb(action: string, details?: string): Promise<void> {
  try {
    const session = await getCurrentSession();
    const body: any = {
      action,
      details,
    };
    if (session) {
      body.user_id = session.id;
      body.role = session.role;
      body.username = session.username;
    }
    
    await safeFetch(`${BASE_URL}/api/actions/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error('Failed to log action to DB:', error);
  }
}

/**
 * --- NEW BOOKING DATABASE WRAPPERS ---
 */

export interface BookingRequest {
  passenger_id: number;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  distance_km: number;
  pickup_name: string;
  destination_name: string;
  fare: number;
}

export interface BookingResponse {
  bookingId: number;
  status_id: number;
  message: string;
}

export interface BookingDetails {
  id: number;
  status_id: number;
  status_name: string;
  driver_id: number | null;
  vehicle_id: number | null;
  passenger_id: number;
  start_trip: string | null;
  end_trip: string | null;
  start_lat: string;
  start_lng: string;
  end_lat: string | null;
  end_lng: string | null;
  distance_km: string | null;
  route_path: string | null;
  passenger_name: string;
  passenger_phone: string;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_plate: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
}

/**
 * Creates a new booking in the MySQL database (routes table)
 */
export async function createBooking(booking: BookingRequest): Promise<BookingResponse> {
  const res = await safeFetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    },
    body: JSON.stringify(booking)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create booking.');
  }
  return data;
}

/**
 * Fetches all unassigned pending bookings for driver notification
 */
export async function fetchPendingBookings(): Promise<BookingDetails[]> {
  const res = await safeFetch(`${BASE_URL}/api/bookings/pending`, {
    method: 'GET',
    headers: {
      'Bypass-Tunnel-Reminder': 'true'
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch pending bookings.');
  }
  return data;
}

/**
 * Fetches booking details and status from the database
 */
export async function fetchBookingStatus(bookingId: number | string): Promise<BookingDetails> {
  const res = await safeFetch(`${BASE_URL}/api/bookings/${bookingId}`, {
    method: 'GET',
    headers: {
      'Bypass-Tunnel-Reminder': 'true'
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch booking details.');
  }
  return data;
}

/**
 * Driver accepts the booking
 */
export async function acceptBooking(bookingId: number | string, driverId: number): Promise<{ message: string; status_id: number }> {
  const res = await safeFetch(`${BASE_URL}/api/bookings/${bookingId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    },
    body: JSON.stringify({ driver_id: driverId })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to accept booking.');
  }
  return data;
}

/**
 * Driver marks as arrived at passenger's pickup location
 */
export async function updateBookingArrived(bookingId: number | string): Promise<{ message: string; status_id: number }> {
  const res = await safeFetch(`${BASE_URL}/api/bookings/${bookingId}/arrive`, {
    method: 'POST',
    headers: {
      'Bypass-Tunnel-Reminder': 'true'
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to mark arrival.');
  }
  return data;
}

/**
 * Driver starts the trip
 */
export async function startBookingTrip(bookingId: number | string): Promise<{ message: string; status_id: number }> {
  const res = await safeFetch(`${BASE_URL}/api/bookings/${bookingId}/start`, {
    method: 'POST',
    headers: {
      'Bypass-Tunnel-Reminder': 'true'
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to start trip.');
  }
  return data;
}

/**
 * Driver completes the trip (generates invoice/revenue entry)
 */
export async function endBookingTrip(bookingId: number | string, fare: number): Promise<{ message: string; status_id: number }> {
  const res = await safeFetch(`${BASE_URL}/api/bookings/${bookingId}/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    },
    body: JSON.stringify({ fare })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to complete trip.');
  }
  return data;
}

/**
 * Fetches all bookings history for a specific passenger from the database
 */
export async function fetchPassengerBookings(passengerId: number): Promise<any[]> {
  const res = await safeFetch(`${BASE_URL}/api/bookings/passenger/${passengerId}`, {
    method: 'GET',
    headers: {
      'Bypass-Tunnel-Reminder': 'true'
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch passenger bookings.');
  }
  return data;
}

/**
 * Keep the logged in user session cached locally on the device (Local Persistence)
 */
export async function getCurrentSession(): Promise<UserSession | null> {
  try {
    const sessionStr = await AsyncStorage.getItem(USER_SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

export async function setCurrentSession(session: UserSession): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

export async function clearCurrentSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

