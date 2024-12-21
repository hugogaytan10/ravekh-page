import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  ToastAndroid,
  View,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
import {PERMISSIONS, requestMultiple, RESULTS} from 'react-native-permissions';
import {styles} from '../Printer/styles';
import {ChevronBack} from '../../assets/SVG/ChevronBack';
import {ThemeLight} from '../Theme/Theme';
import {AppContext} from '../Context/AppContext';
import ItemList from '../Printer/ItemList';
import SamplePrint from '../Printer/SamplePrint';
export const HardwareSettings = ({navigation}) => {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDs, setFoundDs] = useState([]);
  const [bleOpend, setBleOpend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [boundAddress, setBoundAddress] = useState('');
  const [showModal, setShowModal] = useState(false);
  const context = useContext(AppContext);
  const printerKeywords = ['printer', 'epson', 'zebra', 'pos'];

  useEffect(() => {
    BluetoothManager.isBluetoothEnabled().then(
      enabled => {
        setBleOpend(Boolean(enabled));
        setLoading(false);
      },
      err => {
        err;
      },
    );

    if (Platform.OS === 'ios') {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        rsp => {
          deviceAlreadPaired(rsp);
        },
      );
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        rsp => {
          deviceFoundEvent(rsp);
        },
      );
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST,
        () => {
          setName('');
          setBoundAddress('');
        },
      );
    } else if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        rsp => {
          deviceAlreadPaired(rsp);
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        rsp => {
          deviceFoundEvent(rsp);
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST,
        () => {
          setName('');
          setBoundAddress('');
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT,
        () => {
          ToastAndroid.show(
            'Este dispositivo no soporta bluetooth',
            ToastAndroid.LONG,
          );
        },
      );
    }
    if (pairedDevices.length < 1) {
      scan();
    }
  }, [boundAddress, deviceAlreadPaired, deviceFoundEvent, pairedDevices, scan]);

  useEffect(() => {
    const checkBluetoothStatus = () => {
      BluetoothManager.isBluetoothEnabled().then(
        enabled => {
          const isBluetoothOn = Boolean(enabled);
          if (isBluetoothOn !== bleOpend) {
            setBleOpend(isBluetoothOn);
          }
        },
        err => {
          console.error('Error al verificar el estado del Bluetooth:', err);
        },
      );
    };

    // Verificar cada 2 segundos
    const intervalId = setInterval(() => {
      checkBluetoothStatus();
    }, 2000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      clearInterval(intervalId);
    };
  }, [bleOpend]);
  const isPrinter = deviceName => {
    console.log('deviceName:', deviceName);
    return printerKeywords.some(keyword =>
      deviceName.toLowerCase().includes(keyword),
    );
  };

  const deviceAlreadPaired = useCallback(
    rsp => {
      var ds = null;
      if (typeof rsp.devices === 'object') {
        ds = rsp.devices;
      } else {
        try {
          ds = JSON.parse(rsp.devices);
        } catch (e) {}
      }

      if (ds && ds.length) {
        // Filtrar dispositivos cuyo nombre contenga la palabra "printer" (u otra palabra clave que defina una impresora)
        let filteredDevices = ds.filter(
          device =>
            device.name && device.name.toLowerCase().includes('printer'),
        );

        let pared = pairedDevices;
        if (pared.length < 1) {
          pared = pared.concat(filteredDevices || []);
        }
        setPairedDevices(pared);
      }
    },
    [pairedDevices],
  );

  const deviceFoundEvent = useCallback(
    rsp => {
      let r = null;
      try {
        if (typeof rsp.device === 'object') {
          r = rsp.device;
        } else {
          r = JSON.parse(rsp.device);
        }
      } catch (e) {
        console.error('Error al parsear el dispositivo:', e);
      }

      // Verificar que el dispositivo tenga la propiedad `name`
      if (
        r &&
        typeof r.name === 'string' &&
        (r.name.toLowerCase().includes('printer') || isPrinter(r.name))
      ) {
        let found = foundDs || [];
        if (found.findIndex) {
          let duplicated = found.findIndex(function (x) {
            return x.address === r.address;
          });
          if (duplicated === -1) {
            found.push(r);
            setFoundDs(found);
          }
        }
      } else {
        console.log('Dispositivo sin nombre o no válido:', r);
      }
    },
    [foundDs],
  );

  const connect = row => {
    setLoading(true);
    BluetoothManager.connect(row.address).then(
      s => {
        setLoading(false);
        setBoundAddress(row.address);
        context.setPrinterConnection(true);
        setName(row.name || 'Desconocido');
      },
      e => {
        setLoading(false);
        setShowModal(true);
      },
    );
  };

  const unPair = address => {
    setLoading(true);
    BluetoothManager.unpaire(address).then(
      s => {
        setLoading(false);
        setBoundAddress('');
        context.setPrinterConnection(false);
        setName('');
      },
      e => {
        setLoading(false);
        setShowModal(true);
      },
    );
  };

  const scanDevices = useCallback(() => {
    setLoading(true);
    BluetoothManager.scanDevices().then(
      s => {
        // const pairedDevices = s.paired;
        var found = s.found;
        try {
          found = JSON.parse(found); //@FIX_it: the parse action too weired..
        } catch (e) {
          //ignore
        }
        var fds = foundDs;
        if (found && found.length) {
          fds = found;
        }
        setFoundDs(fds);
        setLoading(false);
      },
      er => {
        setLoading(false);
        // ignore
      },
    );
  }, [foundDs]);

  const scan = useCallback(() => {
    try {
      async function blueTooth() {
        const permissions = {
          title: 'La app Bluetooth solicita permiso para acceder al Bluetooth',
          message:
            'La App Bluetooth necesita acceso al Bluetooth para el proceso de conexión con la impresora Bluetooth',
          buttonNeutral: 'En otro momento',
          buttonNegative: 'Denegar',
          buttonPositive: 'Aceptar',
        };

        const bluetoothConnectGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          permissions,
        );
        if (bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED) {
          const bluetoothScanGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            permissions,
          );
          if (bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED) {
            scanDevices();
          }
        } else {
          // ignore akses ditolak
        }
      }
      blueTooth();
    } catch (err) {
      console.warn(err);
    }
  }, [scanDevices]);

  const scanBluetoothDevice = async () => {
    setLoading(true);
    try {
      const request = await requestMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ]);

      if (
        request['android.permission.ACCESS_FINE_LOCATION'] === RESULTS.GRANTED
      ) {
        scanDevices();
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <View>
        <Pressable
          style={styles.backContainer}
          onPress={() => navigation.goBack()}>
          <ChevronBack height={30} width={30} />
        </Pressable>
        <Pressable
          style={styles.bluetoothStatusContainer}
          onPress={() => {
            scanBluetoothDevice();
          }}>
          <Text style={[styles.bluetoothStatus(ThemeLight.btnBackground),{backgroundColor:context.store.Color}]}>
            <Text style={styles.btnScanner}>
              Escanear dispositivos Bluetooth
            </Text>
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.btnOmitir} onPress={()=>{navigation.navigate('MainCart');}}>
        <Text style={[styles.textOmitir,{color:context.store.Color}]}>Omitir Impresora</Text>
      </Pressable>

      {!bleOpend ? (
        <Text style={styles.bluetoothInfo}>Por favor, active su Bluetooth</Text>
      ) : (
        <>
          {boundAddress.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                La impresora está conectada al dispositivo:
              </Text>
              <ItemList
                label={name}
                value={boundAddress}
                onPress={() => unPair(boundAddress)}
                actionText="Desvincular"
                color="rgba(235, 10, 8, 0.7)"
              />
            </>
          )}

          <Text style={styles.sectionTitle}>
            Dispositivos Bluetooth conectados a este dispositivo anteriormente:
          </Text>

          {loading ? <ActivityIndicator animating={true} /> : null}
          <View style={styles.containerList}>
            {pairedDevices.map((item, index) => {
              return (
                <ItemList
                  key={index}
                  onPress={() => connect(item)}
                  label={item.name}
                  value={item.address}
                  connected={item.address === boundAddress}
                  actionText="Conectar"
                  color={ThemeLight.backgroundIcon}
                />
              );
            })}
          </View>

          <View style={{height: 100}} />
          <Modal
            animationType="slide"
            transparent={true}
            visible={showModal}
            onRequestClose={() => {
              setLoading(false);
            }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Advertencia</Text>
                <Text style={styles.modalText}>
                  Vuelve a dar click en conectar, por favor
                </Text>
                <Pressable
                  style={styles.modalButton}
                  onPress={() => setShowModal(false)}>
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      )}

      {context.printerConnection && (
        <View style={styles.containerTestPrint}>
          <SamplePrint />
        </View>
      )}
    </View>
  );
};