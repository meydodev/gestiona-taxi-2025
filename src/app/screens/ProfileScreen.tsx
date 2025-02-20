import { View, Text, TextInput, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import ProfileHook from '../hooks/ProfileHook';
import ButtonsAuth from '../components/ButtonAuth';
import ButtonsDelete from '../components/ButtonDelete';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ProfileScreen() {
  const {
    name,
    setName,
    surNames,
    setSurNames,
    email,
    setEmail,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    handleUpdate,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    error,
    handleDelete,
    success,
  } = ProfileHook();

  return (
    <ImageBackground source={require('../../../assets/img/agenda.webp')} style={styles.imageBackground}>
      <View style={styles.container}>
        <Text style={styles.title}>Editar Perfil</Text>

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

        {/* Campo de Nueva Contraseña */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.inputPassword}
            placeholder="Nueva contraseña (opcional)"
            placeholderTextColor="#aaa"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={showPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
            <Icon name={showPassword ? "eye-slash" : "eye"} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Confirmar Nueva Contraseña */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.inputPassword}
            placeholder="Confirmar nueva contraseña"
            placeholderTextColor="#aaa"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry={showConfirmPassword}
          />
          <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.iconContainer}>
            <Icon name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <Text style={styles.error}>{error}</Text>
        <Text style={{ color: 'green', marginBottom: 15 }}>{success}</Text>

        <ButtonsAuth onPress={handleUpdate} style={styles.success}>Actualizar</ButtonsAuth>
        <ButtonsDelete onPress={handleDelete}>Eliminar</ButtonsDelete>
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
    textDecorationLine: 'underline',
  },
  link: {
    color: '#000',
  },
  error: {
    color: 'red',
    marginBottom: 15,
  },
  success: {
    color: 'green',
    marginBottom: 15,
  },
});
