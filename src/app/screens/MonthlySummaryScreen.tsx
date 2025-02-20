import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { DatabaseConnection } from "../database/database-connection";

export default function MonthlySummaryScreen() {
  const [date, setDate] = useState(new Date());
  // Para desglose mensual
  const [monthlyEfectivo, setMonthlyEfectivo] = useState(0);
  const [monthlyTarjeta, setMonthlyTarjeta] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  const [dailyPayments, setDailyPayments] = useState<any[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);
  const [totalExpensesMonth, setTotalExpensesMonth] = useState(0);
  const [benefits, setBenefits] = useState(0);

  // Para la BD y kms
  const [db, setDb] = useState<any>(null);
  const [dailyKms, setDailyKms] = useState<any[]>([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, db]);

  const loadMonthlySummary = async () => {
    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

      // 1) Consulta diaria que desglosa Efectivo y Tarjeta
      const paymentsResult = await db.getAllAsync(
        `SELECT 
           DATE(date) AS day,
           SUM(CASE WHEN type = 'Efectivo' THEN amount ELSE 0 END) AS efectivo,
           SUM(CASE WHEN type = 'Tarjeta' THEN amount ELSE 0 END) AS tarjeta,
           SUM(amount) AS total
         FROM payments
         WHERE date BETWEEN ? AND ?
         GROUP BY DATE(date)
         ORDER BY DATE(date);`,
        [startOfMonth, endOfMonth]
      );

      // 2) Consulta para el desglose total del mes (efectivo + tarjeta + total)
      const monthlyPaymentsResult = await db.getAllAsync(
        `SELECT
           SUM(CASE WHEN type = 'Efectivo' THEN amount ELSE 0 END) AS total_efectivo,
           SUM(CASE WHEN type = 'Tarjeta' THEN amount ELSE 0 END) AS total_tarjeta,
           SUM(amount) AS total_general
         FROM payments
         WHERE date BETWEEN ? AND ?;`,
        [startOfMonth, endOfMonth]
      );

      // 3) Consulta de gastos (diario y total)
      const expensesResult = await db.getAllAsync(
        `SELECT 
           DATE(date) AS day,
           concept,
           SUM(amount) AS total_expenses
         FROM expenses
         WHERE date BETWEEN ? AND ?
         GROUP BY DATE(date), concept
         ORDER BY DATE(date), concept;`,
        [startOfMonth, endOfMonth]
      );

      const totalExpensesResult = await db.getAllAsync(
        `SELECT SUM(amount) as total 
         FROM expenses 
         WHERE date BETWEEN ? AND ?;`,
        [startOfMonth, endOfMonth]
      );

      // 4) Consulta para KMS (pricePerKm)
      const kmsResults = await db.getAllAsync(
        `SELECT 
           DATE(date) AS day,
           pricePerKm
         FROM kms
         WHERE date BETWEEN ? AND ?
         ORDER BY DATE(date);`,
        [startOfMonth, endOfMonth]
      );
      setDailyKms(kmsResults);

      // Guardar resultados en estados
      setDailyPayments(paymentsResult);
      setDailyExpenses(expensesResult);

      const efectivo = monthlyPaymentsResult[0]?.total_efectivo ?? 0;
      const tarjeta = monthlyPaymentsResult[0]?.total_tarjeta ?? 0;
      const total = monthlyPaymentsResult[0]?.total_general ?? 0;
      setMonthlyEfectivo(efectivo);
      setMonthlyTarjeta(tarjeta);
      setMonthlyTotal(total);

      const totalGastos = totalExpensesResult[0]?.total ?? 0;
      setTotalExpensesMonth(totalGastos);
      setBenefits(total - totalGastos);
    } catch (err) {
      console.error("Error al cargar el resumen mensual:", err);
    }
  };

  // Funciones para cambiar de mes
  const goToPreviousMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  return (
    <ImageBackground
      source={require("../../../assets/img/agenda.webp")}
      style={styles.imageBackground}
      imageStyle={styles.bgImageStyle}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.header}>Resumen Mensual</Text>

          {/* Navegación Mes Anterior / Siguiente */}
          <View style={styles.navContainer}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>← Mes Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.monthText}>
              {date.toLocaleString("es-ES", { month: "long", year: "numeric" })}
            </Text>

            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>Mes Siguiente →</Text>
            </TouchableOpacity>
          </View>

          {/* Ingresos Diarios */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Ingresos Diarios</Text>
            {dailyPayments.length > 0 ? (
              dailyPayments.map((payment, index) => {
                // CAMBIO AQUÍ: Buscamos el registro kms que coincida con la misma fecha
                const kmsForThisDay = dailyKms.find((k) => k.day === payment.day);

                return (
                  <View key={index} style={styles.paymentItem}>
                    <Text style={styles.dateText}>
                      {new Date(payment.day).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Text>

                    <Text style={styles.paymentDetail}>
                      Efectivo: {parseFloat(payment.efectivo).toFixed(2)}€
                    </Text>
                    <Text style={styles.paymentDetail}>
                      Tarjeta: {parseFloat(payment.tarjeta).toFixed(2)}€
                    </Text>

                    {/* Solo si kmsForThisDay existe, mostramos el precio/km */}
                    {kmsForThisDay && (
                      <Text style={styles.paymentDetail}>
                        Precio/km: {parseFloat(kmsForThisDay.pricePerKm).toFixed(2)}€
                      </Text>
                    )}

                    <Text style={styles.paymentTotal}>
                      Total: {parseFloat(payment.total).toFixed(2)}€
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.placeholderText}>No hay pagos registrados</Text>
            )}
          </View>

          {/* Gastos Diarios con concepto */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Gastos Diarios</Text>
            {dailyExpenses.length > 0 ? (
              dailyExpenses.map((expense, index) => (
                <View key={index} style={styles.expenseItem}>
                  <Text style={styles.dateText}>
                    {new Date(expense.day).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={styles.expenseConcept}>
                    Concepto: {expense.concept}
                  </Text>
                  <Text style={styles.expenseAmount}>
                    {parseFloat(expense.total_expenses).toFixed(2)}€
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.placeholderText}>No hay gastos registrados</Text>
            )}
          </View>

          {/* Totales del Mes */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Totales del Mes</Text>
            {/* Desglose de EFECTIVO, TARJETA y TOTAL */}
            <Text style={styles.totalText}>
              Efectivo (Mes): {monthlyEfectivo.toFixed(2)}€
            </Text>
            <Text style={styles.totalText}>
              Tarjeta (Mes): {monthlyTarjeta.toFixed(2)}€
            </Text>
            <Text style={styles.totalText}>
              Total Ingresos: {monthlyTotal.toFixed(2)}€
            </Text>

            <Text style={styles.totalText}>
              Total Gastos: {totalExpensesMonth.toFixed(2)}€
            </Text>
            <Text style={styles.benefitsText}>
              Beneficio Total: {benefits.toFixed(2)}€
            </Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// ----------------------
//     ESTILOS
// ----------------------
const COLORS = {
  primary: "#007BFF",
  background: "#F8F9FA",
  cardBackground: "#FFFFFF",
  textDark: "#333",
  textLight: "#FFF",
  border: "#DDD",
  success: "#28A745",
  danger: "#D9534F",
  orange: "#FFA500",
  shadow: "#000",
};

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
  },
  bgImageStyle: {
    opacity: 0.08,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  summaryContainer: {
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.orange,
    marginBottom: 10,
    textAlign: "center",
  },
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    width: "100%",
  },
  navButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navButtonText: {
    color: COLORS.textLight,
    fontWeight: "bold",
    fontSize: 14,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    width: "100%",
    maxWidth: 400,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  // Ingresos diarios
  paymentItem: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
  },
  dateText: {
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 2,
  },
  paymentDetail: {
    fontSize: 15,
    color: COLORS.success,
    marginLeft: 8,
  },
  paymentTotal: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 4,
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontStyle: "italic",
  },
  // Gastos diarios
  expenseItem: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
  },
  expenseConcept: {
    fontSize: 15,
    color: COLORS.danger,
    marginLeft: 8,
    marginBottom: 2,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.danger,
    marginLeft: 8,
  },
  // Totales mensuales
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  benefitsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.success,
    marginTop: 8,
  },
});
