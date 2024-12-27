import React, {useContext, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform,
} from 'react-native';
import {Header} from '../Utilities/Header';
import {ThemeLight} from '../Theme/Theme';
import {getTables, updateTables} from './Petitions';
import {AppContext} from '../Context/AppContext';

export const TableOrders = ({navigation}: any) => {
    const context = useContext(AppContext);
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true); // Estado para el loader
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const onSave = () => {
        setLoading(true);
        updateTables(context.user.Token, context.user.Business_Id + '', isEnabled).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        getTables(context.user.Token, context.user.Business_Id + '').then(data => {
            if (data) {
                setIsEnabled(true);
            }
            setLoading(false); // Oculta el loader después de obtener los datos
        });
    }, []);

    return (
        <View style={styles.container}> 
        <View
            style={{
            backgroundColor:
                context.store.Color ? context.store.Color : ThemeLight.btnBackground,
            height: Platform.OS === 'ios' ? 40 : 0,
            }}

        />
            <Header screenName={'Pedidos con mesa'} navigation={navigation} />
            {loading ? (
                <ActivityIndicator size="large" color={ThemeLight.primaryColor} />
            ) : (
                <>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>Permitir pedidos con mesa</Text>
                        <Switch
                            trackColor={{false: '#767577', true: '#6200EE'}}
                            thumbColor={isEnabled ? '#FFFFFF' : '#f4f3f4'}
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                        />
                    </View>
                    <View style={styles.containerBtn}>
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                {
                                    backgroundColor: context.store.Color
                                        ? context.store.Color
                                        : ThemeLight.btnBackground,
                                },
                            ]}
                            onPress={onSave}>
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ThemeLight.backgrounColor, // Color de fondo claro
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
    containerBtn: {
        position: 'absolute',
        bottom: 0,
        height: 104,
        width: '100%',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: '#6200EE',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '70%',
        position: 'absolute',
        borderRadius: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default TableOrders;
