import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabHeader } from './home';

interface TransactionItem {
  id: string;
  refNo: string;
  type: 'Trip Earned' | 'Boundary Paid' | 'Wallet Cashout' | 'System Fee';
  date: string;
  time: string;
  amount: number;
  description: string;
}

export default function DriverTransactionsScreen() {
  const transactions: TransactionItem[] = [
    {
      id: '1',
      refNo: 'TXN-9824024',
      type: 'Trip Earned',
      date: '2034-06-22',
      time: '09:30 AM',
      amount: 320.00,
      description: 'Ride fare earned from Marc Francis',
    },
    {
      id: '2',
      refNo: 'TXN-9824011',
      type: 'System Fee',
      date: '2034-06-22',
      time: '09:30 AM',
      amount: -32.00,
      description: '10% Platform commission fee',
    },
    {
      id: '3',
      refNo: 'TXN-9823902',
      type: 'Trip Earned',
      date: '2034-06-22',
      time: '02:15 PM',
      amount: 240.00,
      description: 'Ride fare earned from Mico Marin',
    },
    {
      id: '4',
      refNo: 'TXN-9823899',
      type: 'System Fee',
      date: '2034-06-22',
      time: '02:15 PM',
      amount: -24.00,
      description: '10% Platform commission fee',
    },
    {
      id: '5',
      refNo: 'TXN-9820144',
      type: 'Boundary Paid',
      date: '2034-06-21',
      time: '08:00 PM',
      amount: -500.00,
      description: 'Daily vehicle operator boundary payment',
    },
    {
      id: '6',
      refNo: 'TXN-9818820',
      type: 'Wallet Cashout',
      date: '2034-06-20',
      time: '05:30 PM',
      amount: -1200.00,
      description: 'GCash Wallet Cashout withdrawal',
    }
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A4FA0" />
      <TabHeader title="Transactions" />

      <View style={s.sheet}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Summary Banner */}
          <View style={s.summaryBanner}>
            <View>
              <Text style={s.summaryLabel}>Driver Net Wallet Balance</Text>
              <Text style={s.summaryBalance}>₱ 4,520.00</Text>
            </View>
            <View style={s.walletIconContainer}>
              <MaterialCommunityIcons name="wallet" size={32} color="#FFF" />
            </View>
          </View>

          {/* List of Transactions */}
          <Text style={s.listTitle}>Transaction History</Text>
          
          {transactions.map((txn) => {
            const isPositive = txn.amount > 0;
            
            // Icon helper
            let iconComponent;
            if (txn.type === 'Trip Earned') {
              iconComponent = <Ionicons name="trending-up" size={20} color="#2E7D32" />;
            } else if (txn.type === 'System Fee') {
              iconComponent = <Ionicons name="receipt-outline" size={20} color="#C62828" />;
            } else if (txn.type === 'Boundary Paid') {
              iconComponent = <FontAwesome name="car" size={18} color="#C62828" />;
            } else {
              iconComponent = <MaterialCommunityIcons name="bank-transfer-out" size={22} color="#C62828" />;
            }

            return (
              <View key={txn.id} style={s.txnCard}>
                <View style={s.cardLeft}>
                  <View style={[s.iconBox, { backgroundColor: isPositive ? '#E8F5E9' : '#FFEBEE' }]}>
                    {iconComponent}
                  </View>
                  <View style={s.details}>
                    <Text style={s.txnType}>{txn.type}</Text>
                    <Text style={s.refText}>{txn.refNo}</Text>
                    <Text style={s.descText}>{txn.description}</Text>
                    <Text style={s.timeText}>{txn.date} • {txn.time}</Text>
                  </View>
                </View>
                
                <Text style={[s.amountText, { color: isPositive ? '#2E7D32' : '#C62828' }]}>
                  {isPositive ? '+' : ''}₱ {Math.abs(txn.amount).toFixed(2)}
                </Text>
              </View>
            );
          })}

        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF1FB',
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
  summaryBanner: {
    backgroundColor: '#1A4FA0',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
        boxShadow: '0px 4px 8px rgba(26, 79, 160, 0.2)',
      }
    })
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryBalance: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
  },
  walletIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A4FA0',
    marginBottom: 16,
  },
  txnCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EAF1FB',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.04)',
      }
    })
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  txnType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A4FA0',
    marginBottom: 2,
  },
  refText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  descText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
