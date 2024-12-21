import React, {useState, useContext, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  Image,
  Platform,
} from 'react-native';
import {ThemeLight} from '../../Theme/Theme';
import {AppContext} from '../../Context/AppContext';
import {ChevronBack} from '../../../assets/SVG/ChevronBack';

export const ReferenceStore = ({navigation}: any) => {
  const context = useContext(AppContext);
  const [reference, setReference] = useState(context.store.References || '');
  const [referenceFocus, setReferenceFocus] = useState(false);
  
  // Referencia al TextInput
  const referenceInputRef = useRef<TextInput>(null);
  
  // Referencias de animación
  const containerAnim = useRef(new Animated.Value(0)).current; // Opacidad inicial
  const logoAnim = useRef(new Animated.Value(50)).current; // Posición Y inicial
  const inputAnim = useRef(new Animated.Value(50)).current; // Posición Y inicial
  const buttonAnim = useRef(new Animated.Value(50)).current; // Posición Y inicial

  useEffect(() => {
    // Secuencia de animación: fade-in y slide-up
    Animated.parallel([
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(inputAnim, {
        toValue: 0,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 800,
        delay: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, [containerAnim, logoAnim, inputAnim, buttonAnim]);

  // Validación simple para una referencia
  const isValidReference = (ref: string) => {
    return ref.length > 10; // Mínimo 10 caracteres para que sea una referencia útil
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerAnim,
        },
      ]}>
         <View
        style={{
          backgroundColor:
            context.store.Color ? context.store.Color : ThemeLight.btnBackground,
          height: Platform.OS === 'ios' ? 40 : 0,
        }}/>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronBack strokeColor="#fff" />
        </Pressable>
        <Text style={styles.header}>Referencias del negocio</Text>
      </View>

      {/* Logo Animado */}
      <Animated.View
        style={[{
          transform: [{ translateY: logoAnim }],
          opacity: containerAnim,
          marginTop: 100,
          marginBottom: 30,
        }, styles.logoContainer]}>
        <Image source={require('../../../assets/Img/addressStore.webp')} resizeMode='contain' style={styles.logo} />
      </Animated.View>

      {/* Input de referencias animado */}
      <Animated.View
        style={{
          transform: [{ translateY: inputAnim }],
          opacity: containerAnim,
        }}>
        <Pressable
          onPress={() => {
            // Al presionar cualquier parte del contenedor, enfocar el TextInput
            referenceInputRef.current?.focus();
          }}
          style={
            referenceFocus ? styles.inputContainer : styles.inputContainerNotFocus
          }>
          <TextInput
            ref={referenceInputRef} // Asignar la referencia al TextInput
            style={styles.input}
            placeholder="Ej: Cerca de la estación del metro"
            placeholderTextColor={ThemeLight.borderColor}
            value={reference}
            keyboardType="default"
            onChangeText={(value: string) => {
              setReference(value);
            }}
            onFocus={() => {
              setReferenceFocus(true);
            }}
            onBlur={() => {
              setReferenceFocus(false);
            }}
            multiline={true} // Permitir múltiples líneas
            numberOfLines={4} // Número de líneas visibles
            textAlignVertical="top" // Alinea el texto al principio del campo
          />
          <View style={styles.labelContainer}>
            <Text style={referenceFocus ? styles.label : styles.labelNotFocus}>
              Referencias del negocio
            </Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Botón Siguiente Animado */}
      <Animated.View
        style={{
          transform: [{ translateY: buttonAnim }],
          opacity: containerAnim,
          width: '75%',
          alignSelf: 'center',
          marginTop: 25,
        }}>
        <Pressable
          style={
            isValidReference(reference) ? styles.btnNextAvailable : styles.btnNextUnavailable
          }
          onPress={() => {
            if (isValidReference(reference)) {
              context.setStore({ ...context.store, References: reference });
              navigation.navigate('MainStoreOnline'); // Cambia 'MainStoreOnline' a la pantalla siguiente
            }
          }}>
          <Text
            style={
              isValidReference(reference) ? styles.textNext : styles.textNextUnavailable
            }>
            Siguiente
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 60, // Espacio para el header
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: ThemeLight.secondaryColor,
    borderRadius: 50,
    padding: 8,
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ThemeLight.textColor,
  },
  logoContainer: {
    marginTop: 100, // Ajustamos el margen superior para que esté debajo del header
    marginBottom: 30,
    height: 200,
    width: '100%',
  },
  logo: {
    height: '100%',
    width: '100%',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: ThemeLight.secondaryColor,
    paddingTop: 8,
    paddingHorizontal: 16,
    width: '80%',
    borderRadius: 4,
    marginTop: 10,
    minHeight: 150,
  },
  inputContainerNotFocus: {
    borderWidth: 1,
    borderColor: ThemeLight.borderColor,
    paddingTop: 8,
    paddingHorizontal: 16,
    width: '80%',
    borderRadius: 4,
    marginTop: 10,
    minHeight: 150,
  },
  input: {
    fontSize: 16,
    color: ThemeLight.secondaryColor,
    fontFamily: 'Poppins-SemiBold',
    minHeight: 44,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  labelContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    top: -14,
    left: 22,
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: ThemeLight.secondaryColor,
  },
  labelNotFocus: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: ThemeLight.borderColor,
  },
  btnNextAvailable: {
    backgroundColor: ThemeLight.secondaryColor,
    borderRadius: 25,
    width: '100%',
    alignSelf: 'center',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnNextUnavailable: {
    backgroundColor: ThemeLight.boxShadow,
    borderRadius: 25,
    width: '100%',
    alignSelf: 'center',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textNext: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  textNextUnavailable: {
    color: ThemeLight.borderColor,
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
  },
});
