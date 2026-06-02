import React from 'react';
import { Pressable, StyleSheet, Text, Platform, ViewStyle, TextStyle } from 'react-native';

interface RippleButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  rippleColor?: string;
}

export default function RippleButton({
  onPress,
  title,
  style,
  textStyle,
  disabled = false,
  rippleColor = 'rgba(255, 255, 255, 0.25)',
}: RippleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{
        color: rippleColor,
        borderless: false,
      }}
      style={({ pressed }) => [
        s.button,
        style,
        Platform.OS === 'ios' && pressed && s.pressed,
        disabled && s.disabled,
      ]}
    >
      <Text style={[s.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    backgroundColor: '#163D80',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Crucial to prevent Android ripple from expanding past rounded borders
  },
  text: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.5,
  },
});
