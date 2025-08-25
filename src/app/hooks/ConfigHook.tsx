import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

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

export default function ConfigHook() {

const [dbSize, setDbSize] = useState<number | null>(null);
const DB_NAME = 'gestiona_taxi_2025.db';
const DB_PATH = FileSystem.documentDirectory + 'SQLite/' + DB_NAME;


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

  useEffect(() => {
    checkDatabaseSize();
  }, []);

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

  return {
    dbSize,
    setDbSize,
    checkDatabaseSize,
    exportDatabase,
    importDatabase,
  };

}
