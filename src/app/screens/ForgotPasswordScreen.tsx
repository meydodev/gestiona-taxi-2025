import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';
import { DatabaseConnection } from '../database/database-connection';
import Icon from 'react-native-vector-icons/FontAwesome';

// Tipo para acceder a los parámetros de ruta
type ForgotPasswordRouteProp = RouteProp<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPassword() {
  const route = useRoute<ForgotPasswordRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // ✅ Tipado correcto
  const email = route.params?.email || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleChangePassword = async () => {
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        newPassword.trim()
      );

      const db = await DatabaseConnection.getConnection();
      await db.runAsync('UPDATE users SET password = ? WHERE email = ?', [
        hashedPassword,
        email,
      ]);

      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      navigation.navigate('Login'); // ✅ Ya no dará error
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
      setError('Hubo un error al cambiar la contraseña');
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/img/agenda.webp')}
      style={styles.imageBackground}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Nueva contraseña</Text>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            placeholderTextColor="#aaa"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={showPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#aaa"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={showPassword}
          />
        </View>

        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Text style={styles.toggleText}>
            {showPassword ? 'Mostrar' : 'Ocultar'} contraseñas
          </Text>
        </TouchableOpacity>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Cambiar contraseña</Text>
        </TouchableOpacity>
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
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: 'orange',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  toggleText: {
    color: '#555',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'orange',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
