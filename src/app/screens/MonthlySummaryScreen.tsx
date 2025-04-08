import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import Icon from 'react-native-vector-icons/FontAwesome';
import MonthlySummaryHook from "../hooks/MonthlySummaryHook";



export default function MonthlySummaryScreen() {
  

  const {
    date,
    dailyPayments,
    dailyKms,
    dailyExpenses,
    monthlyEfectivo,
    monthlyTarjeta,
    monthlyTotal,
    totalExpensesMonth,
    benefits,
    goToPreviousMonth,
    goToNextMonth,
    printContent,
  } = MonthlySummaryHook();

  return (
    <ImageBackground
      source={require("../../../assets/img/agenda.webp")}
      style={styles.imageBackground}
      imageStyle={styles.bgImageStyle}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.summaryContainer}>
        
          <Text style={styles.header}>
            {date.toLocaleString("es-ES", { month: "long", year: "numeric", }).toLocaleUpperCase()}
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
          <Text style={styles.printButtonText}>
          <Icon name="print" size={15} color="#fff" />  Imprimir Resumen</Text>
           
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
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 15,
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
