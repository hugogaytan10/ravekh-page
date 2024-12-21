/*import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
// Import SVG icons
import ChevronGo from '../../assets/SVG/ChevronGo';
import { Header } from '../Utilities/Header';
import { ThemeLight } from '../Theme/Theme'; // Assuming you have a theme file
import Check from '../../assets/SVG/Check'; // Import the Check SVG
import { AppContext } from '../Context/AppContext'; // Assuming you have a context for the app

export const GeneralSettings = ({ navigation }: any) => {
  const context = useContext(AppContext); // Obtener el contexto de la aplicación
  const [isStockEnabled, setIsStockEnabled] = useState(true);
  const [isShiftEnabled, setIsShiftEnabled] = useState(false);
  const [productOrder, setProductOrder] = useState('Fecha de creacion'); // Estado para la opción seleccionada

  // Obtener el color del contexto o usar el color por defecto
  const appColor = context.store?.Color || ThemeLight.btnBackground;

  return (
    <View style={styles.container}>
      <Header screenName={'General'} navigation={navigation} />
      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => navigation.navigate('SelectMoney')}>
        <View style={styles.optionLeft}>
          <Text style={styles.optionLabel}>Moneda</Text>
          <Text style={styles.optionValue}>MXN-$</Text>
        </View>
        <View style={styles.optionRight}>
          <ChevronGo width={24} height={24} />
        </View>
      </TouchableOpacity>

      <View style={styles.toggleItem}>
        <Text style={styles.optionLabel}>Permitir vender sin stock</Text>
        <Switch
          value={isStockEnabled}
          onValueChange={setIsStockEnabled}
          trackColor={{ false: '#767577', true: appColor }} // Usar color personalizado
          thumbColor={isStockEnabled ? '#FFFFFF' : '#f4f3f4'} // Color del thumb (botón)
        />
      </View>
      <View style={styles.toggleItem}>
        <Text style={styles.optionLabel}>Turnos de caja</Text>
        <Switch
          value={isShiftEnabled}
          onValueChange={setIsShiftEnabled}
          trackColor={{ false: '#767577', true: appColor }} // Usar color personalizado
          thumbColor={isShiftEnabled ? '#FFFFFF' : '#f4f3f4'} // Color del thumb (botón)
        />
      </View>

      <View style={styles.checkItem}>
        <Text style={styles.optionLabel}>Orden de productos</Text>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setProductOrder('Fecha de creacion')}>
          <Text style={styles.checkboxLabel}>Fecha de creación</Text>
          <View style={[styles.checkbox, { borderColor: appColor }]}>
            {productOrder === 'Fecha de creacion' && (
              <View style={{ backgroundColor: appColor }}>
                <Check width={16} height={16} />
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setProductOrder('A-Z')}>
          <Text style={styles.checkboxLabel}>A-Z</Text>
          <View style={[styles.checkbox, { borderColor: appColor }]}>
            {productOrder === 'A-Z' && (
              <View style={{ backgroundColor: appColor }}>
                <Check width={16} height={16} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.deleteAccountItem}
        onPress={() => navigation.navigate('DeleteAccount')}>
        <Text style={styles.deleteAccountText}>Eliminar cuenta</Text>
        <ChevronGo width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeLight.backgrounColor,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionLabel: {
    fontSize: 16,
    color: '#333333',
    fontFamily: 'Poppins-SemiBold',
  },
  optionLeft: {
    flexDirection: 'column',
    maxWidth: '80%',
  },
  optionValue: {
    fontSize: 24,
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  optionRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  checkItem: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
    fontFamily: 'Poppins-Regular',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 20,
  },
  deleteAccountText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Poppins-SemiBold',
  },
});
*/