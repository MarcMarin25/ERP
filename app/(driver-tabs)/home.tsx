import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform, Pressable } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import MapBackground from '../../components/MapBackground';

// Reusable Grid Header Component
export function TabHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={headerStyles.headerContainer}>
      {/* Grid Lines */}
      <View style={StyleSheet.absoluteFill}>
        {/* Horizontal Lines */}
        <View style={[headerStyles.gridLineH, { top: '20%' }]} />
        <View style={[headerStyles.gridLineH, { top: '40%' }]} />
        <View style={[headerStyles.gridLineH, { top: '60%' }]} />
        <View style={[headerStyles.gridLineH, { top: '80%' }]} />
        
        {/* Vertical Lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[headerStyles.gridLineV, { left: `${(i + 1) * 8.3}%` }]} />
        ))}
      </View>

      <View style={headerStyles.content}>
        {onBack && (
          <Pressable
            style={({ pressed }) => [headerStyles.backBtn, Platform.OS === 'ios' && pressed && { opacity: 0.7 }]}
            onPress={onBack}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: true, radius: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </Pressable>
        )}
        <Text style={headerStyles.titleText}>{title}</Text>
      </View>
    </View>
  );
}

export default function DriverHomeScreen() {
  // Mode can be 'map' or 'dashboard'
  const [mode, setMode] = useState<'map' | 'dashboard'>('map');

  if (mode === 'map') {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        {/* Full-screen Background Map */}
        <View style={s.mapContainer}>
          <MapBackground />
          
          {/* Custom sharp blue arrow location marker */}
          <View style={s.arrowMarkerContainer}>
            <View style={s.arrowShadow} />
            <View style={s.arrowMarker} />
          </View>
        </View>

        {/* Start button overlaying lower portion of map */}
        <View style={s.overlayContainer}>
          <Pressable 
            style={({ pressed }) => [
              s.startButton, 
              Platform.OS === 'ios' && pressed && { opacity: 0.85 }
            ]} 
            onPress={() => setMode('dashboard')}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.25)', borderless: false }}
          >
            <Text style={s.startButtonText}>Start</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Dashboard / Operator Financials
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A4FA0" />
      <TabHeader title="Dashboard" onBack={() => setMode('map')} />
      
      <View style={s.sheet}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Boundary Due Date Informational Container */}
          <View style={s.boundaryContainer}>
            <View style={s.boundaryHeader}>
              <View style={s.boundaryIcons}>
                <View style={s.goldCoinsGraphic}>
                  <View style={[s.miniCoin, { backgroundColor: '#FAD02C' }]} />
                  <View style={[s.miniCoin, { backgroundColor: '#F5B041', marginTop: -3 }]} />
                </View>
                <FontAwesome name="car" size={18} color="#1A4FA0" style={s.boundaryCarIcon} />
              </View>
              <Text style={s.boundaryTitle}>Boundary Due Date</Text>
            </View>

            <View style={s.boundaryRow}>
              <Text style={s.boundaryLabel}>Date : </Text>
              <Text style={s.boundaryValue}>2034-06-22</Text>
            </View>

            <View style={s.boundaryRow}>
              <Text style={s.boundaryLabel}>Pay : </Text>
              <Text style={s.boundaryValue}>₱ 25000.00</Text>
            </View>
          </View>

          {/* Side-by-Side Cards Layout */}
          <View style={s.cardsRow}>
            {/* Left Card: Today's Earnings */}
            <View style={s.earningsCard}>
              <Text style={s.earningsAmount}>₱ 0</Text>
              
              {/* Stack of Coins Graphic */}
              <View style={s.coinStackContainer}>
                <View style={[s.coinDisc, { backgroundColor: '#FAD02C', borderColor: '#F39C12', zIndex: 4 }]} />
                <View style={[s.coinDisc, { backgroundColor: '#F4D03F', borderColor: '#F39C12', zIndex: 3, marginTop: -6 }]} />
                <View style={[s.coinDisc, { backgroundColor: '#F5B041', borderColor: '#D35400', zIndex: 2, marginTop: -6 }]} />
                <View style={[s.coinDisc, { backgroundColor: '#F5B041', borderColor: '#D35400', zIndex: 1, marginTop: -6 }]} />
              </View>

              <Text style={s.earningsLabel}>{"Today's Earnings :"}</Text>
            </View>

            {/* Right Card: Today's Trip Total */}
            <View style={s.tripsCard}>
              <Text style={s.tripsAmount}>0</Text>
              
              {/* Driver Graphic */}
              <View style={s.driverGraphicContainer}>
                <View style={s.carGraphic}>
                  <View style={s.windshield} />
                  <View style={s.driverHead}>
                    <View style={s.hair} />
                    <View style={s.face} />
                  </View>
                  <View style={s.steeringWheel} />
                </View>
              </View>

              <Text style={s.tripsLabel}>{"Today's Trip Total :"}</Text>
            </View>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  headerContainer: {
    height: 95,
    backgroundColor: '#1A4FA0',
    position: 'relative',
    justifyContent: 'center',
    paddingTop: 30,
    overflow: 'hidden',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF1FB',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  arrowMarkerContainer: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    marginLeft: -15,
    marginTop: -15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowShadow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.15)',
    transform: [{ rotate: '45deg' }, { translateX: 2 }, { translateY: 2 }],
  },
  arrowMarker: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1A4FA0',
    transform: [{ rotate: '0deg' }],
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#1A4FA0',
    width: '95%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
      }
    })
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#EAF1FB',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    overflow: 'hidden',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 110,
  },
  boundaryContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
      }
    })
  },
  boundaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  boundaryIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  goldCoinsGraphic: {
    marginRight: 4,
  },
  miniCoin: {
    width: 14,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F39C12',
  },
  boundaryCarIcon: {
    marginTop: 2,
  },
  boundaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  boundaryRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F6FE',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  boundaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A4FA0',
  },
  boundaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A4FA0',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: '#FDF2F4',
    borderWidth: 1.5,
    borderColor: '#F1948A',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 10,
  },
  coinStackContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  coinDisc: {
    width: 48,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  earningsLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E74C3C',
    textAlign: 'center',
  },
  tripsCard: {
    flex: 1,
    backgroundColor: '#EAF2F8',
    borderWidth: 1.5,
    borderColor: '#85C1E9',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tripsAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A4FA0',
    marginBottom: 10,
  },
  driverGraphicContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  carGraphic: {
    width: 60,
    height: 48,
    backgroundColor: '#1A4FA0',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFF',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  windshield: {
    width: 46,
    height: 18,
    backgroundColor: '#85C1E9',
    borderRadius: 4,
    position: 'absolute',
    top: 4,
  },
  driverHead: {
    width: 14,
    height: 14,
    position: 'absolute',
    bottom: 8,
    alignItems: 'center',
  },
  hair: {
    width: 14,
    height: 6,
    backgroundColor: '#2C3E50',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  face: {
    width: 12,
    height: 8,
    backgroundColor: '#F5B041',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  steeringWheel: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
    position: 'absolute',
    bottom: 2,
    right: 8,
  },
  tripsLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1A4FA0',
    textAlign: 'center',
  },
});
