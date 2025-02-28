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
  Alert, // <-- Importamos Alert de React Native
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Alarm = {
  id: number;
  time: number;        // Fecha en milisegundos (Date.getTime())
  timeString: string;  // Hora en texto (ej: "07:30")
  label: string;
  days: number[];      // Días seleccionados (2=Lun,3=Mar,etc.)
};

// Días de la semana (Expo usa 1=Dom, 2=Lun, etc.)
const WEEK_DAYS = [
  { label: 'L', value: 2 }, // Lunes
  { label: 'M', value: 3 }, // Martes
  { label: 'X', value: 4 }, // Miércoles
  { label: 'J', value: 5 }, // Jueves
  { label: 'V', value: 6 }, // Viernes
  { label: 'S', value: 7 }, // Sábado
  { label: 'D', value: 1 }, // Domingo
];

const STORAGE_KEY = 'MY_ALARMS_DATA';

export default function AlarmScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Para el modal
  const [date, setDate] = useState<Date>(new Date());
  const [label, setLabel] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [showPicker, setShowPicker] = useState(false);

  // Generador simple de IDs
  const generateId = (): number => Math.floor(Math.random() * 100000);

  // Pedir permisos de notificaciones una sola vez
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de notificación no otorgado');
      }
    })();

    // Al montar el componente, cargamos las alarmas guardadas
    loadAlarms();
  }, []);

  // Cada vez que cambien las alarmas, guardamos en AsyncStorage
  useEffect(() => {
    saveAlarms(alarms);
  }, [alarms]);

  // Cargar alarmas de AsyncStorage
  const loadAlarms = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue) {
        const loadedAlarms: Alarm[] = JSON.parse(jsonValue);
        setAlarms(loadedAlarms);
      }
    } catch (error) {
      console.log('Error cargando alarmas:', error);
    }
  };

  // Guardar alarmas en AsyncStorage
  const saveAlarms = async (currentAlarms: Alarm[]) => {
    try {
      const jsonValue = JSON.stringify(currentAlarms);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.log('Error guardando alarmas:', error);
    }
  };

  // CRUD
  const handleAddAlarm = (newAlarm: Alarm) => {
    setAlarms((prev) => [...prev, newAlarm]);
    closeModal();
  };

  const handleEditAlarm = (updatedAlarm: Alarm) => {
    setAlarms((prev) =>
      prev.map((alarm) => (alarm.id === updatedAlarm.id ? updatedAlarm : alarm))
    );
    closeModal();
  };

  const handleDeleteAlarm = (alarmId: number) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId));
  };

  // Abrir/cerrar modal
  const openModalToAdd = () => {
    setSelectedAlarm(null);
    setDate(new Date());
    setLabel('');
    setSelectedDays([]);
    setModalVisible(true);
  };

  const openModalToEdit = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    setDate(new Date(alarm.time));
    setLabel(alarm.label);
    setSelectedDays(alarm.days || []);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setShowPicker(false);
  };

  // Manejador DateTimePicker
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Toggle días
  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays((prev) => prev.filter((d) => d !== dayValue));
    } else {
      setSelectedDays((prev) => [...prev, dayValue]);
    }
  };

  // Programar notificaciones
  const scheduleCalendarNotification = async (
    alarmDate: Date,
    alarmLabel: string,
    selectedDays?: number[]
  ) => {
    if (!selectedDays || selectedDays.length === 0) {
      // Notificación puntual
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Alarma',
          body: alarmLabel || '¡Es la hora!',
          sound: 'default',
        },
        trigger: {
          type: 'calendar',
          repeats: false,
          dateComponents: {
            year: alarmDate.getFullYear(),
            month: alarmDate.getMonth() + 1,
            day: alarmDate.getDate(),
            hour: alarmDate.getHours(),
            minute: alarmDate.getMinutes(),
            second: alarmDate.getSeconds(),
          },
        } as Notifications.NotificationTriggerInput,
      });
    } else {
      // Varios días de la semana (repetición semanal)
      for (const dayOfWeek of selectedDays) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Alarma',
            body: alarmLabel || '¡Es la hora!',
            sound: 'default',
          },
          trigger: {
            type: 'calendar',
            repeats: true,
            dateComponents: {
              weekday: dayOfWeek,
              hour: alarmDate.getHours(),
              minute: alarmDate.getMinutes(),
            },
          } as Notifications.NotificationTriggerInput,
        });
      }
    }
  };

  // ===========================
  //         handleSave
  // ===========================
  const handleSave = async () => {
    // 1. Validar que haya al menos un día seleccionado
    if (selectedDays.length === 0) {
      Alert.alert('Faltan Datos', 'Debes seleccionar al menos un día.');
      return;
    }

    // 2. Validar que se haya seleccionado una hora válida
    //    Podemos asegurarnos de que la fecha no sea 'null' (ya que por defecto le pusimos new Date())
    //    Si quieres validar una hora específica (ej. que no sea la hora actual), habría que comparar la fecha con algo.
    if (!date) {
      Alert.alert('Faltan Datos', 'Debes seleccionar una hora.');
      return;
    }

    const timeString = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const alarmData: Alarm = {
      id: selectedAlarm ? selectedAlarm.id : generateId(),
      time: date.getTime(),
      timeString,
      label,
      days: selectedDays,
    };

    // Crear o Editar
    if (selectedAlarm) {
      handleEditAlarm(alarmData);
    } else {
      handleAddAlarm(alarmData);
    }

    // Programar notificaciones
    if (selectedDays.length > 0) {
      await scheduleCalendarNotification(date, label, selectedDays);
    } else {
      // Si no hubiera días, notificación puntual
      await scheduleCalendarNotification(date, label);
    }
    alert('Alarma guardada correctamente');
    closeModal();
  };

  // Render de cada alarma
  const renderAlarmItem = ({ item }: { item: Alarm }) => (
    <View style={styles.alarmItem}>
      <TouchableOpacity onPress={() => openModalToEdit(item)} style={styles.alarmInfo}>
        <Text style={styles.time}>{item.timeString}</Text>
        <Text style={styles.alarmLabel}>{item.label}</Text>
        {item.days.length > 0 && (
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            {item.days.map((d) => {
              const dayObj = WEEK_DAYS.find((wd) => wd.value === d);
              return (
                <View key={d} style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{dayObj?.label}</Text>
                </View>
              );
            })}
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteAlarm(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  // Render principal
  return (
    <ImageBackground
      source={require('../../../assets/img/agenda.webp')}
      style={styles.imageBackground}
    >
      <View style={styles.container}>
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAlarmItem}
          style={{ width: '100%', marginTop: 20 }}
          ListHeaderComponent={(
            <>
              <Text style={styles.title}>Mis Alarmas</Text>
              <Button title="Añadir Alarma" onPress={openModalToAdd} />
            </>
          )}
          ListEmptyComponent={(
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No hay alarmas agregadas.
            </Text>
          )}
        />

        {/* Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {selectedAlarm ? 'Editar Alarma' : 'Nueva Alarma'}
              </Text>

              {/* Si es iOS, DateTimePicker de 'spinner' */}
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="spinner"
                  onChange={onChange}
                  style={styles.timePicker}
                />
              ) : (
                <>
                  <Button title="Seleccionar Hora" onPress={() => setShowPicker(true)} />
                  {showPicker && (
                    <DateTimePicker
                      value={date}
                      mode="time"
                      display="default"
                      onChange={onChange}
                    />
                  )}
                </>
              )}

              <Text style={styles.label}>Días de la Semana</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 }}>
                {WEEK_DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day.value);
                  return (
                    <TouchableOpacity
                      key={day.value}
                      onPress={() => toggleDay(day.value)}
                      style={[
                        styles.dayButton,
                        isSelected && styles.dayButtonSelected
                      ]}
                    >
                      <Text style={isSelected ? styles.dayTextSelected : styles.dayText}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Etiqueta de la Alarma</Text>
              <TextInput
                style={styles.input}
                value={label}
                onChangeText={setLabel}
                placeholder="Ej: Encargo"
              />

              <View style={styles.buttonsContainer}>
                <Button title="Cerrar" onPress={closeModal} />
                <Button title="Guardar" onPress={handleSave} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

// Estilos
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
    marginBottom: 10,
    padding: 10,
    marginTop: 10,
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
  dayBadge: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    marginRight: 5,
  },
  dayBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  deleteButton: {
    marginLeft: 10,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  timePicker: {
    width: '100%',
    marginTop: 10,
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
  // Selección de días
  dayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  dayText: {
    color: '#333',
    fontSize: 14,
  },
  dayTextSelected: {
    color: '#fff',
    fontSize: 14,
  },
});
