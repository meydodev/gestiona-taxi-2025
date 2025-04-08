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
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Types";
import ResumenPeriodicalHook from "../hooks/ResumenPeriodicalHook";
import Icon from "react-native-vector-icons/FontAwesome";




type ResumePeriodicalScreenProps = {
  route: RouteProp<RootStackParamList, "ResumePeriodicalScreen">;
};

export default function ResumePeriodicalScreen({ route }: ResumePeriodicalScreenProps) {
  const { startDate, endDate } = route.params;

  const {
    dailyTotals,
    totalEfectivoGeneral,
    totalTarjetaGeneral,
    totalGeneral,
   
    deduction,
    setModalVisible,
    modalVisible,
    inputDeduction,
    setInputDeduction,
    handleSaveDeduction,
    printContent,
    dailyKms,
    totalExpensesGeneral,
    totalDespuesDeGastos,
    driverCommission,
    finalDriverCommission,
    companyCommission,
    finalCompanyCommission,
    finalCompanyCommissionWithDeduction,
    finalCompanyCommissionWithDeductionAndExpenses,
  }=ResumenPeriodicalHook(startDate, endDate);

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
                  <Text style={styles.highlightText}>
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
              <Text style={[styles.totalValue, { fontWeight: "bold",color:"#28A745" }]}>
                {totalDespuesDeGastos.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Comisión conductor */}

            <Text style={styles.totalTitle}>Comision Conductor</Text>
            <View style={[styles.totalRow, styles.commissionContainer]}>
              <Text style={styles.totalLabel}>Comisión Conductor (50%):</Text>
              <Text style={[styles.totalValue, styles.totalValue]}>
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
              <Text style={[styles.totalValue, styles.highlightText]}>
                {finalDriverCommission.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Comisión empresa */}

            <Text style={styles.totalTitle}>Comision Empresa</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Comisión(50%):</Text>
              <Text style={styles.totalValue}>
                {companyCommission.toFixed(2)}€
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Comisión (-) Gastos:</Text>
              <Text style={[styles.totalValue, styles.totalLabel]}>
                {finalCompanyCommission.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Comisión (+) Deducción:</Text>
              <Text style={[styles.totalValue, styles.totalLabel]}>
                {finalCompanyCommissionWithDeduction.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Comisión (+) Deducción (-) Gastos:</Text>
              <Text style={[styles.totalValue, styles.highlightText]}>
                {finalCompanyCommissionWithDeductionAndExpenses.toFixed(2)}€
              </Text>
            </View>


            {/* Botón para abrir el modal de deducción */}
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
              
              <Text style={styles.buttonText}>
              <Icon name="minus" size={15} color="#fff" /> {" "} Ingresar Deducción</Text>
              
            </TouchableOpacity>
          </View>
        )}

        {/* BOTÓN PARA IMPRIMIR */}
        {dailyTotals.length > 0 && (
          <TouchableOpacity onPress={printContent} style={styles.printButton}>
            <Text style={styles.printButtonText}>
            <Icon name="print" size={15} color="white" /> {" "}
            Imprimir Resumen</Text>
            
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
    color: 'orange',
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: "bold",
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
    shadowRadius: 3,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ccc',
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
    shadowRadius: 3,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ccc',
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
