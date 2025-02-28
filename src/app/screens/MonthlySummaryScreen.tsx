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

// 1) Importar expo-print
import * as Print from "expo-print";

/**
 * Función para formatear una fecha JS en formato YYYY-MM-DD (ignorando horas).
 * Así evitamos que la zona horaria "reste" o "sume" días al comparar.
 */
function formatDateForSQLiteNoTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // "2025-02-01"
}

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
      // 1) Calculamos la fecha 1 del mes y la última fecha (28,29,30 o 31)
      const year = date.getFullYear();
      const month = date.getMonth();

      // Día 1 del mes
      const firstDay = new Date(year, month, 1);
      // Último día del mes (poniendo day=0 en el mes siguiente)
      const lastDay = new Date(year, month + 1, 0);

      // 2) Formateamos sólo a "YYYY-MM-DD", sin hora
      const startOfMonthStr = formatDateForSQLiteNoTime(firstDay);
      const endOfMonthStr = formatDateForSQLiteNoTime(lastDay);

      // 3) Usamos DATE() en la query y comparamos con las cadenas (DATE(?) y DATE(?))
      const paymentsResult = await db.getAllAsync(
        `SELECT 
           DATE(date) AS day,
           SUM(CASE WHEN type = 'Efectivo' THEN amount ELSE 0 END) AS efectivo,
           SUM(CASE WHEN type = 'Tarjeta' THEN amount ELSE 0 END) AS tarjeta,
           SUM(amount) AS total
         FROM payments
         WHERE DATE(date) >= DATE(?) 
           AND DATE(date) <= DATE(?)
         GROUP BY DATE(date)
         ORDER BY DATE(date);`,
        [startOfMonthStr, endOfMonthStr]
      );

      const monthlyPaymentsResult = await db.getAllAsync(
        `SELECT
           SUM(CASE WHEN type = 'Efectivo' THEN amount ELSE 0 END) AS total_efectivo,
           SUM(CASE WHEN type = 'Tarjeta' THEN amount ELSE 0 END) AS total_tarjeta,
           SUM(amount) AS total_general
         FROM payments
         WHERE DATE(date) >= DATE(?) 
           AND DATE(date) <= DATE(?);`,
        [startOfMonthStr, endOfMonthStr]
      );

      const expensesResult = await db.getAllAsync(
        `SELECT 
           DATE(date) AS day,
           concept,
           SUM(amount) AS total_expenses
         FROM expenses
         WHERE DATE(date) >= DATE(?) 
           AND DATE(date) <= DATE(?)
         GROUP BY DATE(date), concept
         ORDER BY DATE(date), concept;`,
        [startOfMonthStr, endOfMonthStr]
      );

      const totalExpensesResult = await db.getAllAsync(
        `SELECT SUM(amount) as total 
         FROM expenses 
         WHERE DATE(date) >= DATE(?)
           AND DATE(date) <= DATE(?);`,
        [startOfMonthStr, endOfMonthStr]
      );

      const kmsResults = await db.getAllAsync(
        `SELECT 
           DATE(date) AS day,
           pricePerKm
         FROM kms
         WHERE DATE(date) >= DATE(?) 
           AND DATE(date) <= DATE(?)
         ORDER BY DATE(date);`,
        [startOfMonthStr, endOfMonthStr]
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

  // Generar HTML para impresión
  const generateHTML = () => {
    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1, h2 {
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
            ul {
              list-style-type: none;
              padding: 0;
            }
            li {
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <h1>Resumen Mensual</h1>

          <h2>Totales del Mes</h2>
          <ul>
            <li><strong>Efectivo (Mes):</strong> ${monthlyEfectivo.toFixed(2)}€</li>
            <li><strong>Tarjeta (Mes):</strong> ${monthlyTarjeta.toFixed(2)}€</li>
            <li><strong>Total Ingresos:</strong> ${monthlyTotal.toFixed(2)}€</li>
            <li><strong>Total Gastos:</strong> ${totalExpensesMonth.toFixed(2)}€</li>
            <li><strong>Beneficio Total:</strong> ${benefits.toFixed(2)}€</li>
          </ul>

          <h2>Ingresos Diarios</h2>
          <table>
            <tr>
              <th>Día</th>
              <th>Efectivo</th>
              <th>Tarjeta</th>
              <th>Total</th>
              <th>Precio/km</th>
            </tr>
            ${dailyPayments
              .map((payment) => {
                const kmsForThisDay = dailyKms.find((k) => k.day === payment.day);
                return `
                  <tr>
                    <td>${new Date(payment.day).toLocaleDateString("es-ES")}</td>
                    <td>${parseFloat(payment.efectivo).toFixed(2)}</td>
                    <td>${parseFloat(payment.tarjeta).toFixed(2)}</td>
                    <td>${parseFloat(payment.total).toFixed(2)}</td>
                    <td>${
                      kmsForThisDay
                        ? parseFloat(kmsForThisDay.pricePerKm).toFixed(2)
                        : "-"
                    }</td>
                  </tr>
                `;
              })
              .join("")}
          </table>

          <h2>Gastos Diarios</h2>
          <table>
            <tr>
              <th>Día</th>
              <th>Concepto</th>
              <th>Importe</th>
            </tr>
            ${dailyExpenses
              .map((expense) => {
                return `
                  <tr>
                    <td>${new Date(expense.day).toLocaleDateString("es-ES")}</td>
                    <td>${expense.concept}</td>
                    <td>${parseFloat(expense.total_expenses).toFixed(2)}</td>
                  </tr>
                `;
              })
              .join("")}
          </table>
        </body>
      </html>
    `;
  };

  // Función para imprimir con expo-print
  const printContent = async () => {
    try {
      const htmlContent = generateHTML();
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error("Error al imprimir:", error);
      alert("Error al imprimir: " + error);
    }
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

          <Text style={styles.monthText}>
            {date.toLocaleString("es-ES", { month: "long", year: "numeric" })}
          </Text>

          {/* Navegación Mes Anterior / Siguiente */}
          <View style={styles.navContainer}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>← Mes Anterior</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>Mes Siguiente →</Text>
            </TouchableOpacity>
          </View>

          {/* Ingresos Diarios */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Ingresos Diarios</Text>
            {dailyPayments.length > 0 ? (
              dailyPayments.map((payment, index) => {
                // Registro kms del mismo día
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

          {/* Gastos Diarios */}
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
                  <Text style={styles.expenseConcept}>Concepto: {expense.concept}</Text>
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

        {/* Botón para imprimir */}
        <TouchableOpacity onPress={printContent} style={styles.printButton}>
          <Text style={styles.printButtonText}>Imprimir Resumen</Text>
        </TouchableOpacity>
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
  printButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  printButtonText: {
    color: COLORS.textLight,
    fontWeight: "bold",
    fontSize: 16,
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
