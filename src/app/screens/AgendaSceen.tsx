import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';

type AgendaScreenProps = {
  route: RouteProp<RootStackParamList, 'AgendaScreen'>;
};

export default function AgendaScreen({ route }: AgendaScreenProps) {
  const { date } = route.params;
  const parsedDate = new Date(date);
  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString('es-ES', { month: 'long' });
  const dayOfWeek = parsedDate.toLocaleString('es-ES', { weekday: 'long' });

  // 📌 Obtener dimensiones de pantalla
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const lineSpacing = 40;
  const initialLines = Math.floor(screenHeight / lineSpacing);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [lines, setLines] = useState(Array.from({ length: initialLines }, (_, i) => i));

  const handleLinePress = (event: any, index: number) => {
    const touchX = event.nativeEvent.locationX;
    const halfScreen = screenWidth / 2;

    setSelectedPaymentType(touchX < halfScreen ? 'Efectivo' : 'Tarjeta');
    setModalVisible(true);

    if (index === lines.length - 1) {
      setLines([...lines, lines.length]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.dayText}>{day}</Text>
        <Text style={styles.monthText}>{month.charAt(0).toUpperCase() + month.slice(1)}</Text>
        <Text style={styles.dayOfWeek}>{dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}</Text>
      </View>

      <FlatList
        data={lines}
        keyExtractor={(item) => item.toString()}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.flatListContainer}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.lineRow} onPress={(event) => handleLinePress(event, index)}>
            <View style={styles.solidLine} />
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={styles.paymentRow}>
            <Text style={styles.paymentText}>Efectivo</Text>
            <Text style={styles.paymentText}>Tarjeta</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedPaymentType === 'Efectivo' ? 'Inserte importe en efectivo' : 'Introduzca importe en tarjeta'}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese el monto"
              value={amount}
              onChangeText={(text) => {
                const formattedText = text.replace(/\./g, ',').replace(/[^0-9,]/g, '');
                setAmount(formattedText);
              }}
            />

            <TouchableOpacity style={styles.buttonModal} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#eaeaea',
    padding: 15,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  dayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  dayOfWeek: {
    fontSize: 14,
    color: '#777',
  },
  flatListContainer: {
    flexGrow: 1, // 📌 Hace que el FlatList ocupe todo el espacio disponible
    justifyContent: 'space-between',
    paddingBottom: 20, // 🔹 Para evitar que los elementos queden pegados al final
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lineRow: {
    height: 40,
    justifyContent: 'center',
  },
  solidLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    borderStyle: 'solid',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
  buttonModal: {
    backgroundColor: 'orange',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
