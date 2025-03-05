import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet,ImageBackground } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

// Tipo personalizado para el resultado del DocumentPicker
type MyDocumentResult =
  | { type: 'cancel' }
  | {
      type: 'success';
      assets: Array<{
        uri: string;
        name: string;
        size?: number | null;
        mimeType?: string;
      }>;
    };

const DB_NAME = 'gestiona_taxi_2025.db';
const DB_PATH = FileSystem.documentDirectory + 'SQLite/' + DB_NAME;

export default function ConfigScreen() {
  const [dbSize, setDbSize] = useState<number | null>(null);

  useEffect(() => {
    checkDatabaseSize();
  }, []);

  const checkDatabaseSize = async () => {
    try {
      const info = await FileSystem.getInfoAsync(DB_PATH);
      if (info.exists && info.size) {
        // Convertimos bytes a MB
        const sizeInMB = info.size / (1024 * 1024);
        setDbSize(sizeInMB);
      } else {
        setDbSize(0);
      }
    } catch (error) {
      console.error('Error obteniendo tamaño de la BD:', error);
    }
  };

  const exportDatabase = async () => {
    try {
      const info = await FileSystem.getInfoAsync(DB_PATH);
      if (!info.exists) {
        Alert.alert('Error', '¡No se encontró la base de datos!');
        return;
      }

      const tempPath = FileSystem.cacheDirectory + DB_NAME;
      await FileSystem.copyAsync({ from: DB_PATH, to: tempPath });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempPath, {
          mimeType: 'application/x-sqlite3',
          dialogTitle: 'Exportar Base de Datos',
          UTI: 'public.data',
        });
      } else {
        Alert.alert('Error', 'No se puede compartir en este dispositivo.');
      }
    } catch (error) {
      console.error('Error al exportar la BD:', error);
      Alert.alert('Error', 'No se pudo exportar la base de datos.');
    }
  };

  const importDatabase = async () => {
    try {
      const result = (await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      })) as unknown as MyDocumentResult;

      if (result.type === 'cancel') {
        return;
      }

      const documentUri = result.assets?.[0]?.uri;
      const documentName = result.assets?.[0]?.name;

      if (!documentUri || !documentName) {
        Alert.alert('Error', 'No se pudo obtener la URI o el nombre del documento.');
        return;
      }

      if (documentName !== DB_NAME) {
        Alert.alert('Error', `El archivo seleccionado (${documentName}) no es la base de datos esperada.`);
        return;
      }

      await FileSystem.copyAsync({ from: documentUri, to: DB_PATH });
      Alert.alert('Éxito', 'Base de datos importada correctamente!');
      checkDatabaseSize(); // Recalcular el tamaño al terminar
    } catch (error) {
      console.error('Error al importar la BD:', error);
      Alert.alert('Error', 'No se pudo importar la base de datos.');
    }
  };

  return (
    <ImageBackground source={require('../../../assets/img/agenda.webp')} style={styles.imageBackground}>
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      {/* Sólo se muestra el tamaño actual de la BD (en MB) */}
      <View style={styles.dbInfoContainer}>
        <Text style={styles.dbInfoText}>
          Tamaño actual de la BD: {dbSize?.toFixed(2)} MB
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={exportDatabase}>
        <Text style={styles.buttonText}>Exportar Base de Datos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={importDatabase}>
        <Text style={styles.buttonText}>Importar Base de Datos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={checkDatabaseSize}>
        <Text style={styles.buttonText}>Actualizar Espacio</Text>
      </TouchableOpacity>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    fontWeight: 'bold',
    color:'orange'
  },
  dbInfoContainer: {
    width: '80%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 20,
  },
  dbInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
