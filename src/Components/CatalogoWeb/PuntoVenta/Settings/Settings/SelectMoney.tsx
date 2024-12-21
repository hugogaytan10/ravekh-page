/*import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Header } from '../Utilities/Header';
import { ThemeLight } from '../Theme/Theme'; // Asumiendo que tienes un archivo de tema

export type Moneda = {
  Id: number;
  Image: string;
  Name: string;
  Symbol: string;
};

const monedas = [
  {
    Id: 1,
    Image: require('../../assets/Img/Mx.jpg'),
    Name: 'Peso Mexicano',
    Symbol: 'MX',
  },
  {
    Id: 2,
    Image: require('../../assets/Img/Arg.jpg'),
    Name: 'Peso Argentino',
    Symbol: 'ARG',
  },
  {
    Id: 3,
    Image: require('../../assets/Img/Br.jpg'),
    Name: 'Real de Brasil',
    Symbol: 'BR',
  },
  {
    Id: 4,
    Image: require('../../assets/Img/Alemani.webp'),
    Name: 'Dólar Estadounidense',
    Symbol: 'USD',
  },
  // Añade más monedas aquí
];

export const SelectMoney = ({ navigation }: any) => {
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(null); // Estado para la moneda seleccionada

  return (
    <View style={styles.container}>
      <Header navigation={navigation} screenName={'Selecciona tu Moneda'} />

      {/* 
            <View style={styles.searchBar}>
                <Search width={20} height={20} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por país o moneda."
                    placeholderTextColor="#999999"
                />
            </View>
            *//*}
      <ScrollView style={styles.currencyList}>
        {monedas.map(moneda => (
          <TouchableOpacity
            key={moneda.Id}
            style={[
              styles.currencyItem,
              selectedCurrencyId === moneda.Id && styles.selectedCurrencyItem, // Aplicar estilo si está seleccionada
            ]}
            onPress={() => setSelectedCurrencyId(moneda.Id)} // Actualizar estado al presionar
          >
            <Image source={moneda.Image} style={{ width: 40, height: 40 }} />
            <View style={styles.currencyTextContainer}>
              <Text style={styles.currencyText}>{moneda.Name}</Text>
              <Text style={styles.currencyCode}>{moneda.Symbol}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.footerButton}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Color de fondo claro
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  currencyList: {
    padding: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  selectedCurrencyItem: {
    backgroundColor: ThemeLight.backgroundIcon, // Color de fondo claro cuando está seleccionada
    borderRadius: 8, // Borde redondeado para la moneda seleccionada
  },
  currencyTextContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  currencyText: {
    fontSize: 16,
    color: '#333333',
    fontFamily: 'Poppins-SemiBold',
  },
  currencyCode: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'Poppins-Regular',
  },
  footerButton: {
    backgroundColor: ThemeLight.backgroundIcon,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    height: 104,
    width: '100%',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    width: '90%',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default SelectMoney;
*/