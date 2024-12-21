/*import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
  TextStyle,
  Platform,
} from 'react-native';
import Check from '../../assets/SVG/Check'; // Ensure this path is correct and the Check component exists
import {AppContext} from '../Context/AppContext';
import {ThemeLight} from '../Theme/Theme';
import {Header} from '../Utilities/Header';
import {URL} from '../Const/Const';
import {updateBusinessWithTaxId} from './Petitions';
import {Tax} from '../Model/Tax';

export const SalesTaxSettings = ({navigation}: any) => {
  const context = useContext(AppContext); // Obtener el contexto de la aplicación
  const [isTaxEnabled, setIsTaxEnabled] = useState(true);
  const [isFixedRate, setIsFixedRate] = useState(false);
  const [isAddedToTotal, setIsAddedToTotal] = useState(false);
  const [isRemovable, setIsRemovable] = useState(false);
  const [description, setDescription] = useState(''); // Estado para la descripción
  const [taxValue, setTaxValue] = useState(''); // Estado para el valor del impuesto
  const [taxesId, setTaxesId] = useState<number | null>(null); // Estado para almacenar el Taxes_Id
  const [businessData, setBusinessData] = useState<any>(null); // Estado para almacenar los datos del negocio
  const [loading, setLoading] = useState(false); // Estado para manejar el loader
  const [updated, setUpdated] = useState(false); // Estado para actualizar el botón al finalizar
  const {user} = useContext(AppContext);
  const appColor = context.store?.Color || ThemeLight.btnBackground;

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${URL}business/${context.user.Business_Id}`,
        {
          headers: {
            token: context.user.Token,
          },
        },
      );
      const data = await response.json();
      setBusinessData(data);
      setTaxesId(data.Taxes_Id);
      if (data.Taxes_Id !== null) {
        await fetchTaxData(data.Taxes_Id);
      }
    } catch (error) {
      console.error('Error al cargar los datos del negocio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxData = async (taxId: number) => {
    try {
      const response = await fetch(`${URL}taxes/${taxId}`, {
        headers: {
          token: context.user.Token,
        },
      });
      const taxData = await response.json();
      setIsTaxEnabled(true);
      setIsFixedRate(taxData.IsPercent == 0 ? false : true);
      setDescription(taxData.Description);
      setTaxValue(taxData.Value.toString());
      //setIsAddedToTotal(taxData.AppliedInProduct);
      setIsRemovable(taxData.QuitInSale == 0 ? false : true);
    } catch (error) {
      console.error('Error al cargar los datos del impuesto:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setUpdated(false);
    const taxData = {
      IsPercent: isFixedRate,
      Description: description,
      Value: parseFloat(taxValue),
      //AppliedInProduct: isAddedToTotal,
      QuitInSale: isRemovable,
    };
    try {
      let response;
      let taxesIdToUpdate = taxesId;

      if (taxesId === null) {
        response = await fetch(`${URL}taxes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token: context.user.Token,
          },
          body: JSON.stringify(taxData),
        });

        const responseData = await response.json();
        taxesIdToUpdate = responseData;
        setTaxesId(taxesIdToUpdate);
        await updateBusinessWithTaxId(
          taxesIdToUpdate || 0,
          context.user.Business_Id,
          context.user.Token,
        );
        context.setTax(taxData);
      } else {
        response = await fetch(`${URL}taxes/${taxesId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            token: context.user.Token,
          },
          body: JSON.stringify(taxData),
        });
        context.setTax(taxData);
      }

      setUpdated(true); // Marcar como actualizado
    } catch (error) {
      console.error('Error al guardar los datos del impuesto:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isTaxEnabled) {
      try {
        fetch(`${URL}taxes/${businessData.Taxes_Id}`, {
          //delete
          method: 'DELETE',
          headers: {
            token: context.user.Token,
          },
        });
        context.setTax({} as Tax);
      } catch (e) {
        console.error('Error al eliminar los impuestos:', e);
      }
    }
  }, [isTaxEnabled]);

  useEffect(() => {
    fetchBusinessData();
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
      <Header screenName={'Impuestos'} navigation={navigation} />
      <View style={{padding: 20, flex: 1}}>
        <View style={styles.toggleItem}>
          <Text style={styles.optionLabel}>Usar impuesto de venta</Text>
          <Switch
            value={isTaxEnabled}
            onValueChange={setIsTaxEnabled}
            trackColor={{false: '#767577', true: appColor}}
            thumbColor={isTaxEnabled ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        {isTaxEnabled && (
          <>
            <View style={styles.checkItem}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsFixedRate(!isFixedRate)}>
                <Text style={styles.checkboxLabel}>Porcentaje</Text>
                <View style={[styles.checkbox, {borderColor: appColor}]}>
                  {isFixedRate && (
                    <View
                      style={[styles.checkedBox, {backgroundColor: appColor}]}>
                      <Check width={16} height={16} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Descripción"
                placeholderTextColor="#999999"
                value={description}
                onChangeText={setDescription}
              />
              <TextInput
                style={styles.input}
                placeholder="Impuesto de venta"
                placeholderTextColor="#999999"
                keyboardType="numeric"
                value={taxValue}
                onChangeText={setTaxValue}
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={[
            styles.saveButton,
            !isTaxEnabled && styles.disabledButton,
            {backgroundColor: isTaxEnabled ? appColor : '#CCCCCC'},
          ]}
          onPress={handleSave}
          disabled={!isTaxEnabled || loading}>
          <Text style={styles.saveButtonText}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : updated ? (
              '¡Actualizado!'
            ) : (
              'Guardar'
            )}
          </Text>
        </TouchableOpacity>

        {loading && (
          <Modal transparent={true} animationType="fade">
            <View style={styles.modalBackground}>
              <View style={styles.activityIndicatorWrapper}>
                <ActivityIndicator size="large" color={appColor} />
                <Text style={{marginTop: 10, color: appColor}}>
                  Guardando...
                </Text>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  checkItem: {
    marginTop: 20,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333333',
    fontFamily: 'Poppins-Regular',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333333',
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
  checkedBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  inputContainer: {
    marginVertical: 20,
  },
  input: {
    height: 40,
    color: '#333333',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 8,
    fontFamily: 'Poppins-SemiBold',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignSelf: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});
*/