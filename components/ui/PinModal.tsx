import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput,
  Animated, Vibration,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../constants/theme';
import { Modal } from './Modal';

interface PinModalProps {
  visible: boolean;
  mode: 'set' | 'verify';
  onSuccess: (pin: string) => void;
  onClose: () => void;
}

export function PinModal({ visible, mode, onSuccess, onClose }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Vibration.vibrate(200);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const reset = useCallback(() => {
    setPin('');
    setConfirmPin('');
    setStep('enter');
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleDigit = useCallback((digit: string) => {
    setError('');
    if (mode === 'verify') {
      const newPin = pin + digit;
      if (newPin.length <= 4) {
        setPin(newPin);
        if (newPin.length === 4) {
          onSuccess(newPin);
          setTimeout(reset, 100);
        }
      }
    } else {
      // Set mode
      if (step === 'enter') {
        const newPin = pin + digit;
        if (newPin.length <= 4) {
          setPin(newPin);
          if (newPin.length === 4) {
            setTimeout(() => setStep('confirm'), 300);
          }
        }
      } else {
        const newConfirm = confirmPin + digit;
        if (newConfirm.length <= 4) {
          setConfirmPin(newConfirm);
          if (newConfirm.length === 4) {
            if (newConfirm === pin) {
              onSuccess(newConfirm);
              setTimeout(reset, 100);
            } else {
              setError('PINs diferentes. Tente novamente.');
              shake();
              setTimeout(() => {
                setConfirmPin('');
                setStep('enter');
                setPin('');
              }, 600);
            }
          }
        }
      }
    }
  }, [pin, confirmPin, step, mode, onSuccess, reset]);

  const handleDelete = useCallback(() => {
    if (step === 'enter' || mode === 'verify') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
    setError('');
  }, [step, mode]);

  const currentPin = mode === 'verify' ? pin : step === 'enter' ? pin : confirmPin;

  const title = mode === 'verify'
    ? 'Digite o PIN'
    : step === 'enter'
    ? 'Criar PIN de 4 dígitos'
    : 'Confirmar PIN';

  const subtitle = mode === 'set' && step === 'enter'
    ? 'Este PIN protegerá suas notas privadas'
    : mode === 'set' && step === 'confirm'
    ? 'Digite novamente para confirmar'
    : 'Notas privadas protegidas';

  const digits = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <Modal visible={visible} title="" onClose={handleClose} hideTitle>
      <View style={styles.container}>
        <View style={styles.lockIcon}>
          <MaterialIcons name="lock" size={32} color={Colors.brandLight} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Dots */}
        <Animated.View style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}>
          {[0,1,2,3].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                i < currentPin.length && styles.dotFilled,
              ]}
            />
          ))}
        </Animated.View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Keypad */}
        <View style={styles.keypad}>
          {digits.map((d, idx) => {
            if (d === '') return <View key={idx} style={styles.keyEmpty} />;
            if (d === 'del') {
              return (
                <Pressable
                  key={idx}
                  style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                  onPress={handleDelete}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="backspace" size={22} color={Colors.textSecondary} />
                </Pressable>
              );
            }
            return (
              <Pressable
                key={idx}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                onPress={() => handleDigit(d)}
              >
                <Text style={styles.keyText}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingBottom: Spacing.lg },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.brandSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.xl, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.xl },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dotFilled: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  error: { fontSize: FontSize.sm, color: Colors.danger, marginBottom: Spacing.md, textAlign: 'center' },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    gap: Spacing.md,
    justifyContent: 'center',
  },
  key: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keyPressed: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  keyEmpty: { width: 68, height: 68 },
  keyText: { fontSize: FontSize.xxl, fontWeight: FontWeight.semibold, color: Colors.text },
});
