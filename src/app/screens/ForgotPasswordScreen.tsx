import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,

} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ForgotPasswordHook from '../hooks/ForgotPasswordHook';



export default function ForgotPassword() {
  // Hook para manejar la lógica de la pantalla
  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    togglePasswordVisibility,
    error,
    handleChangePassword,
  } = ForgotPasswordHook();
  
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
            <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#888" />{' '}
            {showPassword ? 'Mostrar' : 'Ocultar'} contraseñas
          </Text>
        </TouchableOpacity>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>
            <Icon name="refresh" size={15} color="#fff" /> Cambiar
            Cambiar contraseña</Text>
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
