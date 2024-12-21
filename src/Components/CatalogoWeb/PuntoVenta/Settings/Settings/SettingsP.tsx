/*import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ChevronBack } from '../../assets/SVG/ChevronBack';
import Tablet from '../../assets/SVG/Tablet';
import Cloud from '../../assets/SVG/Cloud';
import Euro from '../../assets/SVG/Euro';
import Languaje from '../../assets/SVG/Languaje';
import Printer from '../../assets/SVG/Printer';
import Settings from '../../assets/SVG/Settings';
import Stongs from '../../assets/SVG/Stongs';
import Store from '../../assets/SVG/Store';
import Ticket from '../../assets/SVG/Ticket';
import ChevronGo from '../../assets/SVG/ChevronGo';
import Trash from '../../assets/SVG/Trash';
import { ThemeLight } from '../Theme/Theme';
import { Header } from '../Utilities/Header';
import { MoreIcon } from '../../assets/SVG/MoreIcon';
import { AppContext } from '../Context/AppContext';
import People from '../../assets/SVG/People';

export const SettingsP = ({ navigation }: any) => {
  const context = useContext(AppContext);
  const iconColor = context.store?.Color || ThemeLight.btnBackground; // Definir color del icono

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor:
            context.store.Color ? context.store.Color : ThemeLight.btnBackground,
          height: Platform.OS === 'ios' ? 40 : 0,
        }}

      />
      <Header screenName={'Ajustes'} navigation={navigation} />
      <View style={styles.settingsList}>
        {
          /*
        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => navigation.navigate('GeneralSettings')}>
          <View style={styles.iconContainer}>
            <Settings width={30} height={30} fillColor={iconColor} />
            <Text style={styles.settingsText}>General</Text>
          </View>
          <ChevronGo width={30} height={30} />
        </TouchableOpacity>
          */
        /*}


        {context.user.Role === 'ADMINISTRADOR' && (
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate('UpdateStoreInfo')}>
            <View style={styles.iconContainer}>
              <Store width={30} height={30} fillColor={iconColor} />
              <Text style={styles.settingsText}>Información del negocio</Text>
            </View>
            <ChevronGo width={30} height={30} />
          </TouchableOpacity>
        )}
        {
          Platform.OS != 'ios' &&

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate('HardwareSettings')}>
            <View style={styles.iconContainer}>
              <Printer width={30} height={30} fillColor={iconColor} />
              <Text style={styles.settingsText}>Hardware</Text>
            </View>
            <ChevronGo width={30} height={30} />
          </TouchableOpacity>
        }

        {context.user.Role === 'ADMINISTRADOR' && (
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate('SalesTaxSettings')}>
            <View style={styles.iconContainer}>
              <Stongs width={30} height={30} strokeColor={iconColor} />
              <Text style={styles.settingsText}>Impuesto de venta</Text>
            </View>
            <ChevronGo width={30} height={30} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => navigation.navigate('ExportReports')}>
          <View style={styles.iconContainer}>
            <Cloud width={30} height={30} fillColor={iconColor} />
            <Text style={styles.settingsText}>Exportar reportes</Text>
          </View>
          <ChevronGo width={30} height={30} />
        </TouchableOpacity>

        {context.user.Role === 'ADMINISTRADOR' && (
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate('CustomizeApp')}>
            <View style={styles.iconContainer}>
              <MoreIcon width={30} height={30} strokeColor={iconColor} />
              <Text style={styles.settingsText}>Color de App</Text>
            </View>
            <ChevronGo width={30} height={30} />
          </TouchableOpacity>
        )}

        {context.user.Role === 'ADMINISTRADOR' && (
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate('TableOrders')}>
            <View style={styles.iconContainer}>
              <Tablet width={30} height={30} fillColor={iconColor} />
              <Text style={styles.settingsText}>Mesas</Text>
            </View>
            <ChevronGo width={30} height={30} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => navigation.navigate('CloseSession')}>
          <View style={styles.iconContainer}>
            <People width={30} height={30} fillColor={iconColor} />
            <Text style={styles.settingsText}>Cerrar Sesión</Text>
          </View>
          <ChevronGo width={30} height={30} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => navigation.navigate('DeleteAccount')}>
          <View style={styles.iconContainer}>
            <Trash width={30} height={30} fill={iconColor} />
            <Text style={styles.settingsText}>Borrar Cuenta</Text>
          </View>
          <ChevronGo width={30} height={30} />
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Color de fondo suave
  },
  settingsList: {
    marginTop: 10,
    paddingHorizontal: 10, // Espaciado lateral más compacto
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18, // Espacio vertical reducido
    paddingHorizontal: 15, // Espacio más reducido
    backgroundColor: '#FFFFFF', // Fondo blanco para cada item
    borderRadius: 8, // Esquinas suavizadas pero menos redondeadas
    marginVertical: 5, // Menor separación entre elementos
    borderColor: '#E0E0E0', // Línea divisora sutil
    borderWidth: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsText: {
    marginLeft: 15,
    fontSize: 16, // Tamaño adecuado para el texto
    color: ThemeLight.textColor, // Tono morado oscuro
    fontFamily: 'Poppins-SemiBold',
  },
});

*/