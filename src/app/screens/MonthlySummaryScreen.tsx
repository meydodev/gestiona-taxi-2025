import React, { useState, useEffect } from "react";
import { ImageBackground, StyleSheet, ScrollView, View, Text, Button } from "react-native";
import { DatabaseConnection } from "../database/database-connection";

export default function MonthlySummaryScreen() {
  const [date, setDate] = useState(new Date());
  const [dailyPayments, setDailyPayments] = useState<any[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);
  const [totalPaymentsMonth, setTotalPaymentsMonth] = useState(0);
  const [totalExpensesMonth, setTotalExpensesMonth] = useState(0);
  const [benefits, setBenefits] = useState(0);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await DatabaseConnection.getConnection();
        setDb(database);
      } catch (err) {
        console.error("Error al conectar con la base de datos:", err);
      }
    };
    initDb();
  }, []);

  useEffect(() => {
    if (db) {
      loadMonthlySummary();
    }
  }, [date, db]);

  const loadMonthlySummary = async () => {
    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

      const paymentsResult = await db.getAllAsync(
        "SELECT DATE(date) as day, SUM(amount) as total_payments FROM payments WHERE date BETWEEN ? AND ? GROUP BY DATE(date)",
        [startOfMonth, endOfMonth]
      );
      
      const totalPaymentsResult = await db.getAllAsync(
        "SELECT SUM(amount) as total FROM payments WHERE date BETWEEN ? AND ?",
        [startOfMonth, endOfMonth]
      );

      const expensesResult = await db.getAllAsync(
        "SELECT DATE(date) as day, SUM(amount) as total_expenses FROM expenses WHERE date BETWEEN ? AND ? GROUP BY DATE(date)",
        [startOfMonth, endOfMonth]
      );
      
      const totalExpensesResult = await db.getAllAsync(
        "SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ?",
        [startOfMonth, endOfMonth]
      );

      setDailyPayments(paymentsResult);
      setDailyExpenses(expensesResult);
      setTotalPaymentsMonth(totalPaymentsResult[0]?.total ?? 0);
      setTotalExpensesMonth(totalExpensesResult[0]?.total ?? 0);
      setBenefits((totalPaymentsResult[0]?.total ?? 0) - (totalExpensesResult[0]?.total ?? 0));
    } catch (err) {
      console.error("Error al cargar el resumen mensual:", err);
    }
  };

  return (
    <ImageBackground source={require("../../../assets/img/agenda.png")} style={styles.imageBackground}>
      <ScrollView>
        <View style={styles.summaryContainer}>
          <Text style={styles.header}>Resumen Mensual</Text>

          <View style={styles.buttonContainer}>
            <Text style={styles.monthButton} onPress={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>
              ← Mes Anterior
            </Text>
            <Text style={styles.monthText}>
              {date.toLocaleString("es-ES", { month: "long", year: "numeric" })}
            </Text>
            <Text style={styles.monthButton} onPress={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>
              Mes Siguiente →
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Pagos por Día</Text>
            {dailyPayments.length > 0 ? (
              dailyPayments.map((payment, index) => (
                <Text key={index} style={styles.paymentText}>
                {new Date(payment.day).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}: {payment.total_payments}€
                </Text>

              ))
            ) : (
              <Text style={styles.text}>No hay pagos registrados</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Gastos por Día</Text>
            {dailyExpenses.length > 0 ? (
              dailyExpenses.map((expense, index) => (
                <Text key={index} style={styles.expenseText}>
                  {expense.day}: {expense.total_expenses}€
                </Text>
              ))
            ) : (
              <Text style={styles.text}>No hay gastos registrados</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Totales del Mes</Text>
            <Text style={styles.totalText}>Total Pagos: {totalPaymentsMonth}€</Text>
            <Text style={styles.totalText}>Total Gastos: {totalExpensesMonth}€</Text>
            <Text style={styles.benefitsText}>Beneficio Total: {benefits}€</Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: { flex: 1 },
  scrollContainer: { padding: 20 },
  summaryContainer: { alignItems: "center" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10,color:'orange' },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 10 },
  monthButton: { fontSize: 16, fontWeight: "bold", color: "blue" },
  monthText: { fontSize: 18, fontWeight: "bold",color:'black' },
  card: { backgroundColor: "white", padding: 15, borderRadius: 8, marginBottom: 10, width: "100%", maxWidth: 400, elevation: 3 },
  sectionHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  paymentText: { fontSize: 16, color: "green" },
  expenseText: { fontSize: 16, color: "red" },
  totalText: { fontSize: 16, fontWeight: "bold" },
  text: { fontSize: 16 },
  benefitsText: { fontSize: 18, fontWeight: "bold", color: "darkgreen" },
});
