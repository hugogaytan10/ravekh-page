/*import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Trash from '../../assets/SVG/Trash';
import Check from '../../assets/SVG/Check';
import { ThemeLight } from '../Theme/Theme';
import { Header } from '../Utilities/Header';
import { deleteAccount } from './Petitions';
import { AppContext } from '../Context/AppContext';
import { User } from '../Model/User';
import { Store } from '../Model/Store';

export const DeleteAccount = ({ navigation }: any) => {
    const [isChecked, setIsChecked] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [resultModalVisible, setResultModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const context = useContext(AppContext);
    const appColor = context.store?.Color || ThemeLight.btnBackground;
    const handleDeletePress = () => {
        setConfirmModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        setConfirmModalVisible(false);
        setIsLoading(true);

        try {
            const data = await deleteAccount(context.user.Token, context.user.Id);
            if (data) {
                context.setUser({} as User);
                context.setStore({} as Store);
                await AsyncStorage.removeItem('user');
                context.setShowNavBar(false);
                setModalMessage('Cuenta eliminada con éxito');
                navigation.navigate('GetStartedDelete');
            } else {
                setModalMessage('No se pudo eliminar la cuenta. Intenta de nuevo.');
            }
        } catch (error) {
            setModalMessage('Ocurrió un error al intentar eliminar la cuenta.');
        } finally {
            setIsLoading(false);
            setResultModalVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            <View
                style={{
                    backgroundColor:
                        context.store.Color ? context.store.Color : ThemeLight.btnBackground,
                    height: Platform.OS === 'ios' ? 40 : 0,
                }}

            />
            <Header navigation={navigation} screenName="Eliminar cuenta" />
            <View style={styles.content}>
                <View style={styles.Backgroundwhite}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Trash width={60} height={60} fill="red" />
                        </View>
                    </View>
                    <Text style={styles.confirmationText}>
                        Hola, Usuario confirma que quieres eliminar tu cuenta.
                    </Text>
                    {context.user.Role === 'ADMINISTRADOR' && (
                        <Text style={styles.confirmationText}>
                            Como administrador, todo el negocio se perderá junto con sus productos y empleados.
                        </Text>
                    )}
                    <View style={styles.checkItem}>
                        <TouchableOpacity
                            style={[styles.checkboxWrapper, { flexDirection: 'row', alignItems: 'center' }]}
                            onPress={() => setIsChecked(!isChecked)}>
                            <View style={[styles.checkbox, { borderColor: appColor }]}>
                                {isChecked && (
                                    <View style={[styles.checkedBox, { backgroundColor: appColor }]}>
                                        <Check width={16} height={16} />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}> Quiero eliminar mi cuenta.</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.deleteButton, !isChecked && styles.buttonDisabled]}
                disabled={!isChecked}
                onPress={handleDeletePress}
            >
                <Text style={styles.deleteButtonText}>Eliminar cuenta</Text>
            </TouchableOpacity>

            {/* Modal de Confirmación *//*}
            <Modal
                visible={confirmModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>
                            ¿Estás seguro de que deseas eliminar tu cuenta?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setConfirmModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirmDelete}
                            >
                                <Text style={styles.confirmButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Resultado *//*}
            <Modal
                visible={resultModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color={ThemeLight.primaryColor} />
                        ) : (
                            <Text style={styles.modalText}>{modalMessage}</Text>
                        )}
                        {!isLoading && (
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => setResultModalVisible(false)}
                            >
                                <Text style={styles.confirmButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    checkedBox: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 16,
        height: 16,
        borderRadius: 3,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    Backgroundwhite: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        width: '100%',
        alignItems: 'center',
    },
    checkboxContainer: {
        marginTop: 20,
        width: '100%',
    },
    checkboxWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    checkItem: {
        marginTop: 20,
    },
    checkboxLabel: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#333333',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#CCCCCC',
    },
    iconCircle: {
        backgroundColor: ThemeLight.backgrounColor, // Red background for the circle
        borderRadius: 45, // Half of the width/height to make it circular
        width: 90,
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    confirmationText: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        marginBottom: 20,
        color: '#333333',
    },
    checkboxChecked: {
        backgroundColor: ThemeLight.primaryColor,
        borderColor: ThemeLight.primaryColor,
    },
    deleteButton: {
        backgroundColor: '#FF0000',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
        marginHorizontal: 20,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    buttonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: '#ff0000',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#ff0000',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});

export default DeleteAccount;*/