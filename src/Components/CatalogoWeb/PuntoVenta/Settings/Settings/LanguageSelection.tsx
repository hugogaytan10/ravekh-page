/*import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import Search from '../../assets/SVG/Search';
import { ThemeLight } from '../Theme/Theme'; // Assuming you have a theme file
import { Header } from '../Utilities/Header'; // Assuming you have a header component

export type Language = {
    id: number;
    image: string;
    name: string;
}

const languages: Language[] = [
    { id: 1, image: '../../assets/Img/Mx.jpg', name: 'Español MX' },
    { id: 2, image: '../../assets/Img/Br.jpg', name: 'Portugues' },
    { id: 3, image: '../../assets/Img/India.jpg', name: 'Indio' },
    { id: 4, image: '../../assets/Img/Rusa.webp', name: 'Ruso' },
    { id: 5, image: '../../assets/Img/Alemani.webp', name: 'Alemán' },
    // Añade más idiomas aquí
];

export const LanguageSelection = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Header navigation={navigation} screenName={"Selecciona tu idioma"} />
            <View style={styles.searchBar}>
                <Search width={20} height={20} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar Lenguaje."
                    placeholderTextColor="#999999"
                />
            </View>
            <ScrollView style={styles.languageList}>
                {languages.map((language) => (
                    <View key={language.id} style={styles.languageItem}>
                        <Image source={{ uri: language.image }} style={{ width: 40, height: 40 }} />
                        <Text style={styles.languageText}>{language.name}</Text>
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF6FF', // Color de fondo claro
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
    languageList: {
        padding: 20,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
    },
    languageText: {
        marginLeft: 15,
        fontSize: 16,
        color: '#333333',
        fontFamily: 'Poppins-SemiBold',
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

export default LanguageSelection;
*/