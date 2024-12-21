import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
} from 'react-native';
import {ThemeLight} from '../../Theme/Theme';
import {AppContext} from '../../Context/AppContext';
import {getBusinessInformation} from './Petitions';
import Store from '../../../assets/SVG/Store';
import { ChevronBack } from '../../../assets/SVG/ChevronBack';

export const StartedStore = ({navigation}: any) => {
  const colorScheme = useColorScheme();
  const context = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [storeExists, setStoreExists] = useState(false);

  useEffect(() => {
    getBusinessInformation(context.user.Business_Id + "", context.user.Token).then((data) => {
      if (data) {
        setStoreExists(true);
          navigation.navigate('MainStoreOnline');
        // Puedes guardar la información de la tienda en el contexto si es necesario
        context.setStore(data);
      }else{
        setStoreExists(false);
        navigation.navigate('NameStore');
      }
    });
  }, []);

  const handleAction = () => {
    
    if (storeExists) {
      navigation.navigate('MainStoreOnline');
    } else {
      navigation.navigate('NameStore');
    }
      
  };

  return (
    <View
      style={
        colorScheme === 'dark' ? styles.containerDark : styles.containerLight
      }>
        <StatusBar barStyle={'light-content'} backgroundColor={context.store.Color}/>
        <View style={[styles.headerContainer, {backgroundColor: context.store.Color}]}>
        <Pressable style={[styles.backButton, {backgroundColor: context.store.Color}]} onPress={() => navigation.goBack()}>
          <ChevronBack strokeColor={'#fff'} />
        </Pressable>
        <Text style={styles.header}>Tienda</Text>
      </View>
      <View style={styles.logoContainer}>
       <Store width={150} height={150} fillColor={ThemeLight.secondaryColor}/>
      </View>
      <View style={styles.containerInfo}>
        {isLoading ? (
          <ActivityIndicator size="large" color={ThemeLight.primaryColor} />
        ) : (
          <>
            <Text
              style={[
                styles.title,
                colorScheme === 'dark' ? {color: '#e8e8e8'} : null,
              ]}>
              {storeExists ? 'Tienda encontrada' : 'Configura tu tienda'}
            </Text>
            <Text
              style={[
                styles.subTitle,
                colorScheme === 'dark' ? {color: '#e8e8e8'} : null,
              ]}>
              {storeExists
                ? 'Puedes modificar los datos de tu tienda.'
                : 'No tienes una tienda configurada, comienza ahora.'}
            </Text>
            <Pressable
              style={[
                styles.btnStart,
                colorScheme === 'dark' ? {backgroundColor: '#BD3088'} : null,
              ]}
              onPress={handleAction}>
              <Text
                style={[
                  styles.buttonText,
                  colorScheme === 'dark' ? {color: '#e8e8e8'} : null,
                ]}>
                {storeExists ? 'Modificar tienda' : 'Configurar tienda'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerLight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  containerDark: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    zIndex: 10, // Para asegurarse de que el header esté encima del contenido
  },
  backButton: {
    backgroundColor: ThemeLight.secondaryColor,
    borderRadius: 50,
    padding: 2,
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  containerInfo: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: ThemeLight.primaryColor,
  },
  subTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    color: ThemeLight.textColor,
    marginVertical: 10,
  },
  btnStart: {
    backgroundColor: ThemeLight.secondaryColor,
    borderRadius: 25,
    width: '80%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
});