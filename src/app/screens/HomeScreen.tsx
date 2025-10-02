import React from 'react';
import { ImageBackground, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import { NavigationProp } from '@react-navigation/native';
import useFocusAnimation from './useFocusAnimation';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogin = () => navigation.navigate('Login');
  const handleCalendar = () => navigation.navigate('Calendar');
  const handlePeriodicalSelect = () =>
    navigation.navigate('PeriodicalSelect', { startDate: '', endDate: '' });
  const handleMonthlySummary = () => navigation.navigate('MonthlySummary');

  // Animaciones de focus
  const focusStyle1 = useFocusAnimation();
  const focusStyle2 = useFocusAnimation();

  return (
    <ImageBackground
      source={require('../../../assets/img/agenda.webp')}
      style={styles.imageBackground}
    >
      <View style={styles.container}>

        {/* Fila 1 */}
        <Animated.View entering={FadeInUp.duration(1500)}>
          <Animated.View style={[styles.row, focusStyle1]}>
            <TouchableOpacity style={styles.button} onPress={handleCalendar}>
              <Icon name="book" size={40} color="#fff" />
              <Text style={styles.buttonText}>Agenda</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handlePeriodicalSelect}>
              <Icon name="percent" size={40} color="#fff" />
              <Text style={styles.buttonText}>Calculo de comisiones</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Fila 2 */}
        <Animated.View entering={FadeInDown.duration(1500)}>
          <Animated.View style={[styles.row, focusStyle2]}>
            <TouchableOpacity style={styles.button} onPress={handleMonthlySummary}>
              <Icon name="calendar" size={40} color="#fff" />
              <Text style={styles.buttonText}>Resúmenes Mensuales</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Icon name="sign-out" size={40} color="#fff" />
              <Text style={styles.buttonText}>Salir</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

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
    width: 160,
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
    marginTop: 8,
  },
});
