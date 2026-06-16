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
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
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

/**
 * Register a new passenger to the live MySQL database via backend
 */
export async function registerPassenger(passenger: Passenger): Promise<Passenger> {
  const res = await fetch(`${BASE_URL}/api/passengers/register`, {
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
  const res = await fetch(`${BASE_URL}/api/drivers/register`, {
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
  const res = await fetch(`${BASE_URL}/api/passengers/login`, {
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
  const res = await fetch(`${BASE_URL}/api/drivers/login`, {
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
  const res = await fetch(`${BASE_URL}/api/session/update`, {
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
