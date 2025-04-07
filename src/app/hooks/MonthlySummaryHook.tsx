import { useEffect, useState } from "react";
import { DatabaseConnection } from "../database/database-connection";
import * as Print from "expo-print";



function formatDateForSQLiteNoTime(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // "2025-02-01"
  }

export default function MonthlySummaryHook() {


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

  return {
    date,
    goToPreviousMonth,
    goToNextMonth,
    dailyPayments,
    dailyExpenses,
    dailyKms,
    monthlyEfectivo,
    monthlyTarjeta,
    monthlyTotal,
    totalExpensesMonth,
    benefits,
    printContent,
  };
}