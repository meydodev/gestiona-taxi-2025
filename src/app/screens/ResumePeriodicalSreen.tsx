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

type ResumePeriodicalScreenProps = {
  route: RouteProp<RootStackParamList, "ResumePeriodicalScreen">;
};

export default function ResumePeriodicalScreen({ route }: ResumePeriodicalScreenProps) {
  const { startDate, endDate } = route.params;

  const [db, setDb] = useState<any>(null);
  const [dailyTotals, setDailyTotals] = useState<
    { date: string; total_efectivo: number; total_tarjeta: number; total_general: number }[]
  >([]);

  // Totales acumulados
  const [totalEfectivoGeneral, setTotalEfectivoGeneral] = useState(0);
  const [totalTarjetaGeneral, setTotalTarjetaGeneral] = useState(0);
  const [totalGeneral, setTotalGeneral] = useState(0);

  // Deducción
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
      const results = await database.getAllAsync(
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

      setDailyTotals(results);

      // Calcular totales acumulados
      const totalEfectivo = results.reduce((sum: number, item: any) => sum + item.total_efectivo, 0);
      const totalTarjeta = results.reduce((sum: number, item: any) => sum + item.total_tarjeta, 0);
      const total = results.reduce((sum: number, item: any) => sum + item.total_general, 0);

      setTotalEfectivoGeneral(totalEfectivo);
      setTotalTarjetaGeneral(totalTarjeta);
      setTotalGeneral(total);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    }
  };

  // Comisión calculada
  const commission = totalGeneral / 2;

  // Guardar la deducción ingresada
  const handleSaveDeduction = () => {
    const parsedDeduction = parseFloat(inputDeduction) || 0;
    setDeduction(parsedDeduction);
    setModalVisible(false);
  };

  return (
    <ImageBackground
      source={require("../../../assets/img/agenda.png")}
      style={styles.imageBackground}
      imageStyle={styles.imageOpacity}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Resumen de pagos entre {startDate} y {endDate}
        </Text>

        {dailyTotals.length === 0 ? (
          <Text style={styles.noPayments}>No hay pagos en este rango de fechas.</Text>
        ) : (
          dailyTotals.map((item) => (
            <View key={item.date} style={styles.paymentItem}>
              <View style={styles.paymentItemHeader}>
                <Text style={styles.paymentItemDate}>{item.date}</Text>
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
              <View style={[styles.paymentRow, styles.paymentRowTotal]}>
                <Text style={styles.paymentLabelTotal}>Total del día:</Text>
                <Text style={styles.paymentValueTotal}>
                  {item.total_general.toFixed(2)}€
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Totales generales acumulados */}
        {dailyTotals.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalTitle}>Totales Acumulados</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Efectivo:</Text>
              <Text style={styles.totalValue}>{totalEfectivoGeneral.toFixed(2)}€</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tarjeta/Otros:</Text>
              <Text style={styles.totalValue}>{totalTarjetaGeneral.toFixed(2)}€</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total General:</Text>
              <Text style={styles.totalValue}>{totalGeneral.toFixed(2)}€</Text>
            </View>

            {/* Comisión */}
            <View style={[styles.totalRow, styles.commissionContainer]}>
              <Text style={styles.totalLabel}>Comisión Bruta (50%):</Text>
              <Text style={[styles.totalValue, styles.highlightText]}>
                {commission.toFixed(2)}€
              </Text>
            </View>

            {/* Deducción */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Deducción:</Text>
              <Text style={[styles.totalValue, deduction ? styles.deductionValue : null]}>
                {deduction.toFixed(2)}€
              </Text>
            </View>

            {/* Comisiones finales */}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Comisión Final:</Text>
              <Text style={[styles.totalValue, styles.finalCommission]}>
                {(commission - deduction).toFixed(2)}€
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Comisión Empresa:</Text>
              <Text style={[styles.totalValue, styles.finalCommission]}>
                {(commission + deduction).toFixed(2)}€
              </Text>
            </View>

            {/* Botón para abrir el modal de deducción */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.buttonText}>Ingresar Deducción</Text>
            </TouchableOpacity>
          </View>
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
    opacity: 0.08, // Hace la imagen más tenue
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
    backgroundColor: COLORS.primary,
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
