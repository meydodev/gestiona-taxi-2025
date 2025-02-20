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

  // 1) ESTADO PARA PAGOS (lo que ya tenías)
  const [db, setDb] = useState<any>(null);
  const [payments, setPayments] = useState<{ id: number; type: string; amount: number }[]>([]);

  // Control del Modal (crear/editar) para PAGOS
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Control del pago actual
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  // --- GASTOS ---
  // 2) ESTADO PARA GASTOS
  const [dailyExpenses, setDailyExpenses] = useState<{
    id: number;
    date: string;
    concept: string;
    amount: number
  }[]>([]);

  // Modal para GASTOS
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<number | null>(null);

  // Campos para el gasto (concepto y monto)
  const [concept, setConcept] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Iniciar BD y cargar datos
  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await DatabaseConnection.getConnection();
        setDb(database);

        // Crear la tabla de PAGOS si no existe
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            type TEXT,
            amount REAL
          );
        `);

        // --- GASTOS ---
        // 3) Crear la tabla de GASTOS si no existe
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            concept TEXT,
            amount REAL
          );
        `);

        // Cargar pagos y gastos
        loadPayments(database);
        loadExpenses(database);
      } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
      }
    };

    initDb();
  }, []);

  // Carga PAGOS
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

  // --- GASTOS ---
  // 4) Carga GASTOS
  const loadExpenses = async (database: any) => {
    try {
      const results = await database.getAllAsync(
        'SELECT * FROM expenses WHERE date = ?',
        [date]
      );
      setDailyExpenses(results);
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    }
  };

  // Guardar/editar un PAGO
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

      loadPayments(db);

      // Reset
      setModalVisible(false);
      setAmount('');
      setIsEditing(false);
      setEditId(null);
      setSelectedPaymentType(null);
    } catch (error) {
      console.error('Error al guardar/editar el pago:', error);
    }
  };

  // --- GASTOS ---
  // 5) Guardar/editar un GASTO
  const handleSaveExpense = async () => {
    if (!expenseAmount || isNaN(parseFloat(expenseAmount))) return;

    try {
      if (isEditingExpense && editExpenseId) {
        // EDITAR gasto existente
        await db.runAsync(
          'UPDATE expenses SET concept = ?, amount = ? WHERE id = ?',
          [concept, parseFloat(expenseAmount), editExpenseId]
        );
      } else {
        // CREAR nuevo gasto
        await db.runAsync(
          'INSERT INTO expenses (date, concept, amount) VALUES (?, ?, ?)',
          [date, concept, parseFloat(expenseAmount)]
        );
      }

      // Recargamos los gastos
      loadExpenses(db);

      // Reset
      setExpenseModalVisible(false);
      setConcept('');
      setExpenseAmount('');
      setIsEditingExpense(false);
      setEditExpenseId(null);
    } catch (error) {
      console.error('Error al guardar/editar el gasto:', error);
    }
  };

  // Eliminar PAGO
  const handleDeletePayment = async (paymentId: number) => {
    try {
      await db.runAsync('DELETE FROM payments WHERE id = ?', [paymentId]);
      loadPayments(db);
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
    }
  };

  // --- GASTOS ---
  // 6) Eliminar GASTO
  const handleDeleteExpense = async (expenseId: number) => {
    try {
      await db.runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
      loadExpenses(db);
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
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

  // --- GASTOS ---
  // 7) Abrir modal para NUEVO GASTO
  const handleAddExpense = () => {
    setIsEditingExpense(false);
    setEditExpenseId(null);
    setConcept('');
    setExpenseAmount('');
    setExpenseModalVisible(true);
  };

  // 8) Editar gasto existente
  const handleEditExpense = (expenseId: number, curConcept: string, curAmount: number) => {
    setIsEditingExpense(true);
    setEditExpenseId(expenseId);
    setConcept(curConcept);
    setExpenseAmount(String(curAmount));
    setExpenseModalVisible(true);
  };

  // Calculamos el total de TODOS los PAGOS (efectivo + tarjeta)
  const totalAll = payments.reduce((acc, p) => acc + p.amount, 0);

  // --- GASTOS ---
  // 9) Total de gastos
  const totalExpenses = dailyExpenses.reduce((acc, g) => acc + g.amount, 0);

  // <-- NUEVO: Diferencia Pagos - Gastos
  const difference = totalAll - totalExpenses;

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

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- PAGOS --- */}
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
              Tarjeta/otros:{' '}
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

                  <Text style={[styles.paymentText, { marginLeft: 10 }]}>{p.amount}€</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Total de PAGOS */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total ingresos: {totalAll.toFixed(2)}€</Text>
        </View>

        {/* --- GASTOS --- */}
        <View style={styles.expensesContainer}>
          <Text style={[styles.paymentText, styles.titleText]}>
            Gastos del día: {totalExpenses.toFixed(2)}€
          </Text>

          {dailyExpenses.map((g) => (
            <View key={g.id} style={styles.expenseRow}>
              {/* Muestra el concepto y el importe */}
              <Text style={styles.paymentText}>
                {g.concept} - {g.amount}€
              </Text>

              <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                <TouchableOpacity
                  onPress={() => handleEditExpense(g.id, g.concept, g.amount)}
                  style={styles.iconButton}
                >
                  <Ionicons name="pencil" size={20} color="orange" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteExpense(g.id)}
                  style={styles.iconButton}
                >
                  <Ionicons name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Botón para agregar nuevo gasto */}
          <TouchableOpacity style={styles.addExpenseButton} onPress={handleAddExpense}>
            <Text style={styles.addExpenseButtonText}>Añadir Gasto</Text>
          </TouchableOpacity>

          {/* Total de GASTOS */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalExpensesText}>Total gastos: {totalExpenses.toFixed(2)}€</Text>
          </View>

          {/* 
            NUEVO: Debajo de los gastos, muestras la diferencia Pagos - Gastos 
            Si quieres un estilo similar a totalText, úsalo. 
          */}


          <Text style={[styles.paymentText, { fontWeight: 'bold', marginTop: 10, color: 'black' }]}>
            Resultado (Pagos - Gastos): {difference.toFixed(2)}€
          </Text>
        </View>

        {/* Zona para tocar y agregar nuevo pago (Efectivo/Tarjeta) */}
        <TouchableOpacity style={styles.flexibleArea} onPress={handleScreenPress}>
          <Text style={styles.instructionText}>
            Toca la izquierda para Efectivo y la derecha para Tarjeta/otros
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- MODAL PARA PAGOS --- */}
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
                let formattedText = text.replace(',', '.');
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

      {/* --- MODAL PARA GASTOS --- */}
      <Modal visible={expenseModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
            </Text>

            {/* CONCEPTO */}
            <TextInput
              style={styles.input}
              placeholder="Concepto"
              value={concept}
              onChangeText={(text) => setConcept(text)}
            />

            {/* MONTO DEL GASTO */}
            <TextInput
              style={styles.input}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              placeholder="Monto"
              value={expenseAmount}
              onChangeText={(text) => {
                let formattedText = text.replace(',', '.');
                formattedText = formattedText.replace(/[^0-9.]/g, '');
                setExpenseAmount(formattedText);
              }}
            />

            <TouchableOpacity style={styles.buttonModal} onPress={handleSaveExpense}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonModal, { backgroundColor: 'red' }]}
              onPress={() => {
                setExpenseModalVisible(false);
                setIsEditingExpense(false);
                setEditExpenseId(null);
                setConcept('');
                setExpenseAmount('');
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

  // PAGOS
  columnsRow: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  paymentText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#333',
  },
  titleText: {
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconButton: {
    marginHorizontal: 5,
  },

  // TOTAL PAGOS
  totalContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },

  totalExpensesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  // --- GASTOS ---
  expensesContainer: {
    marginBottom: 20,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addExpenseButton: {
    backgroundColor: 'orange',
    borderRadius: 5,
    padding: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  addExpenseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Botón/área final para agregar pagos
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

  // Modal
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
  },
});
