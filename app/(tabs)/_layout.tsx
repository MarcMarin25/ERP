import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform, Text, ActivityIndicator, Image } from 'react-native';
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
            const homeSource = isFocused 
              ? require('../../assets/images/home page icon BLUE.png') 
              : require('../../assets/images/home page icon.png');
            return (
              <View key={route.key} style={s.homeTabWrapper}>
                <TouchableOpacity
                  onPress={onPress}
                  activeOpacity={0.85}
                  style={s.homeButtonContainer}
                >
                  <Image source={homeSource} style={s.homeImage} />
                </TouchableOpacity>
              </View>
            );
          }

          // Icon mapper for other passenger tabs
          let iconSource;
          if (route.name === 'history') {
            iconSource = isFocused 
              ? require('../../assets/images/HISTORY ICON BLUE.png') 
              : require('../../assets/images/HISTORY ICON.png');
          } else if (route.name === 'pinned') {
            iconSource = isFocused 
              ? require('../../assets/images/DASHBOARD ICON BLUE.png') 
              : require('../../assets/images/DASHBOARD ICON.png');
          } else if (route.name === 'support') {
            iconSource = require('../../assets/images/icon vio and supp.png');
          } else if (route.name === 'profile') {
            iconSource = isFocused 
              ? require('../../assets/images/PROFILE BLUE ICON.png') 
              : require('../../assets/images/prof icon.png');
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={s.tabItem}
            >
              <Image source={iconSource} style={s.tabImage} />
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
  tabImage: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  homeTabWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -38,
    zIndex: 10,
  },
  homeButtonContainer: {
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1A4FA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        cursor: 'pointer',
        boxShadow: '0px 4px 8px rgba(26, 79, 160, 0.2)'
      }
    })
  },
  homeImage: {
    width: 68,
    height: 68,
    resizeMode: 'contain',
  }
});
