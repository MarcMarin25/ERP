import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SwalOptions {
  title?: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info';
  confirmButtonText?: string;
  showCancelButton?: boolean;
  cancelButtonText?: string;
}

type SwalResolve = (value: boolean) => void;

let swalTrigger: ((options: SwalOptions, resolve: SwalResolve) => void) | null = null;

export const Swal = {
  fire: (options: string | SwalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const opts = typeof options === 'string' ? { title: options } : options;
      if (swalTrigger) {
        swalTrigger(opts, resolve);
      } else {
        // Fallback if component is not yet mounted/registered
        alert(opts.title || opts.text || '');
        resolve(true);
      }
    });
  }
};

export function SwalContainer() {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<SwalOptions>({});
  const [resolver, setResolver] = useState<SwalResolve | null>(null);
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    swalTrigger = (opts, resolve) => {
      setOptions(opts);
      setResolver(() => resolve);
      setVisible(true);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    };

    return () => {
      swalTrigger = null;
    };
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver(true);
    close();
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    close();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      setVisible(false);
      setResolver(null);
    });
  };

  if (!visible) return null;

  // Icon mapping
  let iconName: any = 'information-circle';
  let iconColor = '#1A4FA0'; // Primary theme blue
  if (options.icon === 'success') {
    iconName = 'checkmark-circle';
    iconColor = '#22B04B'; // Theme green
  } else if (options.icon === 'error') {
    iconName = 'close-circle';
    iconColor = '#D02A30'; // Theme red
  } else if (options.icon === 'warning') {
    iconName = 'warning';
    iconColor = '#FFA000'; // Amber/warning yellow
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleCancel}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          {options.icon && (
            <View style={styles.iconWrapper}>
              <Ionicons name={iconName} size={64} color={iconColor} />
            </View>
          )}
          {options.title && <Text style={styles.title}>{options.title}</Text>}
          {options.text && <Text style={styles.text}>{options.text}</Text>}
          <View style={styles.buttonContainer}>
            {options.showCancelButton && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{options.cancelButtonText || 'Cancel'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: iconColor }]} 
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>{options.confirmButtonText || 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        zIndex: 99999,
      }
    })
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '85%',
    maxWidth: 360,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      }
    })
  },
  iconWrapper: {
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 14.5,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      }
    })
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
