import { Stack } from 'expo-router';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, getCurrentSession, setCurrentSession, clearCurrentSession, updateProfileInDb } from '../utils/mockDb';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SwalContainer } from '../components/Swal';

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
  driverName?: string;
  distance?: string;
  duration?: string;
  isFavorite?: boolean;
}

export interface PinnedLocation {
  id: string;
  name: string;
  address: string;
}

export interface ProfileData {
  username: string;
  name: string;
  gender: string;
  birth_date: string;
  age: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
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
    name: "Marc Francis P. Marin",
    gender: "Male",
    birth_date: "2003-09-25",
    age: "22",
    phone: "09613354271",
    email: "marcmarin9800@gmail.com",
    address: "Region III, Pampanga, Candaba",
    created_at: "",
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
              name: session.name,
              gender: session.gender || 'Male',
              birth_date: session.birth_date,
              age: session.age,
              phone: session.phone,
              email: session.email,
              address: session.address,
              created_at: session.created_at || '',
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
        name: session.name,
        gender: session.gender || 'Male',
        birth_date: session.birth_date,
        age: session.age,
        phone: session.phone,
        email: session.email,
        address: session.address,
        created_at: session.created_at || '',
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
      await updateProfileInDb(newSession);
      await setCurrentSession(newSession);
      setUserSession(newSession);
      if (newSession.role === 'passenger') {
        setProfile({
          username: newSession.username,
          name: newSession.name,
          gender: newSession.gender || 'Male',
          birth_date: newSession.birth_date,
          age: newSession.age,
          phone: newSession.phone,
          email: newSession.email,
          address: newSession.address,
          created_at: newSession.created_at || '',
        });
      }
    }
  };

  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      date: 'Jun 03',
      time: '4:30 PM',
      pickup: 'Yukon Street, Riverside Subdivision, Angeles, Central Luzon, 2009',
      destination: 'Shuntog Street, Rizal Monument, District 18, Central Business Distric...',
      price: 2604.01,
      status: 'Cancelled',
      driverName: 'Mico',
      distance: '166.63 km',
      duration: '6 mins'
    },
    {
      id: '2',
      date: 'May 26',
      time: '9:46 AM',
      pickup: 'Calibutbut, Angeles, Central Luzon, 2001',
      destination: 'Ganza Parking, Otek Street, Purok 8, Abanao - Za... Chugum - Ka...',
      price: 1721.43,
      status: 'Cancelled',
      driverName: 'Mico',
      distance: '110.15 km',
      duration: '4 mins'
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
          <SwalContainer />
        </PassengerDataContext.Provider>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
