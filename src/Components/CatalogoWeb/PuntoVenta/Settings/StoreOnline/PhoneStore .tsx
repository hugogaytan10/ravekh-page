import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { ThemeLight } from '../../Theme/Theme';
import { AppContext } from '../../Context/AppContext';
import { ChevronBack } from '../../../assets/SVG/ChevronBack';

export const PhoneStore = ({ navigation }: any) => {
  const context = useContext(AppContext);
  const [phoneNumber, setPhoneNumber] = useState(context.store.PhoneNumber || '');
  const [phoneFocus, setPhoneFocus] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isValidPhoneNumber = (phone: string) => phone.length >= 10;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronBack strokeColor="#000" />
        </Pressable>
        <Text style={styles.headerText}>Número de teléfono</Text>
      </View>

      {/* Progreso */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Ingresa tu número 2/4</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressStepInactive} />
          <View style={styles.progressStepActive} />
          <View style={styles.progressStepInactive} />
          <View style={styles.progressStepInactive} />
        </View>
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={[
            styles.input,
          ]}
          placeholder="Ingresa el número"
          placeholderTextColor="#aaa"
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={setPhoneNumber}
          onFocus={() => setPhoneFocus(true)}
          onBlur={() => setPhoneFocus(false)}
        />
      </View>

      {/* Botón Continuar */}
      <Pressable
        style={[
          styles.btnContinue,
          isValidPhoneNumber(phoneNumber) ? styles.btnActive : styles.btnDisabled,
        ]}
        onPress={() => {
          if (isValidPhoneNumber(phoneNumber)) {
            context.setStore({ ...context.store, PhoneNumber: phoneNumber });
            navigation.navigate('AddressStore');
          }
        }}
      >
        <Text
          style={[
            styles.btnText,
            isValidPhoneNumber(phoneNumber) ? { color: '#fff' } : { color: '#aaa' },
          ]}
        >
          Continuar
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'ios' ? 60 : 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    width: 40,
    height: 4,
    backgroundColor: ThemeLight.secondaryColor,
    marginHorizontal: 5,
    borderRadius: 2,
  },
  progressStepInactive: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
    borderRadius: 2,
  },
  inputContainer: {
    marginBottom: 30,
    width: '90%',
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    height: 50,
    borderWidth: 0.7,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
    borderColor: ThemeLight.borderColor,
  },
  btnContinue: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    marginTop: 20,
    alignSelf: 'center',
    height: 67,
  },
  btnActive: {
    backgroundColor: ThemeLight.secondaryColor,
  },
  btnDisabled: {
    backgroundColor: '#eee',
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
