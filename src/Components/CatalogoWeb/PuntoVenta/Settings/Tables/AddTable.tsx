import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Header } from '../Utilities/Header';
import { ThemeLight } from '../Theme/Theme';

 export const AddTable = ({ navigation }) => {
    const [tableName, setTableName] = useState('');

    const handleSave = () => {
        // Implementa la lógica de guardado aquí
        console.log('Table name:', tableName);
    };

    return (
        <View style={styles.container}>
            <Header screenName={"Agregar Mesa"} navigation={navigation} />
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
        backgroundColor: ThemeLight.backgrounColor, // Color de fondo claro
    },
    inputContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    label: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 10,
        color: '#333333',
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

export default AddTable;
