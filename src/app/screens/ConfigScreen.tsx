import React from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

// 1. Define tu propio tipo para reflejar lo que *realmente* devuelve getDocumentAsync()
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
          UTI: 'public.data', // iOS
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

      console.log('DocumentPicker Result:', result);

      if (result.type === 'cancel') {
        return;
      }

      const documentUri = result.assets && result.assets[0] && result.assets[0].uri;
      const documentName = result.assets && result.assets[0] && result.assets[0].name;

      console.log('URI:', documentUri);
      console.log('Name:', documentName);

      if (!documentUri || !documentName) {
        Alert.alert('Error', 'No se pudo obtener la URI o el nombre del documento.');
        return;
      }

      if (documentName !== DB_NAME) {
        Alert.alert('Error', `El archivo seleccionado (${documentName}) no coincide con el nombre esperado (${DB_NAME}).`);
        return;
      }

      await FileSystem.copyAsync({
        from: documentUri,
        to: DB_PATH,
      });

      Alert.alert('Éxito', 'Base de datos importada correctamente!');
    } catch (error) {
      console.error('Error al importar la BD:', error);
      Alert.alert('Error', 'No se pudo importar la base de datos.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>
      <TouchableOpacity style={styles.button} onPress={exportDatabase}>
        <Text style={styles.buttonText}>Exportar Base de Datos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={importDatabase}>
        <Text style={styles.buttonText}>Importar Base de Datos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
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
});
