import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { formatDate } from "./_formatDate";

export const generateInvoice = (order: any) => {
  console.log(order, "teetetetet");

  const doc = new jsPDF();

  // Set font
  doc.setFont("helvetica");

  // Company header
  doc.setFontSize(24);
  doc.text("MAISON NG", 14, 20);

  doc.setFontSize(10);
  doc.text("Sté HORTENSIA SARL", 14, 30);
  doc.text("26, COLONEL GARBOUJI 22", 14, 35);
  doc.text("4051 Sousse, TUNISIE", 14, 40);
  doc.text("M.F : 1719566M/M/P/000", 14, 45);

  // Page number
  doc.text("Page N° 1", 180, 10);

  // BONNE title
  doc.setFontSize(18);
  doc.text("BONNE", 14, 60);

  // Invoice details box
  doc.rect(14, 65, 90, 20);
  doc.setFontSize(10);
  doc.text("N° Pièce", 16, 71);
  doc.text("Date", 16, 77);
  doc.text("Référence", 16, 83);

  doc.text(order.customId, 50, 71);
  doc.text(formatDate(order.createdAt), 50, 77);
  doc.text(order.reference || "", 50, 83);

  // Client details box
  doc.rect(120, 65, 75, 20);
  doc.text("Client", 122, 71);
  doc.setFontSize(9);
  doc.text(order.Checkout.userId, 122, 77);
  doc.text(order.Checkout.userName.toUpperCase(), 122, 83);
  doc.text(order.Checkout.address || "", 122, 89);

  // Table for items
  const tableColumns = [
    "Référence",
    "Désignation",
    "Qté",
    "Remise",
    "Montant TTC",
  ];
  const tableData = order.Checkout?.productInCheckout.map((item: any) => [
    item.product?.reference,
    item.product.name,
    item.productQuantity,
    item.price.toFixed(3),
    "0%",
    (item.productQuantity * item.product.price).toFixed(3),
  ]);

  autoTable(doc, {
    startY: 90,
    head: [tableColumns],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 30, halign: "right" },
    },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.line(14, finalY, 195, finalY);

  // doc.text("Total HT", 140, finalY + 7);
  doc.text(order.Checkout.total.toFixed(3), 180, finalY + 7, {
    align: "right",
  });

  const totalTTC = order.Checkout.total.toFixed(3);
  doc.setFont("helvetica", "bold");
  doc.text("Total TTC", 140, finalY + 14);
  doc.text(totalTTC, 180, finalY + 14, { align: "right" });

  // Space for stamp and signature
  doc.rect(120, finalY + 30, 75, 40);
  doc.text("Cachet & Signature", 122, finalY + 35);

  // Save the PDF
  doc.save(`bonne_${order.customId}.pdf`);
};
