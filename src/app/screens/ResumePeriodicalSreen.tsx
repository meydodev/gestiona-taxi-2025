import React, { useEffect, useState } from "react";
import {
  ScrollView,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { DatabaseConnection } from "../database/database-connection";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Types";

// 1) Importar la librería expo-print
import * as Print from "expo-print";

type ResumePeriodicalScreenProps = {
  route: RouteProp<RootStackParamList, "ResumePeriodicalScreen">;
};

export default function ResumePeriodicalScreen({ route }: ResumePeriodicalScreenProps) {
  const { startDate, endDate } = route.params;

  const [db, setDb] = useState<any>(null);

  // Guarda: { date, total_efectivo, total_tarjeta, total_general, total_expenses }
  const [dailyTotals, setDailyTotals] = useState<
    {
      date: string;
      total_efectivo: number;
      total_tarjeta: number;
      total_general: number;
      total_expenses: number;
    }[]
  >([]);

  // Kms por día (si lo necesitas para mostrar en la tabla)
  const [dailyKms, setDailyKms] = useState<{ day: string; pricePerKm: number }[]>([]);

  // Totales acumulados
  const [totalEfectivoGeneral, setTotalEfectivoGeneral] = useState(0);
  const [totalTarjetaGeneral, setTotalTarjetaGeneral] = useState(0);
  const [totalGeneral, setTotalGeneral] = useState(0); // Suma de todos los ingresos
  const [totalExpensesGeneral, setTotalExpensesGeneral] = useState(0); // Suma de gastos

  // Deducción (afecta solo a la comisión del conductor)
  const [deduction, setDeduction] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputDeduction, setInputDeduction] = useState("");

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await DatabaseConnection.getConnection();
        setDb(database);
        loadDailyTotals(database);
      } catch (err) {
        console.error("Error al conectar con la base de datos:", err);
      }
    };
    initDb();
  }, []);

  const loadDailyTotals = async (database: any) => {
    try {
      // 1) Consulta de pagos (ingresos) por día
      const paymentsResults = await database.getAllAsync(
        `SELECT date,
          SUM(CASE WHEN type = 'Efectivo' THEN amount ELSE 0 END) AS total_efectivo,
          SUM(CASE WHEN type = 'Tarjeta' THEN amount ELSE 0 END) AS total_tarjeta,
          SUM(amount) AS total_general
         FROM payments 
         WHERE date BETWEEN ? AND ?
         GROUP BY date
         ORDER BY date ASC;`,
        [startDate, endDate]
      );

      // 2) Consulta de gastos por día
      const expensesResults = await database.getAllAsync(
        `SELECT date,
                SUM(amount) AS total_expenses
         FROM expenses
         WHERE date BETWEEN ? AND ?
         GROUP BY date
         ORDER BY date ASC;`,
        [startDate, endDate]
      );

      // 3) Consulta kms (opcional)
      const kmsResults = await database.getAllAsync(
        `SELECT 
           DATE(date) AS day,
           pricePerKm
         FROM kms
         WHERE date BETWEEN ? AND ?
         ORDER BY DATE(date);`,
        [startDate, endDate]
      );
      setDailyKms(kmsResults);

      // Combinar información de ingresos y gastos en un solo array
      const uniqueDates = new Set([
        ...paymentsResults.map((p: any) => p.date),
        ...expensesResults.map((e: any) => e.date),
      ]);

      const combinedData = Array.from(uniqueDates).map((date) => {
        const paymentItem = paymentsResults.find((p: any) => p.date === date);
        const expenseItem = expensesResults.find((e: any) => e.date === date);

        return {
          date,
          total_efectivo: paymentItem?.total_efectivo || 0,
          total_tarjeta: paymentItem?.total_tarjeta || 0,
          total_general: paymentItem?.total_general || 0,
          total_expenses: expenseItem?.total_expenses || 0,
        };
      });

      setDailyTotals(combinedData);

      // Calcular totales acumulados
      const totalEfectivo = combinedData.reduce(
        (sum, item) => sum + item.total_efectivo,
        0
      );
      const totalTarjeta = combinedData.reduce(
        (sum, item) => sum + item.total_tarjeta,
        0
      );
      const totalIngresos = combinedData.reduce(
        (sum, item) => sum + item.total_general,
        0
      );
      const totalGastos = combinedData.reduce(
        (sum, item) => sum + item.total_expenses,
        0
      );

      setTotalEfectivoGeneral(totalEfectivo);
      setTotalTarjetaGeneral(totalTarjeta);
      setTotalGeneral(totalIngresos);
      setTotalExpensesGeneral(totalGastos);
    } catch (error) {
      console.error("Error al cargar datos de pagos/gastos:", error);
    }
  };

  // Cálculos que se requieren
  const totalDespuesDeGastos = totalGeneral - totalExpensesGeneral; // Muestra en la pantalla
  // Comisión 50% para cada uno (basada en totalGeneral)
  const driverCommission = totalGeneral / 2;
  const companyCommission = totalGeneral / 2;

  // Deducción se resta a la comisión del conductor
  const finalDriverCommission = driverCommission - deduction;
  // Los gastos se restan de la comisión de la empresa
  const finalCompanyCommission = companyCommission - totalExpensesGeneral;

  // Guardar la deducción ingresada
  const handleSaveDeduction = () => {
    const parsedDeduction = parseFloat(inputDeduction) || 0;
    setDeduction(parsedDeduction);
    setModalVisible(false);
  };

  // Generar el HTML para imprimir
  const generateHTML = (): string => {
    const dailyRows = dailyTotals
      .map((item) => {
        const kmsForThisDay = dailyKms.find((k) => k.day === item.date);
        return `
          <tr>
            <td>${item.date}</td>
            <td>${item.total_efectivo.toFixed(2)}€</td>
            <td>${item.total_tarjeta.toFixed(2)}€</td>
            <td>${item.total_general.toFixed(2)}€</td>
            <td style="color:red;">${item.total_expenses.toFixed(2)}€</td>
            <td>${
              kmsForThisDay
                ? kmsForThisDay.pricePerKm.toFixed(2) + "€"
                : "-"
            }</td>
          </tr>
        `;
      })
      .join("");

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
            .totals {
              margin-top: 20px;
              padding: 10px;
              border: 1px solid #ccc;
            }
            .totals h2 {
              margin-top: 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          <h1>Resumen entre ${startDate} y ${endDate}</h1>
          ${
            dailyTotals.length === 0
              ? `<p>No hay registros en este rango de fechas.</p>`
              : `
                <h2>Detalles diarios</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Efectivo</th>
                      <th>Tarjeta/Otros</th>
                      <th>Total día</th>
                      <th>Gastos</th>
                      <th>Precio/km</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dailyRows}
                  </tbody>
                </table>
              `
          }
          
          ${
            dailyTotals.length > 0
              ? `
                <div class="totals">
                  <h2>Totales Acumulados</h2>
                  <div class="row">
                    <strong>Efectivo:</strong>
                    <span>${totalEfectivoGeneral.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Tarjeta/Otros:</strong>
                    <span>${totalTarjetaGeneral.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Total General (ingresos):</strong>
                    <span>${totalGeneral.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Total Gastos:</strong>
                    <span style="color:red;">${totalExpensesGeneral.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Total después de gastos:</strong>
                    <span>${totalDespuesDeGastos.toFixed(2)}€</span>
                  </div>
                  <hr />
                  <div class="row">
                    <strong>Comisión Conductor (50%):</strong>
                    <span>${driverCommission.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Deducción (conductor):</strong>
                    <span>${deduction.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Comisión Conductor Final:</strong>
                    <span>${finalDriverCommission.toFixed(2)}€</span>
                  </div>
                  <hr />
                  <div class="row">
                    <strong>Comisión Empresa (50%):</strong>
                    <span>${companyCommission.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Comisión Empresa (-) Gastos:</strong>
                    <span>${finalCompanyCommission.toFixed(2)}€</span>
                  </div>
                </div>
              `
              : ""
          }
        </body>
      </html>
    `;
  };

  // Función para imprimir
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
      imageStyle={styles.imageOpacity}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Resumen entre {
            new Intl.DateTimeFormat('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }).format(new Date(startDate))
          } y {
            new Intl.DateTimeFormat('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }).format(new Date(endDate))
          }
        </Text>

        {dailyTotals.length === 0 ? (
          <Text style={styles.noPayments}>No hay registros en este rango de fechas.</Text>
        ) : (
          dailyTotals.map((item) => {
            const kmsForThisDay = dailyKms.find((k) => k.day === item.date);
            return (
              <View key={item.date} style={styles.paymentItem}>
                <View style={styles.paymentItemHeader}>
                  <Text style={styles.paymentItemDate}>
                    {new Intl.DateTimeFormat('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }).format(new Date(item.date))}
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Efectivo:</Text>
                  <Text style={styles.paymentValue}>
                    {item.total_efectivo.toFixed(2)}€
                  </Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Tarjeta/Otros:</Text>
                  <Text style={styles.paymentValue}>
                    {item.total_tarjeta.toFixed(2)}€
                  </Text>
                </View>

                {/* Mostrar precio por km si existe */}
                {kmsForThisDay && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Precio/km:</Text>
                    <Text style={styles.paymentValue}>
                      {kmsForThisDay.pricePerKm.toFixed(2)}€
                    </Text>
                  </View>
                )}

                {/* Gastos del día */}
                <View style={styles.paymentRow}>
                  <Text style={[styles.paymentLabel, { color: 'red' }]}>Gastos:</Text>
                  <Text style={[styles.paymentValue, { color: 'red' }]}>
                    {item.total_expenses.toFixed(2)}€
                  </Text>
                </View>

                <View style={[styles.paymentRow, styles.paymentRowTotal]}>
                  <Text style={styles.paymentLabelTotal}>Total día (ingresos):</Text>
                  <Text style={styles.paymentValueTotal}>
                    {item.total_general.toFixed(2)}€
                  </Text>
                </View>
              </View>
            );
          })
        )}

        {/* Totales generales */}
        {dailyTotals.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalTitle}>Totales Acumulados</Text>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Efectivo:</Text>
              <Text style={styles.totalValue}>
                {totalEfectivoGeneral.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tarjeta/Otros:</Text>
              <Text style={styles.totalValue}>
                {totalTarjetaGeneral.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total General (ingresos):</Text>
              <Text style={styles.totalValue}>
                {totalGeneral.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: "red" }]}>Total Gastos:</Text>
              <Text style={[styles.totalValue, { color: "red" }]}>
                {totalExpensesGeneral.toFixed(2)}€
              </Text>
            </View>

            <View style={[styles.totalRow, { marginTop: 8 }]}>
              <Text style={styles.totalLabel}>Total después de gastos:</Text>
              <Text style={[styles.totalValue, { fontWeight: "bold" }]}>
                {totalDespuesDeGastos.toFixed(2)}€
              </Text>
            </View>

            {/* Comisión conductor */}
            <View style={[styles.totalRow, styles.commissionContainer]}>
              <Text style={styles.totalLabel}>Comisión Conductor (50%):</Text>
              <Text style={[styles.totalValue, styles.highlightText]}>
                {driverCommission.toFixed(2)}€
              </Text>
            </View>

            {/* Deducción */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Deducción (conductor):</Text>
              <Text style={[styles.totalValue, deduction ? styles.deductionValue : null]}>
                {deduction.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Comisión Conductor Final:</Text>
              <Text style={[styles.totalValue, styles.finalCommission]}>
                {finalDriverCommission.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Comisión empresa */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Comisión Empresa (50%):</Text>
              <Text style={styles.totalValue}>
                {companyCommission.toFixed(2)}€
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Comisión Empresa (-) Gastos:</Text>
              <Text style={[styles.totalValue, styles.finalCommission]}>
                {finalCompanyCommission.toFixed(2)}€
              </Text>
            </View>

            {/* Botón para abrir el modal de deducción */}
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
              <Text style={styles.buttonText}>Ingresar Deducción</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BOTÓN PARA IMPRIMIR */}
        {dailyTotals.length > 0 && (
          <TouchableOpacity onPress={printContent} style={styles.printButton}>
            <Text style={styles.printButtonText}>Imprimir Resumen</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal para ingresar deducción */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingresar Deducción</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Cantidad a restar"
              value={inputDeduction}
              onChangeText={setInputDeduction}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveDeduction}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

// Colores y estilos
const COLORS = {
  primary: "#007BFF",
  background: "#F8F9FA",
  textDark: "#333",
  textLight: "#FFF",
  border: "#DDD",
  highlight: "#28A745",
  danger: "#D9534F",
  shadow: "#000",
};

const styles = StyleSheet.create({
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  imageOpacity: {
    opacity: 0.08,
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 16,
  },
  noPayments: {
    fontSize: 16,
    color: COLORS.textDark,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  // Items de pago diarios
  paymentItem: {
    backgroundColor: COLORS.textLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentItemHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
    paddingBottom: 4,
  },
  paymentItemDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  paymentRowTotal: {
    marginTop: 8,
  },
  paymentLabelTotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  paymentValueTotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  // Totales
  totalContainer: {
    backgroundColor: COLORS.textLight,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  totalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  commissionContainer: {
    marginTop: 10,
  },
  highlightText: {
    color: COLORS.highlight,
  },
  deductionValue: {
    color: COLORS.danger,
  },
  finalCommission: {
    color: COLORS.primary,
  },
  divider: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  // Botón principal
  button: {
    backgroundColor: "orange",
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.textLight,
    fontWeight: "bold",
    fontSize: 16,
  },

  // Botón de imprimir
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

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: COLORS.textLight,
    borderRadius: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 16,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: COLORS.danger,
  },
  modalButtonText: {
    color: COLORS.textLight,
    fontWeight: "bold",
  },
});
