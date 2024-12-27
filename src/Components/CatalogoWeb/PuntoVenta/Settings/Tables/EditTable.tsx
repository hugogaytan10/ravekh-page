import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Header } from '../Utilities/Header';

 export const EditTable = ({ navigation }) => {
    const [tableName, setTableName] = useState('');

    const handleSave = () => {
        // Implementa la lógica de guardado aquí
        console.log('Table name:', tableName);
    };

    return (
        <View style={styles.container}>
            <Header screenName={"Editar Mesa"} navigation={navigation} />
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Mesa uno"
                    placeholderTextColor="#999999"
                    value={tableName}
                    onChangeText={setTableName}
                />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
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
    inputContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    label: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
    saveButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#6200EE',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
});

export default EditTable;
