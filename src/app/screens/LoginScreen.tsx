import { View, Text, TextInput, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import LoginHook from '../hooks/LoginHook';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types'
import { NavigationProp } from '@react-navigation/native';


export default function LoginScreen() {
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleRegister = () => {
    navigation.navigate('Register');
  }

  const { email, setEmail, password, setPassword, handleLogin, error } = LoginHook();
  
  return (
    <ImageBackground
      source={require('../../../assets/img/agenda.png')}
      style={styles.imageBackground}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar Sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.error}>{error}</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

      <Text style={styles.registerText} onPress={handleRegister}>Regístrate</Text>
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
  button: {
    width: '50%',
    height: 50,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    textDecorationLine: 'underline',
    
  },
  error:{
    color: 'red',
    marginBottom: 15,
  }
});
