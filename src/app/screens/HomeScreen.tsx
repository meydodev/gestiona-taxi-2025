import React from 'react';
import { ImageBackground, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';

export default function HomeScreen() {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleLogin = () => {
        navigation.navigate('Login');
      };

    const handleCalendar = () => {
        navigation.navigate('Calendar');
      };

  return (
    <ImageBackground source={require('../../../assets/img/agenda.png')} style={styles.imageBackground}>
      <View style={styles.container}>
        
        {/* Fila 1 */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={handleCalendar}>
            <Icon name="calendar" size={40} color="#fff" />
            <Text style={styles.buttonText}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Icon name="file-text" size={40} color="#fff" />
            <Text style={styles.buttonText}>Resúmenes Semanales</Text>
          </TouchableOpacity>
        </View>

        {/* Fila 2 */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button}>
            <Icon name="bar-chart" size={40} color="#fff" />
            <Text style={styles.buttonText}>Resúmenes Mensuales</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Icon name="sign-out" size={40} color="#fff" />
            <Text style={styles.buttonText}>Salir</Text>
          </TouchableOpacity>
        </View>

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15, 
  },
  button: {
    width: 160, // Aumentado para mejor apariencia
    height: 160, 
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8, // Espacio entre icono y texto
  },
});
