import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform, Text, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../_layout';

export default function TabLayout() {
  const { userSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#1A4FA0" />
      </View>
    );
  }

  if (!userSession || userSession.role !== 'passenger') {
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
        <Tabs.Screen name="history" options={{ title: 'History' }} />
        <Tabs.Screen name="pinned" options={{ title: 'Pinned' }} />
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="support" options={{ title: 'Support' }} />
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
      {/* Outer borders and shadow wrapper */}
      <View style={s.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            triggerHaptic();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Render home tab in center
          if (route.name === 'home') {
            return (
              <View key={route.key} style={s.homeTabWrapper}>
                <TouchableOpacity
                  onPress={onPress}
                  activeOpacity={0.85}
                  style={[s.homeButton, isFocused && s.homeButtonActive]}
                >
                  <Ionicons name="home" size={32} color="#FFF" />
                </TouchableOpacity>
              </View>
            );
          }

          // Icon mapper for other tabs
          let iconComponent;
          if (route.name === 'history') {
            iconComponent = <FontAwesome name="car" size={22} color={isFocused ? '#1A4FA0' : '#1A4FA0'} />;
          } else if (route.name === 'pinned') {
            iconComponent = <MaterialCommunityIcons name="map-marker-star" size={24} color={isFocused ? '#1A4FA0' : '#1A4FA0'} />;
          } else if (route.name === 'support') {
            iconComponent = <MaterialCommunityIcons name="chat-processing-outline" size={24} color={isFocused ? '#1A4FA0' : '#1A4FA0'} />;
          } else if (route.name === 'profile') {
            iconComponent = (
              <View style={s.avatarBorder}>
                <View style={s.avatarBg}>
                  <Text style={{ fontSize: 13 }}>👦</Text>
                </View>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={s.tabItem}
            >
              {route.name === 'profile' ? (
                <View style={[s.iconCircle, isFocused && s.activeIconCircle]}>
                  {iconComponent}
                </View>
              ) : (
                <View style={[s.iconCircle, isFocused && s.activeIconCircle]}>
                  {iconComponent}
                </View>
              )}
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }
    })
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
    borderColor: '#EAF1FB',
    borderBottomWidth: 0,
    paddingHorizontal: 10,
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
    borderWidth: 1.5,
    borderColor: '#1A4FA0',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1A4FA0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      }
    })
  },
  activeIconCircle: {
    backgroundColor: '#EAF1FB',
    borderColor: '#1A4FA0',
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  homeTabWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    zIndex: 10,
  },
  homeButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1A4FA0',
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1A4FA0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        cursor: 'pointer',
        boxShadow: '0px 6px 12px rgba(26, 79, 160, 0.3)'
      }
    })
  },
  homeButtonActive: {
    backgroundColor: '#163D80',
    transform: [{ scale: 1.05 }],
  },
  avatarBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D6E4F7',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
