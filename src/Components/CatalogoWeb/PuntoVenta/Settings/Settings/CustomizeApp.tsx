/*import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Platform } from 'react-native';
import { ThemeLight } from '../Theme/Theme';
import { PickerColor } from '../CustomizeApp/PickerColor';
import { ImageIcon } from '../../assets/SVG/Image';
import { PickerPhoto } from '../CustomizeApp/PickerPhoto';
import { AppContext } from '../Context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadImage } from '../Cloudinary/Cloudinary';
import { updateBusiness } from './Petitions';
import { Store } from '../Model/Store';

export const CustomizeApp = ({navigation}: any) => {
  const context = useContext(AppContext);
  const [color, setColor] = useState('#6D01D1');
  const [isVisible, setIsVisible] = useState(false);
  const [urlPhoto, setUrlPhoto] = useState(context.store.Logo);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBig, setIsLoadingBig] = useState(false);

  const ommited = useCallback(async () => {
    try {
      setIsLoadingBig(true);
      let business = { Color: color, Logo: urlPhoto };
      if (urlPhoto && urlPhoto !== 'error') {
        const uriPhoto = await uploadImage(urlPhoto);
        business = { ...business, Logo: uriPhoto };
        const data = await updateBusiness(context.user.Token, context.user.Business_Id+"", business);
        if (data) {
          context.setStore({...context.store, Logo: uriPhoto, Color: color});
          navigation.goBack();
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingBig(false);
    }
  }, [color, urlPhoto, context, navigation]);

  const handleImagePick = useCallback(async () => {
    setIsLoading(true);
    let url = await PickerPhoto();
    setUrlPhoto(url);
    setIsLoading(false);
  }, []);

  return (
    <View style={styles.container}>
       <View
        style={{
          backgroundColor:
            context.store.Color ? context.store.Color : ThemeLight.btnBackground,
          height: Platform.OS === 'ios' ? 50 : 0,
        }}

      />
      <View style={styles.containerHeader}>
        <Text style={styles.title}>Indica tu estilo</Text>
        <Text style={styles.subTitle}>
          Para un ticket y catálogo profesional
        </Text>
      </View>

      <Pressable
        style={styles.btnAddLogo}
        onPress={handleImagePick}>
        <ImageIcon />
        <Text style={[styles.textColor, { color: ThemeLight.btnBackground }]}>
          {urlPhoto && urlPhoto !== 'error' ? 'Cambiar logo' : 'Agrega tu logo'}
        </Text>
      </Pressable>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginTop: 40,
          height: 350,
          width: '90%',
          borderRadius: 8,
        }}>
        <View style={styles.cardContainer}>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 15,
            }}>
            {isLoading ? (
              <ActivityIndicator size="large" color={ThemeLight.secondaryColor} />
            ) : urlPhoto && urlPhoto !== 'error' ? (
              <Image
                source={{ uri: urlPhoto }}
                style={styles.squarePhoto}
              />
            ) : (
              <View style={styles.square} />
            )}
            <View style={styles.textSkeleton} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}>
            <View>
              <View style={styles.textSkeleton} />
              <View style={styles.textSkeleton} />
            </View>
            <View>
              <View style={styles.square} />
              <View
                style={[
                  styles.textSkeleton,
                  { width: 30, backgroundColor: color },
                ]}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginTop: 15,
            }}>
            <View>
              <View style={styles.textSkeleton} />
              <View style={styles.textSkeleton} />
            </View>
            <View>
              <View style={styles.square} />
              <View
                style={[
                  styles.textSkeleton,
                  { width: 30, backgroundColor: color },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={[styles.cardContainer, { alignItems: 'center' }]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 15,
              width: '100%',
            }}>
            <View style={styles.textSkeleton} />
            <View style={styles.textSkeleton} />
          </View>
          <View style={styles.rectangle} />
          <View style={styles.rectangle} />
          <View
            style={[
              styles.textSkeleton,
              { height: 20, width: '40%', marginTop: 15 },
            ]}
          />
          <View
            style={[
              styles.textSkeleton,
              { height: 20, width: '90%', marginTop: 15, backgroundColor: color },
            ]}
          />
        </View>
      </View>
      <Pressable
        onPress={() => {
          setIsVisible(!isVisible);
        }}
        style={styles.btnOpenPickerColor}>
        <Text style={styles.textColor}>Color: </Text>
        <View style={[styles.square, { width: 30, backgroundColor: color }]} />
      </Pressable>
      <PickerColor
        colorSelected={color}
        setColorSelected={setColor}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
      />
      <View style={styles.backgroundColorFooter}>

        <Pressable
          style={[styles.btnChooseImage, { backgroundColor: color }]}
          onPress={urlPhoto === 'error' || urlPhoto === '' ? handleImagePick : ommited}>
          <Text
            style={{
              color: '#fff',
              fontSize: 20,
              fontFamily: 'Poppins-SemiBold',
              textAlign: 'center',
            }}>
            {urlPhoto === 'error' || urlPhoto === ''
              ? 'Elegir Imagen'
              : 'Guardar'}
          </Text>
        </Pressable>
       
      </View>
      {isLoadingBig && (
        <View style={styles.loadingOverlayFullScreen}>
          <ActivityIndicator size="large" color={ThemeLight.secondaryColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: ThemeLight.backgrounColor,
  },
  containerHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 115,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ThemeLight.secondaryColor,
  },
  subTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: ThemeLight.textColor,
  },
  btnAddLogo: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#fff',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 8,
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cardContainer: {
    backgroundColor: '#fff',
    height: 290,
    width: '39%',
    borderRadius: 20,
    borderWidth: 0.7,
    borderColor: ThemeLight.borderColor,
  },
  square: {
    backgroundColor: ThemeLight.boxShadow,
    height: 30,
    width: 30,
    borderRadius: 4,
  },
  squarePhoto: {
    height: 30,
    width: 30,
    borderRadius: 4,
  },
  textSkeleton: {
    backgroundColor: ThemeLight.boxShadow,
    height: 9,
    width: 48,
    borderRadius: 10,
    marginTop: 2,
  },
  rectangle: {
    backgroundColor: ThemeLight.boxShadow,
    height: 30,
    width: '80%',
    borderRadius: 4,
    marginTop: 15,
  },
  btnOpenPickerColor: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 40,
    width: '40%',
    borderRadius: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  textColor: {
    color: ThemeLight.textColor,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  backgroundColorFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  btnChooseImage: {
    backgroundColor: ThemeLight.btnBackground,
    borderRadius: 10,
    width: '80%',
    height: 34,
  },
  btnSkip: {},
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
*/