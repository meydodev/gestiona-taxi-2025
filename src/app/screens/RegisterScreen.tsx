import { View, Text, TextInput, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import RegisterHook from '../hooks/RegisterHook';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';
import ButtonsAuth from '../components/ButtonAuth';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const {
    name,
    setName,
    surNames,
    setSurNames,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleRegister,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    error,
  } = RegisterHook();

  return (
    <ImageBackground source={require('../../../assets/img/agenda.webp')} style={styles.imageBackground}>
      <View style={styles.container}>
        <Text style={styles.title}>Registro</Text>

        {/* Campo de Nombre */}
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Campo de Apellidos */}
        <View style={styles.inputContainer}>
          <Icon name="users" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Apellidos"
            placeholderTextColor="#aaa"
            value={surNames}
            onChangeText={setSurNames}
          />
        </View>

        {/* Campo de Correo Electrónico */}
        <View style={styles.inputContainer}>
          <Icon name="envelope" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Campo de Contraseña */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#888" style={styles.icon} />
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

        {/* Campo de Confirmar Contraseña */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.inputPassword}
            placeholder="Confirmar Contraseña"
            placeholderTextColor="#aaa"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={showConfirmPassword}
          />
          <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.iconContainer}>
            <Icon name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <Text style={styles.error}>{error}</Text>

        <ButtonsAuth onPress={handleRegister}>
          <Icon name="user-plus" size={15} color="#fff" />
          {' '}
  
          Registrarse</ButtonsAuth>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.legalText}>
            Al registrarte, aceptas nuestra{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('PrivacyPolicy')}>Política de Privacidad</Text>,{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('LegalNotice')}>Aviso Legal</Text> y{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('TermsOfUse')}>Condiciones de Uso</Text>.
          </Text>
        </View>


        <Text style={styles.registerText} onPress={handleLogin}>
          ¿Ya tienes una cuenta? <Text style={styles.link}>Inicia sesión</Text>
        </Text>
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
    width: '80%', // Igual que en LoginScreen
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
  inputPassword: {
    flex: 1,
    height: 50,
  },
  iconContainer: {
    padding: 10,
  },
  icon: {
    marginRight: 10,
  },
  registerText: {
    marginTop: 20,
  },
  link: {
    color: '#000',
  },
  error: {
    color: 'red',
    marginBottom: 15,
  },
  legalText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
  
  legalLink: {
    color: 'orange',
    textDecorationLine: 'underline',
  },
  
});
