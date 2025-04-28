import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Ticket, SupplierRevenue, MonthlyData, PrepaidClient, Payment, Expense, Consumption } from '@/lib/types';

/**
 * Generates an Excel file from ticket data and triggers download
 */
export function exportTicketsToExcel(tickets: Ticket[], fileName: string = 'tickets-report') {
  // Create a worksheet from the ticket data
  const worksheet = XLSX.utils.json_to_sheet(
    tickets.map(ticket => ({
      'Дата продажи': format(new Date(ticket.issueDate), 'dd.MM.yyyy'),
      'Дата вылета': format(new Date(ticket.travelDate), 'dd.MM.yyyy'),
      'Ф.И.О клиента': ticket.passengerName,
      'Поставщик': ticket.supplier || ticket.airline.name,
      'Маршрут': `${ticket.origin.city} (${ticket.origin.iataCode}) → ${ticket.destination.city} (${ticket.destination.iataCode})`,
      'Оператор': ticket.agentName,
      'Стоимость тарифа': ticket.basePrice || 0,
      'Сборы': ticket.fees || 0,
      'Цена': ticket.price,
      'Комиссия (%)': ticket.commissionRate || 0,
      'Тип услуги': ticket.serviceType || 'flight',
      'Статус оплаты': ticket.paymentStatus || 'pending',
      'Способ оплаты': ticket.paymentMethod || '-',
      'Дата оплаты': ticket.paymentDate ? format(new Date(ticket.paymentDate), 'dd.MM.yyyy') : '-',
      'Контактная информация': ticket.contactInfo || '-',
      'Комментарии': ticket.comments || '-'
    }))
  );

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Дата продажи
    { wch: 12 }, // Дата вылета
    { wch: 25 }, // Ф.И.О клиента
    { wch: 20 }, // Поставщик
    { wch: 30 }, // Маршрут
    { wch: 20 }, // Оператор
    { wch: 15 }, // Стоимость тарифа
    { wch: 10 }, // Сборы
    { wch: 10 }, // Цена
    { wch: 12 }, // Комиссия
    { wch: 15 }, // Тип услуги
    { wch: 15 }, // Статус оплаты
    { wch: 15 }, // Способ оплаты
    { wch: 12 }, // Дата оплаты
    { wch: 25 }, // Контактная информация
    { wch: 30 }  // Комментарии
  ];
  worksheet['!cols'] = columnWidths;

  // Create a workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчет по продажам');

  // Generate Excel file and initiate download
  const date = format(new Date(), 'yyyy-MM-dd');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileData, `${fileName}-${date}.xlsx`);
}

/**
 * Exports payments data to Excel
 */
export function exportPaymentsToExcel(payments: Payment[], tickets: Ticket[], fileName: string = 'payments-report') {
  // Create a worksheet from payments data
  const worksheet = XLSX.utils.json_to_sheet(
    payments.map(payment => {
      // Find the associated ticket for this payment
      const ticket = tickets.find(t => t.id === payment.ticketId);
      
      return {
        'Дата платежа': payment.paymentDate ? format(new Date(payment.paymentDate), 'dd.MM.yyyy') : '-',
        'Клиент': ticket?.passengerName || '-',
        'Сумма': payment.amount.toLocaleString(),
        'Способ оплаты': payment.paymentMethod === 'cash' ? 'Наличные' :
                        payment.paymentMethod === 'bank_transfer' ? 'Банковский перевод' :
                        payment.paymentMethod === 'visa' ? 'Visa' : 
                        payment.paymentMethod === 'uzcard' ? 'UzCard' : 'Тер��инал',
        'ID билета': payment.ticketId || '-',
        'Услуга': ticket?.serviceType || 'Авиабилет',
        'Оператор': ticket?.agentName || '-',
        'Общая стоимость билета': ticket?.price.toLocaleString() || '-',
        'Статус оплаты': ticket?.paymentStatus === 'paid' ? 'Полностью оплачено' : 'Частично оплачено'
      };
    })
  );

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Дата платежа
    { wch: 25 }, // Клиент
    { wch: 15 }, // Сумма
    { wch: 20 }, // Способ оплаты
    { wch: 40 }, // ID билета
    { wch: 15 }, // Услуга
    { wch: 20 }, // Оператор
    { wch: 20 }, // Общая стоимость билета
    { wch: 20 }  // Статус оплаты
  ];
  worksheet['!cols'] = columnWidths;

  // Create a workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчет по платежам');

  // Generate Excel file and initiate download
  const date = format(new Date(), 'yyyy-MM-dd');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileData, `${fileName}-${date}.xlsx`);
}

/**
 * Exports operator performance data to Excel
 */
export function exportOperatorPerformanceToExcel(operatorData: any[], fileName: string = 'operator-report') {
  const worksheet = XLSX.utils.json_to_sheet(
    operatorData.map(operator => ({
      'Оператор': operator.name,
      'Авиабилеты': operator.flightCount || 0,
      'Туры': operator.tourCount || 0,
      'Страховки': operator.insuranceCount || 0,
      'Места': operator.seatCount || 0,
      'Багаж': operator.baggageCount || 0,
      'Всего продаж': operator.totalCount || 0,
      'Выручка': operator.totalRevenue || 0,
      'Средняя цена': operator.avgTicketPrice || 0,
      'Комиссия': `${operator.commissionRate || 0}%`
    }))
  );

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Оператор
    { wch: 12 }, // Авиабилеты
    { wch: 12 }, // Туры
    { wch: 12 }, // Страховки
    { wch: 12 }, // Места
    { wch: 12 }, // Багаж
    { wch: 15 }, // Всего продаж
    { wch: 15 }, // Выручка
    { wch: 15 }, // Средняя цена
    { wch: 12 }  // Комиссия
  ];
  worksheet['!cols'] = columnWidths;

  // Create a workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Эффективность операторов');

  // Generate Excel file and initiate download
  const date = format(new Date(), 'yyyy-MM-dd');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileData, `${fileName}-${date}.xlsx`);
}

/**
 * Exports dashboard summary data to Excel
 */
export function exportDashboardToExcel(
  serviceMetrics: any, 
  supplierData: SupplierRevenue[], 
  monthlyData: MonthlyData[],
  fileName: string = 'dashboard-report'
) {
  const workbook = XLSX.utils.book_new();
  
  // Create Service Metrics worksheet
  const metricsWorksheet = XLSX.utils.json_to_sheet([{
    'Авиабилеты': serviceMetrics.totalFlights,
    'Туры': serviceMetrics.totalTours,
    'Страховки': serviceMetrics.totalInsurance,
    'Места': serviceMetrics.totalSeats,
    'Багаж': serviceMetrics.totalBaggage,
    'Всего услуг': serviceMetrics.totalFlights + serviceMetrics.totalTours + 
                  serviceMetrics.totalInsurance + serviceMetrics.totalSeats + 
                  serviceMetrics.totalBaggage
  }]);
  XLSX.utils.book_append_sheet(workbook, metricsWorksheet, 'Услуги');
  
  // Create Supplier Revenue worksheet
  const supplierWorksheet = XLSX.utils.json_to_sheet(
    supplierData.map(supplier => ({
      'Поставщик': supplier.name,
      'Выручка': supplier.revenue,
      'Количество продаж': supplier.count
    }))
  );
  XLSX.utils.book_append_sheet(workbook, supplierWorksheet, 'Поставщики');
  
  // Create Monthly Data worksheet
  const monthlyWorksheet = XLSX.utils.json_to_sheet(
    monthlyData.map(month => ({
      'Месяц': month.month,
      'Выручка': month.revenue,
      'Количество продаж': month.count
    }))
  );
  XLSX.utils.book_append_sheet(workbook, monthlyWorksheet, 'Помесячные данные');
  
  // Generate Excel file and initiate download
  const date = format(new Date(), 'yyyy-MM-dd');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileData, `${fileName}-${date}.xlsx`);
}

/**
 * Exports prepaid clients data to Excel
 */
export function exportPrepaidClientsToExcel(clients: PrepaidClient[], fileName: string = 'prepaid-clients-report') {
  // Create a worksheet from the prepaid clients data
  const worksheet = XLSX.utils.json_to_sheet(
    clients.map(client => ({
      'Дата': format(new Date(client.payment_date), 'dd.MM.yyyy'),
      'Клиент': client.client_name,
      'Агент': client.agent_name,
      'Сумма (UZS)': client.amount,
      'Способ оплаты': client.payment_method === 'cash' ? 'Наличные' :
                      client.payment_method === 'bank_transfer' ? 'Банковский перевод' :
                      client.payment_method === 'visa' ? 'Visa' : 'UzCard',
      'Примечания': client.notes || '-'
    }))
  );

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Дата
    { wch: 25 }, // Клиент
    { wch: 25 }, // Агент
    { wch: 15 }, // Сумма
    { wch: 20 }, // Способ оплаты
    { wch: 30 }  // Примечания
  ];
  worksheet['!cols'] = columnWidths;

  // Create a workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Предоплаты');

  // Generate Excel file and initiate download
  const date = format(new Date(), 'yyyy-MM-dd');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileData, `${fileName}-${date}.xlsx`);
}

/**
 * Exports expenses data to Excel
 */
export function exportExpensesToExcel(expenses: Expense[], fileName: string = 'expenses-report') {
  const worksheet = XLSX.utils.json_to_sheet(
    expenses.map(expense => ({
      'Date': format(new Date(expense.created_at || ''), 'dd.MM.yyyy'),
      'Amount': expense.amount,
      'Payment Method': expense.payment_method,
      'Commentary': expense.commentary || '-'
    }))
  );

  const columnWidths = [
    { wch: 12 }, // Date
    { wch: 15 }, // Amount
    { wch: 20 }, // Payment Method
    { wch: 30 }  // Commentary
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

  const date = format(new Date(), 'yyyy-MM-dd');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileData, `${fileName}-${date}.xlsx`);
}

/**
 * Exports consumptions data to Excel
 */
export function exportConsumptionsToExcel(consumptions: Consumption[], fileName: string = 'consumptions-report') {
  const worksheet = XLSX.utils.json_to_sheet(
    consumptions.map(consumption => ({
      'Date': format(new Date(consumption.created_at || ''), 'dd.MM.yyyy'),
      'Amount': consumption.amount,
      'Payment Method': consumption.payment_method,
      'Commentary': consumption.commentary || '-'
    }))
  );

  const columnWidths = [
    { wch: 12 }, // Date
    { wch: 15 }, // Amount
    { wch: 20 }, // Payment Method
    { wch: 30 }  // Commentary
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consumptions');

  const date = format(new Date(), 'yyyy-MM-dd');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileData, `${fileName}-${date}.xlsx`);
}
