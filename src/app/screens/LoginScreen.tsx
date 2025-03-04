import { View, Text, TextInput, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import LoginHook from '../hooks/LoginHook';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';
import ButtonsAuth from '../components/ButtonAuth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { email, setEmail, password, setPassword, handleLogin, togglePasswordVisibility, showPassword, error } = LoginHook();

  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Cargar credenciales guardadas
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

  return (
    <ImageBackground source={require('../../../assets/img/agenda.webp')} style={styles.imageBackground}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        {/* Campo de correo electrónico */}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Campo de contraseña con icono para alternar visibilidad */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Contraseña"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={showPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
            <Icon name={showPassword ? "eye-slash" : "eye"} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Checkbox de "Recordar usuario y contraseña" */}
        <TouchableOpacity style={styles.rememberMeContainer} onPress={handleToggleRememberMe}>
          <Icon name={rememberMe ? "check-square" : "square-o"} size={20} color="#888" />
          <Text style={styles.rememberMeText}>Recordar usuario y contraseña</Text>
        </TouchableOpacity>

        <Text style={styles.error}>{error}</Text>

        <ButtonsAuth onPress={handleLoginWithRememberMe}>Entrar</ButtonsAuth>

        <Text style={styles.registerText} onPress={() => navigation.navigate('Register')}>Regístrate</Text>
      </View>
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
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    marginBottom: 15,
  },
});
