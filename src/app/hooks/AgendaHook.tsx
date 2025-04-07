import { useEffect, useState } from 'react';
import { DatabaseConnection } from '../database/database-connection';
import { Dimensions } from 'react-native';
import { Alert } from 'react-native';
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

export default function AgendaHook(date: string) {

    const [db, setDb] = useState<any>(null);
     const [payments, setPayments] = useState<{ id: number; type: string; amount: number }[]>([]);
     const [dailyExpenses, setDailyExpenses] = useState<{
        id: number;
        date: string;
        concept: string;
        amount: number;
      }[]>([]);
      // KILOMETRAJE
  const [kmStart, setKmStart] = useState('');
  const [kmEnd, setKmEnd] = useState('');
  const [pricePerKm, setPricePerKm] = useState(0);
    // PAGOS
   
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
  
    // GASTOS
   
    const [expenseModalVisible, setExpenseModalVisible] = useState(false);
    const [isEditingExpense, setIsEditingExpense] = useState(false);
    const [editExpenseId, setEditExpenseId] = useState<number | null>(null);
    const [concept, setConcept] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');

    const DEADLINE_DATE = new Date('2026-01-02T23:59:59Z');
   

    const parsedDate = new Date(date);
    const day = parsedDate.getDate();
    const month = parsedDate.toLocaleString('es-ES', { month: 'long' });
    const dayOfWeek = parsedDate.toLocaleString('es-ES', { weekday: 'long' });

   


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


  const handleDeletePayment = async (paymentId: number) => {
    try {
      await db.runAsync('DELETE FROM payments WHERE id = ?', [paymentId]);
      loadPayments(db);
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
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
  const handlePaymentPress = (paymentType: string) => {
    const currentDate = new Date();

    if (currentDate > DEADLINE_DATE) {
      Alert.alert('Actualización necesaria', 'Por favor, descargue la nueva versión de la aplicación.');
      return;
    }

    setSelectedPaymentType(paymentType);
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
              ${efectivo.length
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
              ${tarjeta.length
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
                <strong>Total Efectivo:</strong>
                <span>${efectivo.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}€</span>
              </div>
              <div class="row">
                <strong>Total Tarjeta:</strong>
                <span>${tarjeta.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}€</span>
              </div>
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
              ${dailyExpenses.length
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


    return {
        db,
        setDb,
        day,
        month,
        dayOfWeek,
        payments,
        setPayments,
        handleEditPayment,
        handleDeletePayment,
        totalAll,
        handlePaymentPress,
        dailyExpenses,
        handleEditExpense,
        handleDeleteExpense,
        totalExpenses,
        difference,
        kmStart,
        handleAddExpense,
        setKmStart,
        kmEnd,
        handleSaveKmStart,
        formatNumberWithDots,
        handleSaveKmEnd,
        setKmEnd,
        handleSaveKms,
        pricePerKm,
        printContent,
        modalVisible,
        setModalVisible,
        isEditing,
        setIsEditing,
        selectedPaymentType,
        amount,
        setAmount,
        handleSavePayment,
        setEditId,
        setSelectedPaymentType,
        expenseModalVisible,
        isEditingExpense,
        concept,
        setConcept,
        expenseAmount,
        setExpenseAmount,
        handleSaveExpense,
        setExpenseModalVisible,
        setIsEditingExpense,
        setEditExpenseId,

    };

}