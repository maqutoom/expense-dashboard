const monthlyKey = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${value.getMonth()}`;
};

export const saveAsExcel = async (name, transactions) => {
  const XLSX = await import('xlsx');
  const rows = transactions.map((transaction) => ({
    Type: transaction.type,
    Title: transaction.title,
    Amount: transaction.amount,
    Category: transaction.category,
    Date: transaction.date,
    'Payment Method': transaction.paymentMethod,
    Notes: transaction.notes,
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, `${name.replace(/\s+/g, '-').toLowerCase()}-transactions.xlsx`);
};

export const saveAsMonthlyPdf = async (name, transactions) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const activeMonthTransactions = transactions.filter(
    (transaction) => monthlyKey(transaction.date) === monthlyKey(new Date()),
  );

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${name} Monthly Statement`, 14, 20);
  doc.setFontSize(11);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 14, 28);

  autoTable(doc, {
    head: [['Type', 'Title', 'Category', 'Date', 'Method', 'Amount']],
    body: activeMonthTransactions.map((transaction) => [
      transaction.type,
      transaction.title,
      transaction.category,
      transaction.date,
      transaction.paymentMethod,
      transaction.amount,
    ]),
    startY: 36,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(`${name.replace(/\s+/g, '-').toLowerCase()}-monthly-statement.pdf`);
};
