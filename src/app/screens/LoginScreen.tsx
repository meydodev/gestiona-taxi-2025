import {
  View,
  Text,
  TextInput,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import LoginHook from '../hooks/LoginHook';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';
import ButtonsAuth from '../components/ButtonAuth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseConnection } from '../database/database-connection';


export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    togglePasswordVisibility,
    showPassword,
    error,
  } = LoginHook();

  const [rememberMe, setRememberMe] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [emailToCheck, setEmailToCheck] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    const loadCredentials = async () => {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');

      if (savedRememberMe === 'true') {
        setEmail(savedEmail || '');
        setPassword(savedPassword || '');
        setRememberMe(true);
      }
    };
    loadCredentials();
  }, []);

  const handleToggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleLoginWithRememberMe = async () => {
    if (rememberMe) {
      await AsyncStorage.setItem('savedEmail', email);
      await AsyncStorage.setItem('savedPassword', password);
      await AsyncStorage.setItem('rememberMe', 'true');
    } else {
      await AsyncStorage.removeItem('savedEmail');
      await AsyncStorage.removeItem('savedPassword');
      await AsyncStorage.removeItem('rememberMe');
    }
    handleLogin();
  };

  const handleCheckEmail = async () => {
    const email = emailToCheck.trim().toLowerCase();
    if (!email) {
      setModalError('Introduce un correo válido');
      return;
    }

    try {
      const db = await DatabaseConnection.getConnection();
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE email = ?',
        [email]
      );

      if (result && typeof result.count === 'number' && result.count > 0) {
        setModalVisible(false);
        setEmailToCheck('');
        setModalError('');
        navigation.navigate('ForgotPassword', { email });
      } else {
        setModalError('Este correo no está registrado');
      }
      
    } catch (err) {
      console.error('Error al comprobar el correo:', err);
      setModalError('Hubo un error al verificar');
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/img/agenda.webp')}
      style={styles.imageBackground}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Contraseña"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={showPassword}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.iconContainer}
          >
            <Icon
              name={showPassword ? 'eye-slash' : 'eye'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.rememberMeContainer}
          onPress={handleToggleRememberMe}
        >
          <Icon
            name={rememberMe ? 'check-square' : 'square-o'}
            size={20}
            color="#888"
          />
          <Text style={styles.rememberMeText}>
            Recordar usuario y contraseña
          </Text>
        </TouchableOpacity>

        <Text style={styles.error}>{error}</Text>
        
        <ButtonsAuth onPress={handleLoginWithRememberMe}>
          <Icon name="sign-in" size={15} color="#fff" />
          {' '}
          Entrar</ButtonsAuth>

        <Text
          style={styles.forgotPasswordText}
          onPress={() => setModalVisible(true)}
        >
          ¿Olvidaste tu contraseña?
        </Text>

        <Text
          style={styles.registerText}
          onPress={() => navigation.navigate('Register')}
        >
          Regístrate
        </Text>
      </View>

      {/* Modal para introducir email */}
      <Modal
  animationType="fade"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalBackground}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Recuperar contraseña</Text>

      <TextInput
        style={styles.modalInput}
        placeholder="Introduce tu correo"
        placeholderTextColor="#aaa"
        value={emailToCheck}
        onChangeText={(text) => {
          setEmailToCheck(text);
          setModalError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {modalError !== '' && (
        <Text style={styles.modalError}>{modalError}</Text>
      )}

      <View style={styles.modalButtonContainer}>
        
      <TouchableOpacity
          onPress={handleCheckEmail}
          style={[styles.modalButton, styles.acceptButton]}
        >
          <Text style={styles.acceptButtonText}>Aceptar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          style={[styles.modalButton, styles.cancelButton]}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

      </View>
    </View>
  </View>
</Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: 'orange',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
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
  inputPassword: {
    flex: 1,
    height: 50,
  },
  iconContainer: {
    padding: 10,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rememberMeText: {
    marginLeft: 8,
    color: '#888',
  },
  registerText: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginBottom: 15,
  },
  forgotPasswordText: {
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalError: {
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  acceptButton: {
    backgroundColor: 'orange',
    
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  
});
