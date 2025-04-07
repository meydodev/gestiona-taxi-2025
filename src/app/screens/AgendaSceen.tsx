import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AgendaHook from '../hooks/AgendaHook';

// 1) Importar la librería expo-print



type AgendaScreenProps = {
  route: RouteProp<RootStackParamList, 'AgendaScreen'>;
};

export default function AgendaScreen({ route }: AgendaScreenProps) {


  const { date } = route.params;


  const {
    day,
    month,
    dayOfWeek,
    payments,
    handleEditPayment,
    handleDeletePayment,
    totalAll,
    handlePaymentPress,
    dailyExpenses,
    handleEditExpense,
    handleDeleteExpense,
    totalExpenses,
    difference,
    handleAddExpense,
    kmStart,
    handleSaveKmStart,
    formatNumberWithDots,
    kmEnd,
    setKmStart,
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
    setExpenseAmount,
    handleSaveExpense,
    expenseAmount,
    setExpenseModalVisible,
    setIsEditingExpense,
    setEditExpenseId,
  } = AgendaHook(date)
  
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
                  .reduce((acc, cur) => acc + cur.amount, 0)
                  .toFixed(2)
                }
                €
              </Text>
              {payments
                .filter((p) => p.type === 'Efectivo')
                .map((p) => (
                  <View key={p.id} style={styles.paymentRow}>
                    <Text style={styles.paymentText}>{p.amount.toFixed(2)}€</Text>
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
                  .reduce((acc, cur) => acc + cur.amount, 0)
                  .toFixed(2)}
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
                      {p.amount.toFixed(2)}€
                    </Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Total de PAGOS */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total ingresos: {totalAll.toFixed(2)}€</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cashButton]}
              onPress={() => handlePaymentPress('Efectivo')}
            >
              <Text style={styles.buttonText}>Añadir Efectivo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cardButton]}
              onPress={() => handlePaymentPress('Tarjeta')}
            >
              <Text style={styles.buttonText}>Añadir Tarjeta/Otros</Text>
            </TouchableOpacity>
          </View>
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
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  cashButton: {
    backgroundColor: 'orange',
  },
  cardButton: {
    backgroundColor: 'orange',
  },
});
