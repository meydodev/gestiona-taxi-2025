import { useEffect, useState } from 'react';
import * as Print from "expo-print";
import { DatabaseConnection } from "../database/database-connection";



export default function ResumenPeriodicalHook(startDate: string, endDate: string) {

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
  const [isLoading, setIsLoading] = useState(false);
   

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
      setIsLoading(true);
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
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
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
  const finalCompanyCommissionWithDeduction = companyCommission + deduction;
  const finalCompanyCommissionWithDeductionAndExpenses = finalCompanyCommissionWithDeduction - totalExpensesGeneral;
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
                  <h2>Comisión Conductor</h2>
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
                  <h2>Comisión Empresa</h2>
                  <div class="row">
                    <strong>Comisión (50%):</strong>
                    <span>${companyCommission.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Comisión (-) Gastos:</strong>
                    <span>${finalCompanyCommission.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Comisión (+) Deducción:</strong>
                    <span>${finalCompanyCommissionWithDeduction.toFixed(2)}€</span>
                  </div>
                  <div class="row">
                    <strong>Comisión (+) Deducción (-) Gastos:</strong>
                    <span>${finalCompanyCommissionWithDeductionAndExpenses.toFixed(2)}€</span>
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

  return {
    dailyTotals,
    totalEfectivoGeneral,
    totalTarjetaGeneral,
    totalGeneral,
    totalExpensesGeneral,
    deduction,
    modalVisible,
    setModalVisible,
    inputDeduction,
    setInputDeduction,
    handleSaveDeduction,
    printContent,
    dailyKms,
    driverCommission,
    finalDriverCommission,
    companyCommission,
    finalCompanyCommission,
    finalCompanyCommissionWithDeduction,
    finalCompanyCommissionWithDeductionAndExpenses,
    totalDespuesDeGastos,
    setDeduction,
    isLoading
  };
}