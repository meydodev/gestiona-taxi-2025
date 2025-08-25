import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	Button,
	Platform,
	Alert,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	DateTimePickerAndroid,
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

const STORAGE_KEY = 'SAVED_ALARMS';

export default function AlarmScreen() {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [note, setNote] = useState('');
	const [savedAlarms, setSavedAlarms] = useState<any[]>([]);

	useEffect(() => {
		registerForNotifications();
		loadSavedAlarms();
	}, []);

	const registerForNotifications = async () => {
		if (Device.isDevice) {
			const { status: existingStatus } = await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;

			if (existingStatus !== 'granted') {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}

			if (finalStatus !== 'granted') {
				alert('Permisos de notificación denegados.');
			}
		}

		if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('alarm', {
				name: 'Alarmas',
				sound: 'default',
				importance: Notifications.AndroidImportance.HIGH,
			});
		}
	};

	const handleDateChange = (
		event: DateTimePickerEvent,
		selected?: Date
	) => {
		if (event.type === 'dismissed') return;
		if (selected) setSelectedDate(selected);
	};

	const showDatePicker = () => {
		if (Platform.OS === 'android') {
			DateTimePickerAndroid.open({
				value: selectedDate,
				mode: 'date',
				is24Hour: true,
				onChange: (event, date) => {
					if (event.type !== 'dismissed' && date) {
						DateTimePickerAndroid.open({
							value: date,
							mode: 'time',
							is24Hour: true,
							onChange: (e, time) => {
								if (e.type !== 'dismissed' && time) {
									const fullDate = new Date(date);
									fullDate.setHours(time.getHours());
									fullDate.setMinutes(time.getMinutes());
									setSelectedDate(fullDate);
								}
							},
						});
					}
				},
			});
		}
	};

	const scheduleAlarm = async () => {
		if (selectedDate <= new Date()) {
			Alert.alert('Fecha inválida', 'Selecciona una fecha futura');
			return;
		}

		const alarmId = await Notifications.scheduleNotificationAsync({
			content: {
				title: '⏰ Alarma',
				body: note || '¡Es hora!',
				sound: true,
				data: { note },
			},
			trigger: {
				date: selectedDate,
				channelId: 'alarm',
			},
		});

		const newAlarm = {
			id: alarmId,
			note,
			date: selectedDate.toISOString(),
		};

		const existing = await AsyncStorage.getItem(STORAGE_KEY);
		const alarms = existing ? JSON.parse(existing) : [];

		alarms.push(newAlarm);
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));

		Alert.alert('Alarma guardada', `Para el ${selectedDate.toLocaleString()}`);
		setNote('');
		loadSavedAlarms();
	};

	const loadSavedAlarms = async () => {
		try {
			const data = await AsyncStorage.getItem(STORAGE_KEY);
			if (data) {
				setSavedAlarms(JSON.parse(data));
			}
		} catch (err) {
			console.log('Error al cargar alarmas:', err);
		}
	};

	const deleteAlarm = async (id: string) => {
		const existing = await AsyncStorage.getItem(STORAGE_KEY);
		if (!existing) return;

		const alarms = JSON.parse(existing);
		const updated = alarms.filter((a: any) => a.id !== id);

		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
		await Notifications.cancelScheduledNotificationAsync(id);
		setSavedAlarms(updated);
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Programar Alarma</Text>

			<Button title="Seleccionar fecha y hora" onPress={showDatePicker} />
			<Text style={styles.dateText}>{selectedDate.toLocaleString()}</Text>

			<TextInput
				style={styles.input}
				placeholder="Escribe una nota para la alarma"
				value={note}
				onChangeText={setNote}
			/>

			<Button title="Guardar Alarma" onPress={scheduleAlarm} color="#27ae60" />

			<Text style={styles.subtitle}>Alarmas guardadas:</Text>
			{savedAlarms.length === 0 && (
				<Text style={{ color: '#666' }}>No hay alarmas programadas.</Text>
			)}

			{savedAlarms.map((alarm) => (
				<View key={alarm.id} style={styles.alarmCard}>
					<Text style={styles.alarmText}>
						🕒 {new Date(alarm.date).toLocaleString()}
					</Text>
					<Text style={styles.noteText}>📝 {alarm.note}</Text>
					<TouchableOpacity
						onPress={() => deleteAlarm(alarm.id)}
						style={styles.deleteBtn}
					>
						<Text style={{ color: '#fff' }}>Eliminar</Text>
					</TouchableOpacity>
				</View>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: '#f1f1f1',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	dateText: {
		fontSize: 18,
		color: '#333',
		marginVertical: 10,
		textAlign: 'center',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		borderRadius: 8,
		marginVertical: 20,
		backgroundColor: '#fff',
	},
	subtitle: {
		fontSize: 20,
		marginTop: 30,
		marginBottom: 10,
	},
	alarmCard: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 10,
		marginBottom: 10,
	},
	alarmText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	noteText: {
		fontSize: 14,
		color: '#555',
		marginTop: 4,
	},
	deleteBtn: {
		marginTop: 10,
		alignSelf: 'flex-start',
		backgroundColor: '#e74c3c',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 6,
	},
});
