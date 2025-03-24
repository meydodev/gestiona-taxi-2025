import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';


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
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


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
  
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Base de Datos</Text>
          <Text style={styles.cardText}>Tamaño actual: {dbSize?.toFixed(2)} MB</Text>
  
          <TouchableOpacity style={styles.cardButton} onPress={exportDatabase}>
            <Text style={styles.cardButtonText}>Exportar</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.cardButton} onPress={importDatabase}>
            <Text style={styles.cardButtonText}>Importar</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.cardButton} onPress={checkDatabaseSize}>
            <Text style={styles.cardButtonText}>Actualizar Tamaño</Text>
          </TouchableOpacity>
        </View>
  
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información Legal</Text>
  
          <TouchableOpacity style={styles.cardLink} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.cardLinkText}>📜 Política de Privacidad</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.cardLink} onPress={() => navigation.navigate('LegalNotice')}>
            <Text style={styles.cardLinkText}>⚖️ Aviso Legal</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.cardLink} onPress={() => navigation.navigate('TermsOfUse')}>
            <Text style={styles.cardLinkText}>📄 Condiciones de Uso</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
  

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 60,
    width: '90%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'orange',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    marginBottom: 15,
    color: '#444',
  },
  cardButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cardLink: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cardLinkText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
});
