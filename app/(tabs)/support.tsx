import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Enable layout animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  q: string;
  a: string;
}

export default function SupportScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 'Q1',
      q: 'Q1. What is the DDGNS?',
      a: 'DDGNS is a centralized transportation management platform designed to handle drivers, passengers, vehicles, trip operations, financial transactions, and franchise management within a single system.'
    },
    {
      id: 'Q2',
      q: 'Q2. How do I create an account?',
      a: 'Users can register through the web portal or mobile application by providing the required personal information and documents. Certain account types, such as Driver and Franchise Owner, may require administrative approval before activation.'
    },
    {
      id: 'Q3',
      q: 'Q3. How do I access modules?',
      a: 'After logging in, users can access modules based on their assigned role, such as Admin, Franchise Owner, Driver, or Passenger.'
    },
    {
      id: 'Q4',
      q: 'Q4. Is the system secure?',
      a: 'Yes. DDGNS uses SSL/TLS encryption, Role-Based Access Control (RBAC), secure authentication, and session management to protect user accounts and sensitive information.'
    },
    {
      id: 'Q5',
      q: 'Q5. How is maintenance handled?',
      a: 'System maintenance is managed through scheduled updates, performance monitoring, data backups, and technical support provided by the DDGNS administrators.'
    },
    {
      id: 'Q6',
      q: 'Q6. How do I book a trip?',
      a: 'Passengers can book a trip through the mobile application by entering the pickup location, destination, and confirming the booking request.'
    },
    {
      id: 'Q7',
      q: 'Q7. How do I know if my booking is confirmed?',
      a: 'You will receive an in-app notification and SMS confirmation containing the driver\'s details and estimated time of arrival once a driver accepts your request.'
    }
  ];

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAF1FB" />
      
      {/* ── DeviceGNS Logo Card Header ── */}
      <ImageBackground 
        source={require('../../assets/images/BLUE NAV TOP.png')} 
        style={s.logoHeader}
        resizeMode="cover"
      >
        <View style={s.logoCard}>
          <Image 
            source={require('../../assets/images/devicegns-logo.jpg')} 
            style={s.logoImage} 
            resizeMode="contain"
          />
        </View>
      </ImageBackground>

      {/* ── FAQ Sheet Container ── */}
      <View style={s.sheet}>
        <View style={s.sheetTitleRow}>
          <Text style={s.sheetTitle}>Support</Text>
          <Text style={s.sheetSubtitle}>FAQ`s</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {faqs.map(item => {
            return (
              <View key={item.id} style={s.faqCard}>
                <View style={s.faqQuestionRow}>
                  <Text style={s.faqQuestionText}>
                    {item.q}
                  </Text>
                </View>
                <View style={s.faqAnswerContainer}>
                  <Text style={s.faqAnswerText}>{item.a}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF1FB',
  },
  logoHeader: {
    width: '100%',
    paddingTop: 45,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
    height: 60,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#EDF5FD', // Soft blue background color matching Screenshot 1
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    borderBottomWidth: 0,
    marginTop: -18,
  },
  sheetTitleRow: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  sheetSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#163D80',
    marginTop: 8,
    marginBottom: 4,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  faqQuestionRow: {
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  faqQuestionText: {
    fontSize: 16.5,
    fontWeight: 'bold',
    color: '#1A4FA0',
    lineHeight: 22,
  },
  faqAnswerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 4,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  }
});
