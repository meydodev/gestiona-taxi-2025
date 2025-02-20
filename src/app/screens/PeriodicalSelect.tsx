import React, { useState } from 'react';
import { 
  ScrollView, View, Text, StyleSheet, Dimensions, 
  ImageBackground, TouchableOpacity, Alert 
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { RouteProp, NavigationProp } from '@react-navigation/native';
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

// 🔹 Tipado de las props para PeriodicalSelectScreen
type PeriodicalSelectScreenProps = {
  route: RouteProp<RootStackParamList, 'PeriodicalSelect'>;
};

export default function PeriodicalSelectScreen({ route }: PeriodicalSelectScreenProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;

  // ✅ Evitar errores con `route.params`
  const { startDate = null, endDate = null } = route.params || {};
  const [startDateState, setStartDate] = useState<string | null>(startDate);
  const [endDateState, setEndDate] = useState<string | null>(endDate);

  // 🔹 Función para manejar la selección de fechas con validación
  const handleDateSelection = (date: string, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
      if (endDateState && date > endDateState) {
        setEndDate(null); // Resetear fecha de fin si la de inicio es mayor
      }
    } else {
      if (startDateState && date < startDateState) {
        Alert.alert("Fecha inválida", "La fecha de fin no puede ser menor a la fecha de inicio.");
        return;
      }
      setEndDate(date);
    }
  };

  // 🔹 Función para validar y navegar a `ResumePeriodicalScreen`
  const handleConfirmSelection = () => {
    if (!startDateState) {
      Alert.alert("Falta la fecha de inicio", "Por favor selecciona una fecha de inicio.");
      return;
    }
    if (!endDateState) {
      Alert.alert("Falta la fecha de fin", "Por favor selecciona una fecha de fin.");
      return;
    }

    navigation.navigate('ResumePeriodicalScreen', { startDate: startDateState, endDate: endDateState });
  };

  return (
    <ImageBackground source={require('../../../assets/img/agenda.webp')} style={styles.imageBackground}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Selecciona las fechas</Text>

          {/* Calendario de Fecha de Inicio */}
          <Text style={styles.subtitle}>Fecha de Inicio</Text>
          <View style={styles.calendarContainer}>
            <Calendar
              firstDay={1}
              style={[styles.calendarContainer, { width: screenWidth * 0.9 }]}
              onDayPress={(day:any) => handleDateSelection(day.dateString, 'start')}
              markedDates={{
                ...(startDateState ? { [startDateState]: { selected: true, selectedColor: '#2563eb' } } : {}),
              }}
              theme={calendarTheme}
            />
          </View>

          {/* Calendario de Fecha de Fin */}
          <Text style={styles.subtitle}>Fecha de Fin</Text>
          <View style={styles.calendarContainer}>
            <Calendar
              firstDay={1}
              style={[styles.calendarContainer, { width: screenWidth * 0.9 }]}
              onDayPress={(day:any) => handleDateSelection(day.dateString, 'end')}
              markedDates={{
                ...(endDateState ? { [endDateState]: { selected: true, selectedColor: '#ff5733' } } : {}),
              }}
              theme={calendarTheme}
            />
          </View>

          {/* Botón para confirmar */}
          <TouchableOpacity style={styles.button} onPress={handleConfirmSelection}>
            <Text style={styles.buttonText}>Seleccionar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// 🔹 Configuración del tema del Calendario
const calendarTheme = {
  calendarBackground: '#1E1E1E',
  textSectionTitleColor: '#ffffff',
  selectedDayBackgroundColor: '#2563eb',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#ff5733',
  dayTextColor: '#ffffff',
  arrowColor: '#ffffff',
  monthTextColor: '#ffffff',
  textDisabledColor: '#888888',
};

// 🔹 Estilos generales
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'orange',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  calendarContainer: {
    marginBottom: 10,
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: 'orange',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
});

