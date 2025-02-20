import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'database.db'; // Nombre de tu BD
const DB_PATH = FileSystem.documentDirectory + 'SQLite/' + DB_NAME; // Ruta donde SQLite almacena la BD

export default function ConfigScreen() {
  const exportDatabase = async () => {
    try {
      const exportPath = FileSystem.documentDirectory + DB_NAME; // Ruta donde guardaremos la copia
      await FileSystem.copyAsync({ from: DB_PATH, to: exportPath });

      Alert.alert('Éxito', `Base de datos exportada a: ${exportPath}`);
      console.log('Exportación exitosa:', exportPath);
    } catch (error) {
      console.error('Error al exportar la BD:', error);
      Alert.alert('Error', 'No se pudo exportar la base de datos.');
    }
  };

  const importDatabase = async () => {
    try {
      const importPath = FileSystem.documentDirectory + DB_NAME; // Ruta del archivo a importar

      // Verificar si el archivo de importación existe
      const fileInfo = await FileSystem.getInfoAsync(importPath);
      if (!fileInfo.exists) {
        Alert.alert('Error', 'No se encontró un archivo de base de datos para importar.');
        return;
      }

      await FileSystem.copyAsync({ from: importPath, to: DB_PATH });

      Alert.alert('Éxito', 'Base de datos importada correctamente.');
      console.log('Importación exitosa');
    } catch (error) {
      console.error('Error al importar la BD:', error);
      Alert.alert('Error', 'No se pudo importar la base de datos.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Configuración</Text>
      <Button title="Exportar Base de Datos" onPress={exportDatabase} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Importar Base de Datos" onPress={importDatabase} />
    </View>
  );
}
