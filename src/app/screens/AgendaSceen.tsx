import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { DatabaseConnection } from '../database/database-connection';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';

// 1) Importar la librería expo-print
import * as Print from 'expo-print';

// ---------------
//  FUNCIONES AUX
// ---------------
function formatNumberWithDots(value: string): string {
  const numericOnly = value.replace(/\D/g, '');
  return numericOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseDottedNumber(value: string): number {
  const withoutDots = value.replace(/\./g, '');
  return parseFloat(withoutDots);
}

type AgendaScreenProps = {
  route: RouteProp<RootStackParamList, 'AgendaScreen'>;
};

export default function AgendaScreen({ route }: AgendaScreenProps) {
  const { date } = route.params;

  const parsedDate = new Date(date);
  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString('es-ES', { month: 'long' });
  const dayOfWeek = parsedDate.toLocaleString('es-ES', { weekday: 'long' });
  const screenWidth = Dimensions.get('window').width;

  const [db, setDb] = useState<any>(null);

  // PAGOS
  const [payments, setPayments] = useState<{ id: number; type: string; amount: number }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  // GASTOS
  const [dailyExpenses, setDailyExpenses] = useState<{
    id: number;
    date: string;
    concept: string;
    amount: number;
  }[]>([]);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<number | null>(null);
  const [concept, setConcept] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // KILOMETRAJE
  const [kmStart, setKmStart] = useState('');
  const [kmEnd, setKmEnd] = useState('');
  const [pricePerKm, setPricePerKm] = useState(0);

  const DEADLINE_DATE = new Date('2026-01-02T23:59:59Z');

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await DatabaseConnection.getConnection();
        setDb(database);
        
        // Crea tablas si no existen
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            type TEXT,
            amount REAL
          );
        `);

        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            concept TEXT,
            amount REAL
          );
        `);

        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS kms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE, 
            kmStart REAL,
            kmEnd REAL,
            pricePerKm REAL
          );
        `);

        loadPayments(database);
        loadExpenses(database);
        loadKmRecord(database);
      } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
      }
    };

    initDb();
  }, []);

  // Cargar PAGOS
  const loadPayments = async (database: any) => {
    try {
      const results = await database.getAllAsync('SELECT * FROM payments WHERE date = ?', [date]);
      setPayments(results);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    }
  };

  // Cargar GASTOS
  const loadExpenses = async (database: any) => {
    try {
      const results = await database.getAllAsync('SELECT * FROM expenses WHERE date = ?', [date]);
      setDailyExpenses(results);
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    }
  };

  // Cargar KILOMETRAJE
  const loadKmRecord = async (database: any) => {
    try {
      const rows = await database.getAllAsync('SELECT * FROM kms WHERE date = ?', [date]);
      if (rows && rows.length > 0) {
        const result = rows[0];
        setKmStart(formatNumberWithDots(String(result.kmStart)));
        setKmEnd(formatNumberWithDots(String(result.kmEnd)));
        setPricePerKm(result.pricePerKm);
      } else {
        setKmStart('');
        setKmEnd('');
        setPricePerKm(0);
      }
    } catch (error) {
      console.error('Error al cargar kms:', error);
    }
  };

  // Guardar/editar un PAGO
  const handleSavePayment = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;

    try {
      if (isEditing && editId) {
        await db.runAsync('UPDATE payments SET amount = ? WHERE id = ?', [
          parseFloat(amount),
          editId,
        ]);
      } else {
        await db.runAsync('INSERT INTO payments (date, type, amount) VALUES (?, ?, ?)', [
          date,
          selectedPaymentType,
          parseFloat(amount),
        ]);
      }

      loadPayments(db);
      setModalVisible(false);
      setAmount('');
      setIsEditing(false);
      setEditId(null);
      setSelectedPaymentType(null);
    } catch (error) {
      console.error('Error al guardar/editar el pago:', error);
    }
  };

  // Guardar/editar un GASTO
  const handleSaveExpense = async () => {
    if (!expenseAmount || isNaN(parseFloat(expenseAmount))) return;

    try {
      if (isEditingExpense && editExpenseId) {
        await db.runAsync('UPDATE expenses SET concept = ?, amount = ? WHERE id = ?', [
          concept,
          parseFloat(expenseAmount),
          editExpenseId,
        ]);
      } else {
        await db.runAsync('INSERT INTO expenses (date, concept, amount) VALUES (?, ?, ?)', [
          date,
          concept,
          parseFloat(expenseAmount),
        ]);
      }

      loadExpenses(db);
      setExpenseModalVisible(false);
      setConcept('');
      setExpenseAmount('');
      setIsEditingExpense(false);
      setEditExpenseId(null);
    } catch (error) {
      console.error('Error al guardar/editar el gasto:', error);
    }
  };

  // Guardar o actualizar KILOMETRAJE
  const handleSaveKms = async () => {

    const currentDate = new Date();

  // Comparamos la fecha actual con la fecha límite
  if (currentDate > DEADLINE_DATE) {
    Alert.alert('Actualización necesaria', 'Por favor, descargue la nueva versión de la aplicación.');
    return;
  }
    const start = parseDottedNumber(kmStart);
    const end = parseDottedNumber(kmEnd);

    if (isNaN(start) || isNaN(end) || end <= start) {
      //console.warn('Kilometrajes inválidos.');
      alert('Kilometrajes inválidos.');
      return;
    }

    const difference = end - start;
    const totalAll = payments.reduce((acc, p) => acc + p.amount, 0);
    const newPricePerKm = totalAll / difference;

    try {
      const foundRows = await db.getAllAsync('SELECT id FROM kms WHERE date = ?', [date]);
      const found = foundRows && foundRows.length > 0 ? foundRows[0] : null;

      if (found) {
        await db.runAsync(
          'UPDATE kms SET kmStart = ?, kmEnd = ?, pricePerKm = ? WHERE date = ?',
          [start, end, newPricePerKm, date]
        );
      } else {
        await db.runAsync(
          'INSERT INTO kms (date, kmStart, kmEnd, pricePerKm) VALUES (?,?,?,?)',
          [date, start, end, newPricePerKm]
        );
      }

      setPricePerKm(newPricePerKm);
      loadKmRecord(db);
    } catch (error) {
      console.error('Error guardando kilometraje:', error);
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

  // Eliminar GASTO
  const handleDeleteExpense = async (expenseId: number) => {
    try {
      await db.runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
      loadExpenses(db);
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
    }
  };

  // Detectar en qué lado de la pantalla se pulsó para Efectivo o Tarjeta
  const handleScreenPress = (event: any) => {

    const currentDate = new Date();

  // Comparamos la fecha actual con la fecha límite
  if (currentDate > DEADLINE_DATE) {
    Alert.alert('Actualización necesaria', 'Por favor, descargue la nueva versión de la aplicación.');
    return;
  }

    const touchX = event.nativeEvent.locationX;
    const halfScreen = screenWidth / 2;

    setSelectedPaymentType(touchX < halfScreen ? 'Efectivo' : 'Tarjeta');
    setIsEditing(false);
    setEditId(null);
    setAmount('');
    setModalVisible(true);
  };

  // Editar PAGO
  const handleEditPayment = (paymentId: number, currentAmount: number, currentType: string) => {
    setIsEditing(true);
    setEditId(paymentId);
    setSelectedPaymentType(currentType);
    setAmount(String(currentAmount));
    setModalVisible(true);
  };

  // Nuevo GASTO
  const handleAddExpense = () => {

    const currentDate = new Date();

  // Comparamos la fecha actual con la fecha límite
  if (currentDate > DEADLINE_DATE) {
    Alert.alert('Actualización necesaria', 'Por favor, descargue la nueva versión de la aplicación.');
    return;
  }

    setIsEditingExpense(false);
    setEditExpenseId(null);
    setConcept('');
    setExpenseAmount('');
    setExpenseModalVisible(true);
  };

  // Editar GASTO
  const handleEditExpense = (expenseId: number, curConcept: string, curAmount: number) => {
    setIsEditingExpense(true);
    setEditExpenseId(expenseId);
    setConcept(curConcept);
    setExpenseAmount(String(curAmount));
    setExpenseModalVisible(true);
  };

  // Cálculos
  const totalAll = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = dailyExpenses.reduce((acc, g) => acc + g.amount, 0);
  const difference = totalAll - totalExpenses;

  // ----------------------------------------------------------------------------------------
  // 2) Generar el HTML a partir de lo que se muestra en pantalla
  // ----------------------------------------------------------------------------------------
  const generateHTML = (): string => {
    // Separamos pagos en Efectivo y Tarjeta
    const efectivo = payments.filter((p) => p.type === 'Efectivo');
    const tarjeta = payments.filter((p) => p.type === 'Tarjeta');

    // Tabla de pagos (Efectivo y Tarjeta)
    const efectivoRows = efectivo
      .map(
        (p) => `
          <tr>
            <td>${p.type}</td>
            <td>${p.amount.toFixed(2)}€</td>
          </tr>
        `
      )
      .join('');

    const tarjetaRows = tarjeta
      .map(
        (p) => `
          <tr>
            <td>${p.type}</td>
            <td>${p.amount.toFixed(2)}€</td>
          </tr>
        `
      )
      .join('');

    // Tabla de gastos
    const expenseRows = dailyExpenses
      .map(
        (g) => `
          <tr>
            <td>${g.concept}</td>
            <td>${g.amount.toFixed(2)}€</td>
          </tr>
        `
      )
      .join('');

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1, h2, h3 {
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            table, th, td {
              border: 1px solid #ccc;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            .highlight {
              color: green;
              font-weight: bold;
            }
            .danger {
              color: red;
              font-weight: bold;
            }
            .summary {
              margin-top: 20px;
              padding: 10px;
              border: 1px solid #ccc;
            }
            .kms {
              margin-top: 20px;
              padding: 10px;
              border: 1px solid #ccc;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          <h1>Agenda del día ${day} de ${month} (${dayOfWeek})</h1>
          <h3>Fecha completa (ISO): ${date}</h3>

          <h2>Ingresos (Efectivo)</h2>
          ${
            efectivo.length
              ? `
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  ${efectivoRows}
                </tbody>
              </table>
            `
              : `<p>No hay pagos en <strong>efectivo</strong>.</p>`
          }

          <h2>Ingresos (Tarjeta/Otros)</h2>
          ${
            tarjeta.length
              ? `
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  ${tarjetaRows}
                </tbody>
              </table>
            `
              : `<p>No hay pagos en <strong>tarjeta/otros</strong>.</p>`
          }

          <div class="summary">
            <h2>Totales de Ingresos y Gastos</h2>
            <div class="row">
              <strong>Total Ingresos:</strong>
              <span class="highlight">${totalAll.toFixed(2)}€</span>
            </div>
            <div class="row">
              <strong>Total Gastos:</strong>
              <span class="danger">${totalExpenses.toFixed(2)}€</span>
            </div>
            <hr/>
            <div class="row">
              <strong>Resultado (Ingresos - Gastos):</strong>
              <span>${difference.toFixed(2)}€</span>
            </div>
          </div>

          <h2>Gastos del día</h2>
          ${
            dailyExpenses.length
              ? `
              <table>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  ${expenseRows}
                </tbody>
              </table>
            `
              : `<p>No hay gastos registrados.</p>`
          }

          <div class="kms">
            <h2>Kilometraje del día</h2>
            <div class="row">
              <strong>Km inicio:</strong>
              <span>${kmStart || '-'}</span>
            </div>
            <div class="row">
              <strong>Km fin:</strong>
              <span>${kmEnd || '-'}</span>
            </div>
            <div class="row">
              <strong>Precio/km:</strong>
              <span>${pricePerKm > 0 ? pricePerKm.toFixed(2) + '€' : '-'}</span>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // 3) Función para imprimir usando expo-print
  const printContent = async () => {
    try {
      const htmlContent = generateHTML();
      await Print.printAsync({
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error al imprimir:', error);
      alert('Error al imprimir: ' + error);
    }
  };

  // Función para guardar km de inicio
const handleSaveKmStart = async () => {
  const start = parseDottedNumber(kmStart);

  if (isNaN(start) || start <= 0) {
    console.warn('Kilometraje de inicio inválido.');
    return;
  }

  try {
    const foundRows = await db.getAllAsync('SELECT id FROM kms WHERE date = ?', [date]);
    const found = foundRows && foundRows.length > 0 ? foundRows[0] : null;

    if (found) {
      await db.runAsync('UPDATE kms SET kmStart = ? WHERE date = ?', [start, date]);
    } else {
      await db.runAsync('INSERT INTO kms (date, kmStart, kmEnd, pricePerKm) VALUES (?,?,?,?)', [date, start, null, 0]);
    }
  } catch (error) {
    console.error('Error guardando km de inicio:', error);
  }
};

// Función para guardar km de fin
const handleSaveKmEnd = async () => {
  const start = parseDottedNumber(kmStart); // Recuperamos el inicio
  const end = parseDottedNumber(kmEnd);

  if (isNaN(end) || end <= start) {
    console.warn('Kilometraje de fin inválido.');
    alert('El km final debe ser mayor que el inicial.');
    return;
  }

  try {
    const foundRows = await db.getAllAsync('SELECT id FROM kms WHERE date = ?', [date]);
    const found = foundRows && foundRows.length > 0 ? foundRows[0] : null;

    if (found) {
      await db.runAsync('UPDATE kms SET kmEnd = ? WHERE date = ?', [end, date]);
    } else {
      await db.runAsync('INSERT INTO kms (date, kmStart, kmEnd, pricePerKm) VALUES (?,?,?,?)', [date, null, end, 0]);
    }
  } catch (error) {
    console.error('Error guardando km de fin:', error);
  }
};


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Encabezado de la fecha */}
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
        {/* PAGOS */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.cardTitle}>Ingresos</Text>
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
                      <Ionicons name="pencil" size={20} color="#ff9900" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeletePayment(p.id)}
                      style={styles.iconButton}
                    >
                      <Ionicons name="trash" size={20} color="#e63946" />
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
                      <Ionicons name="pencil" size={20} color="#ff9900" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeletePayment(p.id)}
                      style={styles.iconButton}
                    >
                      <Ionicons name="trash" size={20} color="#e63946" />
                    </TouchableOpacity>

                    <Text style={[styles.paymentText, { marginLeft: 10 }]}>
                      {p.amount}€
                    </Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Total de PAGOS */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total ingresos: {totalAll.toFixed(2)}€</Text>
          </View>

          {/* Botón/área para añadir nuevo ingreso */}
          <TouchableOpacity style={styles.flexibleArea} onPress={handleScreenPress}>
            <Text style={styles.instructionText}>
              Toca la izquierda para Efectivo y la derecha para Tarjeta/otros
            </Text>
          </TouchableOpacity>
        </View>

        {/* GASTOS */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.cardTitle}>Gastos del día</Text>

          {dailyExpenses.map((g) => (
            <View key={g.id} style={styles.expenseRow}>
              <Text style={styles.paymentText}>
                {g.concept} - {g.amount}€
              </Text>
              <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                <TouchableOpacity
                  onPress={() => handleEditExpense(g.id, g.concept, g.amount)}
                  style={styles.iconButton}
                >
                  <Ionicons name="pencil" size={20} color="#ff9900" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteExpense(g.id)}
                  style={styles.iconButton}
                >
                  <Ionicons name="trash" size={20} color="#e63946" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Agregar gasto */}
          <TouchableOpacity style={styles.addExpenseButton} onPress={handleAddExpense}>
            <Text style={styles.addExpenseButtonText}>Añadir Gasto</Text>
          </TouchableOpacity>

          {/* Total GASTOS */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalExpensesText}>
              Total gastos: {totalExpenses.toFixed(2)}€
            </Text>
          </View>

          {/* Diferencia Ingresos - Gastos */}
          <Text
            style={[
              styles.paymentText,
              {
                fontWeight: 'bold',
                marginTop: 10,
                color: 'black',
                textAlign: 'center',
              },
            ]}
          >
            Resultado (Pagos - Gastos): {difference.toFixed(2)}€
          </Text>
        </View>

        {/* KILOMETRAJE */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.cardTitle}>Kilometraje del día</Text>
          <View style={styles.kmRow}>
            <View style={styles.kmColumn}>
              <Text style={styles.label}>Km inicio:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 120.099"
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                value={kmStart}
                onBlur={handleSaveKmStart}
                onChangeText={(text) => {
                  const formattedText = formatNumberWithDots(text);
                  setKmStart(formattedText);
                }}
              />
            </View>

            <View style={[styles.kmColumn, { marginLeft: 15 }]}>
              <Text style={styles.label}>Km fin:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 120.150"
                onBlur={handleSaveKmEnd}
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                value={kmEnd}
                onChangeText={(text) => {
                  const formattedText = formatNumberWithDots(text);
                  setKmEnd(formattedText);
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addExpenseButton, { backgroundColor: '#007bff', marginTop: 15 }]}
            onPress={handleSaveKms}
          >
            <Text style={styles.addExpenseButtonText}>Calcular Precio/km</Text>
          </TouchableOpacity>

          {pricePerKm > 0 && (
            <Text style={styles.priceKmText}>
              Precio por km: {pricePerKm.toFixed(2)}€
            </Text>
          )}
        </View>

        {/* BOTÓN PARA IMPRIMIR */}
        <TouchableOpacity onPress={printContent} style={styles.printButton}>
          <Text style={styles.printButtonText}>Imprimir Resumen del Día</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL PAGOS */}
      {modalVisible && (
        <View style={styles.overlay}>
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
      )}

      {/* MODAL GASTOS */}
      {expenseModalVisible && (
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Concepto"
              value={concept}
              onChangeText={(text) => setConcept(text)}
            />

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
      )}
    </KeyboardAvoidingView>
  );
}

// --------------------------------------------------
//                  ESTILOS
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#eaeaea',
    padding: 20,
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
    marginTop: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    marginBottom: 10,
  },
  columnsRow: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  paymentText: {
    fontSize: 14,
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
  totalContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  totalExpensesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
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
  flexibleArea: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    borderRadius: 10,
  },
  instructionText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // KMs
  kmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kmColumn: {
    flex: 1,
  },
  label: {
    marginTop: 5,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    textAlign: 'center',
  },
  priceKmText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  // Botón para imprimir
  printButton: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 50,
  },
  printButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modales
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
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
