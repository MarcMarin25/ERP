import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../_layout';

export default function DriverTabLayout() {
  const { userSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#1A4FA0" />
      </View>
    );
  }

  if (!userSession || userSession.role !== 'driver') {
    return <Redirect href="/welcome" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['bottom']}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="earnings" options={{ title: 'Earnings' }} />
        <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="vehicle-logs" options={{ title: 'Vehicle Logs' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </SafeAreaView>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={s.tabBarContainer}>
      {/* Background SVG-like curved visual shape using CSS */}
      <View style={s.tabBarCurveWrapper}>
        <View style={s.tabBarLeftCurve} />
        <View style={s.tabBarCenterDip} />
        <View style={s.tabBarRightCurve} />
      </View>

      <View style={s.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            triggerHaptic();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventAllowed: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Center Home Tab Button
          if (route.name === 'home') {
            return (
              <View key={route.key} style={s.homeTabWrapper}>
                <View style={s.homeOutlineCircle}>
                  <TouchableOpacity
                    onPress={onPress}
                    activeOpacity={0.85}
                    style={s.homeButton}
                  >
                    <Ionicons name="home" size={28} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          // Icon components for the other 4 tabs
          let iconComponent;
          if (route.name === 'earnings') {
            // Clock/Arrow history icon
            iconComponent = <FontAwesome name="history" size={20} color={isFocused ? '#FFF' : '#1A4FA0'} />;
          } else if (route.name === 'transactions') {
            // Document/Coin icon
            iconComponent = <MaterialCommunityIcons name="file-document-outline" size={22} color={isFocused ? '#FFF' : '#1A4FA0'} />;
          } else if (route.name === 'vehicle-logs') {
            // Car side profile icon
            iconComponent = <FontAwesome name="car" size={20} color={isFocused ? '#FFF' : '#1A4FA0'} />;
          } else if (route.name === 'profile') {
            // 4-line Hamburger Menu icon
            iconComponent = <Ionicons name="menu" size={22} color={isFocused ? '#FFF' : '#1A4FA0'} />;
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={s.tabItem}
            >
              <View style={[s.iconCircle, isFocused ? s.activeIconCircle : s.inactiveIconCircle]}>
                {iconComponent}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  tabBarCurveWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 65,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  tabBarLeftCurve: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderWidth: 1.5,
    borderColor: '#777',
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  tabBarCenterDip: {
    width: 90,
    height: 65,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  tabBarRightCurve: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopRightRadius: 30,
    borderWidth: 1.5,
    borderColor: '#777',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  tabBarContent: {
    height: 65,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1.5,
    borderColor: '#777',
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    // Add shadow styling
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px -3px 8px rgba(0,0,0,0.1)',
      }
    })
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconCircle: {
    backgroundColor: '#1A4FA0',
    borderWidth: 0,
  },
  inactiveIconCircle: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#1A4FA0',
  },
  homeTabWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -45,
    zIndex: 20,
  },
  homeOutlineCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: '#1A4FA0',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    // We add a white circle behind to simulate the cutout overlay and push it down
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
      }
    })
  },
  homeButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1A4FA0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
