import AsyncStorage from '@react-native-async-storage/async-storage';

const PASSENGERS_DB_KEY = '@passengers_db';
const DRIVERS_DB_KEY = '@drivers_db';
const USER_SESSION_KEY = '@user_session';

export interface Passenger {
  username: string;
  fullName: string;
  gender: string;
  dob: string;
  age: string;
  mobile: string;
  email: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  address: string;
  password?: string; // Keep for signin check
  createdAt: string; // ISO timestamp of account creation
}

export interface Driver {
  username: string;
  fullName: string;
  dob: string;
  age: string;
  mobile: string;
  email: string;
  region: string;
  province: string;
  cityBarangay: string;
  address: string;
  licenseNumber: string;
  licenseIssued: string;
  licenseExpiry: string;
  preferredShift: string;
  password?: string; // Keep for signin check
  createdAt: string; // ISO timestamp of account creation
}

export interface UserSession {
  role: 'passenger' | 'driver';
  username: string;
  fullName: string;
  dob: string;
  age: string;
  mobile: string;
  email: string;
  address: string;
  createdAt: string; // ISO timestamp of account creation
  // Specific to passenger or driver
  gender?: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  cityBarangay?: string;
  licenseNumber?: string;
  licenseIssued?: string;
  licenseExpiry?: string;
  preferredShift?: string;
}

/**
 * Fetch all registered passengers from the mock DB
 */
export async function getPassengers(): Promise<Passenger[]> {
  try {
    const data = await AsyncStorage.getItem(PASSENGERS_DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching passengers:', error);
    return [];
  }
}

/**
 * Fetch all registered drivers from the mock DB
 */
export async function getDrivers(): Promise<Driver[]> {
  try {
    const data = await AsyncStorage.getItem(DRIVERS_DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
}

/**
 * Register a new passenger. Throws error if phone number is already registered.
 */
export async function registerPassenger(passenger: Passenger): Promise<Passenger> {
  const passengers = await getPassengers();
  
  // Check if passenger mobile already exists
  const exists = passengers.some(p => p.mobile === passenger.mobile);
  if (exists) {
    throw new Error('A passenger with this mobile number is already registered.');
  }

  // Stamp the account creation time
  passenger.createdAt = new Date().toISOString();

  passengers.push(passenger);
  await AsyncStorage.setItem(PASSENGERS_DB_KEY, JSON.stringify(passengers));
  return passenger;
}

/**
 * Register a new driver. Throws error if phone number is already registered.
 */
export async function registerDriver(driver: Driver): Promise<Driver> {
  const drivers = await getDrivers();

  // Check if driver mobile already exists
  const exists = drivers.some(d => d.mobile === driver.mobile);
  if (exists) {
    throw new Error('A driver with this mobile number is already registered.');
  }

  // Stamp the account creation time
  driver.createdAt = new Date().toISOString();

  drivers.push(driver);
  await AsyncStorage.setItem(DRIVERS_DB_KEY, JSON.stringify(drivers));
  return driver;
}

/**
 * Authenticate passenger by mobile and password
 */
export async function loginPassenger(mobile: string, password: string): Promise<Passenger> {
  const passengers = await getPassengers();
  const passenger = passengers.find(p => p.mobile === mobile && p.password === password);
  if (!passenger) {
    throw new Error('Invalid mobile number or password.');
  }
  return passenger;
}

/**
 * Authenticate driver by mobile and password
 */
export async function loginDriver(mobile: string, password: string): Promise<Driver> {
  const drivers = await getDrivers();
  const driver = drivers.find(d => d.mobile === mobile && d.password === password);
  if (!driver) {
    throw new Error('Invalid mobile number or password.');
  }
  return driver;
}

/**
 * Get the currently logged in user session
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

/**
 * Save the active user session locally
 */
export async function setCurrentSession(session: UserSession): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

/**
 * Clear the user session (Logout)
 */
export async function clearCurrentSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}
