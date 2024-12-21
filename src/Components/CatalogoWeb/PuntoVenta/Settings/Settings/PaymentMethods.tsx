/*import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Header } from '../Utilities/Header';

export const PaymentMethods = ({ navigation }: any) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
            <Header navigation={navigation} screenName={"Metodos de pago"} />
                <Text style={styles.headerTitle}>Métodos de pago</Text>
            </View>
            <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Habilitar</Text>
                <Switch
                    trackColor={{ false: '#767577', true: '#6200EE' }}
                    thumbColor={isEnabled ? '#FFFFFF' : '#f4f3f4'}
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
            </View>
            <TouchableOpacity style={[styles.optionItem, !isEnabled && styles.disabled]} disabled={!isEnabled}>
                <Text style={styles.optionText}>Pagos en línea</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionItem, !isEnabled && styles.disabled]} disabled={!isEnabled}>
                <Text style={styles.optionText}>Pagos con tarjeta</Text>
                <Text style={styles.statusText}>Activo</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9', // Color de fondo claro
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF', // Fondo blanco para el encabezado
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0', // Color del borde inferior
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: 'Poppins-Bold', // Fuente personalizada si está disponible
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    toggleLabel: {
        fontSize: 16,
        color: '#333333',
        fontFamily: 'Poppins-SemiBold',
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
    optionText: {
        fontSize: 16,
        color: '#333333',
        fontFamily: 'Poppins-SemiBold',
    },
    statusText: {
        fontSize: 14,
        color: '#6200EE',
        fontFamily: 'Poppins-Regular',
    },
    disabled: {
        opacity: 0.5, // Aplica un efecto visual para indicar que el botón está deshabilitado
    },
});

export default PaymentMethods;
*/