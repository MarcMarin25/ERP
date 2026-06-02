import { Stack } from 'expo-router';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, getCurrentSession, setCurrentSession, clearCurrentSession } from '../utils/mockDb';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Prevent the splash screen from auto-hiding so we can preload assets
SplashScreen.preventAutoHideAsync().catch(() => {});


// Define context interfaces
export interface Trip {
  id: string;
  date: string;
  time: string;
  pickup: string;
  destination: string;
  price: number;
  status: 'Completed' | 'Cancelled';
}

export interface PinnedLocation {
  id: string;
  name: string;
  address: string;
}

export interface ProfileData {
  username: string;
  fullName: string;
  gender: string;
  dob: string;
  age: string;
  mobile: string;
  email: string;
  address: string;
  createdAt: string;
}

interface PassengerDataContextType {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  pinnedLocations: PinnedLocation[];
  setPinnedLocations: React.Dispatch<React.SetStateAction<PinnedLocation[]>>;
}

export const PassengerDataContext = createContext<PassengerDataContextType | undefined>(undefined);

export interface AuthContextType {
  userSession: UserSession | null;
  isLoading: boolean;
  login: (session: UserSession) => Promise<void>;
  logout: () => Promise<void>;
  updateSessionProfile: (profile: Partial<UserSession>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function usePassengerData() {
  const context = useContext(PassengerDataContext);
  if (!context) {
    throw new Error('usePassengerData must be used within a PassengerDataProvider');
  }
  return context;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...FontAwesome.font,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hide the splash screen only after fonts have loaded and database state is loaded
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn('Failed to hide splash screen:', err);
      });
    }
  }, [fontsLoaded, fontError, isLoading]);


  const [profile, setProfile] = useState<ProfileData>({
    username: "Marc Marin",
    fullName: "Marc Francis P. Marin",
    gender: "Male",
    dob: "2003-09-25",
    age: "22",
    mobile: "09613354271",
    email: "marcmarin9800@gmail.com",
    address: "Region III, Pampanga, Candaba",
    createdAt: "",
  });

  // Load session from AsyncStorage on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const session = await getCurrentSession();
        if (session) {
          setUserSession(session);
          if (session.role === 'passenger') {
            setProfile({
              username: session.username,
              fullName: session.fullName,
              gender: session.gender || 'Male',
              dob: session.dob,
              age: session.age,
              mobile: session.mobile,
              email: session.email,
              address: session.address,
              createdAt: session.createdAt || '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (session: UserSession) => {
    await setCurrentSession(session);
    setUserSession(session);
    if (session.role === 'passenger') {
      setProfile({
        username: session.username,
        fullName: session.fullName,
        gender: session.gender || 'Male',
        dob: session.dob,
        age: session.age,
        mobile: session.mobile,
        email: session.email,
        address: session.address,
        createdAt: session.createdAt || '',
      });
    }
  };

  const logout = async () => {
    await clearCurrentSession();
    setUserSession(null);
  };

  const updateSessionProfile = async (updatedFields: Partial<UserSession>) => {
    if (userSession) {
      const newSession = { ...userSession, ...updatedFields };
      await setCurrentSession(newSession);
      setUserSession(newSession);
      if (newSession.role === 'passenger') {
        setProfile({
          username: newSession.username,
          fullName: newSession.fullName,
          gender: newSession.gender || 'Male',
          dob: newSession.dob,
          age: newSession.age,
          mobile: newSession.mobile,
          email: newSession.email,
          address: newSession.address,
          createdAt: newSession.createdAt || '',
        });
      }
    }
  };

  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      date: 'May 28, 2026',
      time: '09:30 AM',
      pickup: 'Holy Angel University, Angeles City',
      destination: 'Candaba, Pampanga',
      price: 320.00,
      status: 'Completed'
    },
    {
      id: '2',
      date: 'May 26, 2026',
      time: '02:15 PM',
      pickup: 'Candaba, Pampanga',
      destination: 'SM City Pampanga, San Fernando',
      price: 240.00,
      status: 'Completed'
    },
    {
      id: '3',
      date: 'May 25, 2026',
      time: '11:00 AM',
      pickup: 'Clark Airport, Angeles City',
      destination: 'Candaba, Pampanga',
      price: 450.00,
      status: 'Cancelled'
    }
  ]);

  const [pinnedLocations, setPinnedLocations] = useState<PinnedLocation[]>([
    { id: '1', name: 'Home', address: 'Candaba, Pampanga, Region III' },
    { id: '2', name: 'Work', address: 'Clark Freeport Zone, Angeles City' },
    { id: '3', name: 'School', address: 'Holy Angel University, City of San Fernando' }
  ]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent />
      <AuthContext.Provider value={{ userSession, isLoading, login, logout, updateSessionProfile }}>
        <PassengerDataContext.Provider value={{ profile, setProfile, trips, setTrips, pinnedLocations, setPinnedLocations }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="role-select" />
            <Stack.Screen name="passenger-auth" />
            <Stack.Screen name="driver-auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(driver-tabs)" />
          </Stack>
        </PassengerDataContext.Provider>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
