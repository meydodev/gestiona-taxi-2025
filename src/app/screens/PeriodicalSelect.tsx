import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions, StatusBar, Platform, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

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

export default function PeriodicalSelectScreen() {
  const screenWidth = Dimensions.get('window').width;

  // 🔹 Estado para almacenar fechas
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // 🔹 Función para manejar la selección de fechas con validación
  const handleDateSelection = (date: string, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
      if (endDate && date > endDate) {
        setEndDate(null); // 🔹 Resetear fecha de fin si es menor a la de inicio
      }
    } else {
      if (startDate && date < startDate) {
        Alert.alert("Fecha inválida", "La fecha de fin no puede ser menor a la fecha de inicio.");
        return; // 🔹 No guardar la fecha inválida
      }
      setEndDate(date);
    }
  };

  // 🔹 Función para validar antes de continuar
  const handleConfirmSelection = () => {
    if (!startDate) {
      Alert.alert("Falta la fecha de inicio", "Por favor selecciona una fecha de inicio.");
      return;
    }
    if (!endDate) {
      Alert.alert("Falta la fecha de fin", "Por favor selecciona una fecha de fin.");
      return;
    }

    //console.log(`Fecha de inicio: ${startDate}, Fecha de fin: ${endDate}`);
    Alert.alert("Fechas seleccionadas", `Inicio: ${startDate}\nFin: ${endDate}`);
  };

  return (
    <ImageBackground source={require('../../../assets/img/agenda.png')} style={styles.imageBackground}>
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
                ...(startDate ? { [startDate]: { selected: true, selectedColor: '#2563eb' } } : {}),
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
                ...(endDate ? { [endDate]: { selected: true, selectedColor: '#ff5733' } } : {}),
              }}
              theme={calendarTheme}
            />
          </View>

          {/* 🔹 Botón para confirmar selección */}
          <TouchableOpacity style={styles.button} onPress={handleConfirmSelection}>
            <Text style={styles.buttonText}>Seleccionar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// 🔹 Estilos del calendario
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
    paddingBottom: 50, // 🔹 Espacio para evitar que el botón se oculte
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
    borderRadius:10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2563eb',
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
