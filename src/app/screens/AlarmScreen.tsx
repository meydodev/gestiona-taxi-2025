import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Button,
  Platform,
  ImageBackground,
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Alarm = {
  id: number;
  time: number;
  timeString: string;
  label: string;
  days: number[];
};

const STORAGE_KEY = 'MY_ALARMS_DATA';

export default function AlarmScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);

  const [date, setDate] = useState<Date>(new Date());
  const [label, setLabel] = useState<string>('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Cargar alarmas guardadas
  useEffect(() => {
    loadAlarms();
  }, []);

  useEffect(() => {
    saveAlarms(alarms);
  }, [alarms]);

  const loadAlarms = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue) {
        setAlarms(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.log('Error cargando alarmas:', error);
    }
  };

  const saveAlarms = async (currentAlarms: Alarm[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentAlarms));
    } catch (error) {
      console.log('Error guardando alarmas:', error);
    }
  };

  const openModalToAdd = () => {
    setSelectedAlarm(null);
    setDate(new Date());
    setLabel('');
    setModalVisible(true);
    setShowDatePicker(true); // Mostrar el selector de fecha primero
  };

  const openModalToEdit = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    setDate(new Date(alarm.time));
    setLabel(alarm.label);
    setModalVisible(true);
    setShowDatePicker(true); // Primero seleccionar la fecha
  };

  const closeModal = () => {
    setModalVisible(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleSave = () => {
    if (!date) {
      Alert.alert('Faltan Datos', 'Debes seleccionar una fecha y una hora.');
      return;
    }

    const timeString = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const alarmData: Alarm = {
      id: selectedAlarm ? selectedAlarm.id : Math.floor(Math.random() * 100000),
      time: date.getTime(),
      timeString,
      label,
      days: [],
    };

    if (selectedAlarm) {
      setAlarms((prev) =>
        prev.map((alarm) => (alarm.id === selectedAlarm.id ? alarmData : alarm))
      );
    } else {
      setAlarms((prev) => [...prev, alarmData]);
    }

    Alert.alert('Alarma Guardada', 'Tu alarma ha sido guardada correctamente.');
    closeModal();
  };

  // Manejo del cambio en la fecha y hora
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setShowTimePicker(true); // Abrir el selector de hora después de la fecha
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedDate = new Date(date);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setDate(updatedDate);
    }
  };

  return (
    <ImageBackground source={require('../../../assets/img/agenda.webp')} style={styles.imageBackground}>
      <View style={styles.container}>
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.alarmItem}>
              <TouchableOpacity onPress={() => openModalToEdit(item)} style={styles.alarmInfo}>
                <Text style={styles.time}>{item.timeString}</Text>
                <Text style={styles.alarmLabel}>{item.label}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAlarms(alarms.filter((alarm) => alarm.id !== item.id))}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
          ListHeaderComponent={
            <>
              <Text style={styles.title}>Mis Alarmas</Text>
              <Button title="Añadir Alarma" onPress={openModalToAdd} />
            </>
          }
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay alarmas agregadas.</Text>}
        />

        {/* Modal para agregar/editar alarmas */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{selectedAlarm ? 'Editar Alarma' : 'Nueva Alarma'}</Text>

              <Text style={styles.label}>Seleccionar Fecha y Hora</Text>

              {/* Selector de fecha */}
              {showDatePicker && (
                <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} locale='es-ES' />
              )}

              {/* Selector de hora */}
              {showTimePicker && (
                <DateTimePicker value={date} mode="time" display="default" onChange={handleTimeChange} />
              )}

              <Text style={styles.label}>Etiqueta de la Alarma</Text>
              <TextInput style={styles.input} value={label} onChangeText={setLabel} placeholder="Ej: Cita médica" />

              <View style={styles.buttonsContainer}>
                <Button title="Cancelar" onPress={closeModal} />
                <Button title="Guardar" onPress={handleSave} />
              </View>
            </View>
          </View>
        </Modal>
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
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  alarmInfo: {
    flex: 1,
    paddingRight: 10,
  },
  time: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  alarmLabel: {
    fontSize: 14,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  label: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
