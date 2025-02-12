import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { DatabaseConnection } from '../database/database-connection';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';

// Si usas Expo, cambia esta línea a:
// import { Ionicons } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';

type AgendaScreenProps = {
  route: RouteProp<RootStackParamList, 'AgendaScreen'>;
};

export default function AgendaScreen({ route }: AgendaScreenProps) {
  const { date } = route.params;

  // Obtenemos día, mes y día de la semana
  const parsedDate = new Date(date);
  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString('es-ES', { month: 'long' });
  const dayOfWeek = parsedDate.toLocaleString('es-ES', { weekday: 'long' });

  const screenWidth = Dimensions.get('window').width;

  const [db, setDb] = useState<any>(null);
  const [payments, setPayments] = useState<{ id: number; type: string; amount: number }[]>([]);

  // Control del Modal (crear/editar)
  const [modalVisible, setModalVisible] = useState(false);

  // Para distinguir si estamos creando o editando un pago
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Control del pago actual
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await DatabaseConnection.getConnection();
        setDb(database);

        // Crear la tabla si no existe
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            type TEXT,
            amount REAL
          );
        `);

        loadPayments(database);
      } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
      }
    };

    initDb();
  }, []);

  // Carga todos los pagos correspondientes a la fecha
  const loadPayments = async (database: any) => {
    try {
      const results = await database.getAllAsync(
        'SELECT * FROM payments WHERE date = ?',
        [date]
      );
      setPayments(results);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    }
  };

  // Guardar o editar un pago
  const handleSavePayment = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;

    try {
      if (isEditing && editId) {
        // EDITAR pago existente
        await db.runAsync('UPDATE payments SET amount = ? WHERE id = ?', [
          parseFloat(amount),
          editId,
        ]);
      } else {
        // CREAR nuevo pago
        await db.runAsync(
          'INSERT INTO payments (date, type, amount) VALUES (?, ?, ?)',
          [date, selectedPaymentType, parseFloat(amount)]
        );
      }

      // Recargar los pagos
      loadPayments(db);

      // Cerrar modal y resetear estados
      setModalVisible(false);
      setAmount('');
      setIsEditing(false);
      setEditId(null);
      setSelectedPaymentType(null);
    } catch (error) {
      console.error('Error al guardar/editar el pago:', error);
    }
  };

  // Eliminar pago
  const handleDeletePayment = async (paymentId: number) => {
    try {
      await db.runAsync('DELETE FROM payments WHERE id = ?', [paymentId]);
      loadPayments(db);
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
    }
  };

  // Determina si tocamos la izquierda (Efectivo) o derecha (Tarjeta) para un nuevo pago
  const handleScreenPress = (event: any) => {
    const touchX = event.nativeEvent.locationX;
    const halfScreen = screenWidth / 2;

    // Izquierda => Efectivo, Derecha => Tarjeta
    setSelectedPaymentType(touchX < halfScreen ? 'Efectivo' : 'Tarjeta');

    // Configuramos para CREAR un nuevo pago
    setIsEditing(false);
    setEditId(null);
    setAmount('');
    setModalVisible(true);
  };

  // Abre el modal para editar un pago existente
  const handleEditPayment = (paymentId: number, currentAmount: number, currentType: string) => {
    setIsEditing(true);
    setEditId(paymentId);
    setSelectedPaymentType(currentType);
    setAmount(String(currentAmount));
    setModalVisible(true);
  };

  // Calculamos el total de TODOS los pagos (efectivo + tarjeta)
  const totalAll = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Encabezado con la fecha */}
      <View style={styles.header}>
        <Text style={styles.dayText}>{day}</Text>
        <Text style={styles.monthText}>
          {month.charAt(0).toUpperCase() + month.slice(1)}
        </Text>
        <Text style={styles.dayOfWeek}>
          {dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}
        </Text>
      </View>

      {/* Scroll para permitir que las columnas crezcan verticalmente */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dos columnas: Efectivo (izquierda) y Tarjeta (derecha) */}
        <View style={styles.columnsRow}>
          {/* Columna Efectivo */}
          <View style={[styles.column, { marginRight: 20 }]}>
            <Text style={[styles.paymentText, styles.titleText]}>
              Efectivo:{' '}
              {payments
                .filter((p) => p.type === 'Efectivo')
                .reduce((acc, cur) => acc + cur.amount, 0)}
              €
            </Text>
            {payments
              .filter((p) => p.type === 'Efectivo')
              .map((p) => (
                <View key={p.id} style={styles.paymentRow}>
                  <Text style={styles.paymentText}>{p.amount}€</Text>

                  {/* Íconos al lado del importe */}
                  <TouchableOpacity
                    onPress={() => handleEditPayment(p.id, p.amount, p.type)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="pencil" size={20} color="orange" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeletePayment(p.id)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          {/* Columna Tarjeta */}
          <View style={[styles.column, { alignItems: 'flex-end' }]}>
            <Text style={[styles.paymentText, styles.titleText]}>
              Tarjeta:{' '}
              {payments
                .filter((p) => p.type === 'Tarjeta')
                .reduce((acc, cur) => acc + cur.amount, 0)}
              €
            </Text>
            {payments
              .filter((p) => p.type === 'Tarjeta')
              .map((p) => (
                <View
                  key={p.id}
                  style={[
                    styles.paymentRow,
                    { justifyContent: 'flex-end', alignItems: 'center' },
                  ]}
                >
                  {/* Ícono para editar */}
                  <TouchableOpacity
                    onPress={() => handleEditPayment(p.id, p.amount, p.type)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="pencil" size={20} color="orange" />
                  </TouchableOpacity>

                  {/* Ícono para borrar */}
                  <TouchableOpacity
                    onPress={() => handleDeletePayment(p.id)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="trash" size={20} color="red" />
                  </TouchableOpacity>

                  {/* Importe al final */}
                  <Text style={[styles.paymentText, { marginLeft: 10 }]}>{p.amount}€</Text>
                </View>
              ))}
          </View>
        </View>

        {/* 
          Aquí añadimos el texto "Total: ..." EN MEDIO (centrado),
          justo antes del área que dice "Toca la izquierda..." 
        */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: {totalAll.toFixed(2)}€</Text>
        </View>

        {/* Zona al final para tocar y agregar nuevo pago */}
        <TouchableOpacity style={styles.flexibleArea} onPress={handleScreenPress}>
          <Text style={styles.instructionText}>
            Toca la izquierda para Efectivo y la derecha para Tarjeta
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para crear/editar pago */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing
                ? `Editar importe (${selectedPaymentType})`
                : selectedPaymentType === 'Efectivo'
                  ? 'Inserte importe en efectivo'
                  : 'Inserte importe en tarjeta'}
            </Text>
            <TextInput
              autoFocus
              style={styles.input}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              placeholder="Ingrese el monto"
              value={amount}
              onChangeText={(text) => {
                // En caso de que el usuario introduzca ',' en lugar de '.'
                // Lo normalizamos a un punto (.) para manejarlo internamente
                let formattedText = text.replace(',', '.');
                // Quitamos cualquier carácter que no sea dígito o punto
                formattedText = formattedText.replace(/[^0-9.]/g, '');
                setAmount(formattedText);
              }}
            />

            <TouchableOpacity style={styles.buttonModal} onPress={handleSavePayment}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonModal, { backgroundColor: 'red' }]}
              onPress={() => {
                setModalVisible(false);
                setIsEditing(false);
                setEditId(null);
                setAmount('');
                setSelectedPaymentType(null);
              }}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
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

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Fila que contiene las dos columnas
  columnsRow: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },

  // Estilos para títulos e importes
  paymentText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#333',
  },
  titleText: {
    marginBottom: 10,
    textDecorationLine: 'underline',
  },

  // Fila para cada importe e íconos
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconButton: {
    marginHorizontal: 5,
  },

  // Contenedor para el total
  totalContainer: {
    alignItems: 'center',
    marginVertical: 20, // algo de espacio
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  flexibleArea: {
    marginTop: 10,
    padding: 20,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    borderRadius: 10,
  },
  instructionText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
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
