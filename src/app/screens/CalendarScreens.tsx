import React from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Platform, ImageBackground } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';

// 🔹 Configurar el idioma del calendario en español
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
    'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul',
    'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width; // 🔹 Obtener ancho de pantalla

  // 🔹 Cuando se selecciona un día, se navega directamente a la Agenda
  const handleDayPress = (day: any) => {
    navigation.navigate('AgendaScreen', { date: day.dateString });
  };

  return (
    <ImageBackground source={require('../../../assets/img/agenda.png')} style={styles.imageBackground}>
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona una fecha</Text>
      <Calendar
        onDayPress={handleDayPress} // 🔹 Al pulsar un día, va directo a la Agenda
        firstDay={1} // 🔹 La semana empieza en lunes
        style={[styles.calendar, { width: screenWidth * 0.95 }]} // 🔹 Ajuste dinámico al ancho
        theme={{
          calendarBackground: '#1E1E1E', // Fondo oscuro
          textSectionTitleColor: '#ffffff', // Nombres de los días en blanco
          selectedDayBackgroundColor: '#2563eb', // Día seleccionado en azul
          selectedDayTextColor: '#ffffff', // Texto en blanco
          todayTextColor: '#ff5733', // Día actual en rojo anaranjado
          dayTextColor: '#ffffff', // Texto de los días en blanco
          arrowColor: '#ffffff', // Flechas en blanco
          monthTextColor: '#ffffff', // Nombre del mes en blanco
          textDisabledColor: '#888888', // Días fuera del mes en gris
        }}
      />
    </View>
    </ImageBackground>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 20 : 60,
     // 🔹 Fondo oscuro
    alignItems: 'center',
    justifyContent: 'flex-start', // 🔹 Asegura que el contenido empiece desde arriba
  },
  title: {
    fontSize: 24, // 🔹 Título más grande
    fontWeight: 'bold',
    color: 'orange',
    marginBottom: 20, // 🔹 Espacio entre título y calendario
  },
  calendar: {
    borderRadius: 10, // 🔹 Bordes redondeados
    elevation: 5, // 🔹 Sombra para efecto 3D
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
