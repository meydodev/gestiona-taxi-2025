import React from 'react';
import { View, Text, TextInput, TouchableOpacity,StyleSheet, ImageBackground } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types'
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import RegisterHook from '../hooks/RegisterHook';
import ButtonsAuth from '../components/ buttonsAuth';

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
      <ImageBackground source={require('../../../assets/img/agenda.png')} style={styles.imageBackground}>
        <KeyboardAwareScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            <Text style={styles.textTitle}>Registro</Text>
      
            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="users" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Apellidos"
                value={surNames}
                onChangeText={setSurNames}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="envelope" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={showPassword}
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Icon name={showPassword ? "eye-slash" : "eye"} size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={showConfirmPassword}
              />
              <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                <Icon name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <Text style={styles.error}>{error}</Text>
            <ButtonsAuth onPress={handleRegister} style={{ marginTop: 30,padding: 10 }}>Registrarse</ButtonsAuth>
            <Text style={styles.textLogin}>
              ¿Ya tienes una cuenta?{' '}
              <Text style={styles.link} onPress={handleLogin}>
                Inicia sesión
              </Text>
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </ImageBackground>
      );
}

const styles = StyleSheet.create({
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '90%',
    },
    error:{
      color: 'red',
      marginBottom: 15,
    },
    formContainer: {
      width: '100%',
      backgroundColor: '#FFFFFF', // Fondo blanco del formulario
      borderRadius: 20, // Bordes redondeados
      padding: 20, // Espaciado interno
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
      alignItems: 'center',
    },
    textTitle: {
      textAlign: 'center',
      fontSize: 35,
      marginBottom: 20,
      color: 'orange',
      fontWeight: 'bold',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 50,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 10,
      backgroundColor: '#FFF',
    },
    icon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
    },
    textLogin: {
      color: '#000',
      marginTop: 20,
      fontSize: 12,
      textAlign: 'center',
    },
    link: {
      color: '#000',
      textDecorationLine: 'underline',
    },
    imageBackground: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });