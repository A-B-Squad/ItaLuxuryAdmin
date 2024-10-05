import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import JsBarcode from "jsbarcode";
import { Order, ProductInCheckout } from "../../types/index";
import { translatePaymentMethodStatus } from "./_translateStatus";

const formatDate = (dateString: string): string => {
  const date = new Date(parseInt(dateString));
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const generateInvoice = (order: Order, deliveryPrice: number) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Header
  doc.setFillColor(32, 41, 57);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ita-luxury", 14, 25);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Delivery information
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Bon Livraison : " + order.customId, 14, 50);
  doc.text("Transporteur: JAX Delivery", 14, 55);
  doc.text("Date Livraison : " + formatDate(order.createdAt), 14, 60);

  // Customer information with improved responsiveness
  doc.setFontSize(10);
  const maxWidth = pageWidth - 20; // Use almost full page width
  const lineHeight = 5;

  const clientText = "CLIENT :";
  const idClientText = "Id: " + order.Checkout.userId;
  const nameText = "Nom: " + order.Checkout.userName;
  const phoneText = "Tel: " + order.Checkout.phone[0];
  const addressText = "Adresse: " + order.Checkout.address;
  const paymentMethodText =
    "Méthode de paiement: " +
    translatePaymentMethodStatus(order.Checkout.paymentMethod);

  const addressLines = doc.splitTextToSize(addressText, maxWidth - 10);
  const totalHeight = 8 + (addressLines.length + 5) * lineHeight;

  doc.setDrawColor(32, 41, 57);
  doc.roundedRect(10, 65, maxWidth, totalHeight, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.text(clientText, 15, 73);

  doc.setFont("helvetica", "normal");
  doc.text(idClientText, 15, 73 + lineHeight);
  doc.text(nameText, 15, 73 + 2 * lineHeight);
  doc.text(phoneText, 15, 73 + 3 * lineHeight);
  doc.text(addressLines, 15, 73 + 4 * lineHeight);
  doc.text(paymentMethodText, 15, 73 + (4 + addressLines.length) * lineHeight);

  // Barcode
  const barcodeCanvas = document.createElement("canvas");
  JsBarcode(barcodeCanvas, order.customId, {
    format: "CODE128",
    width: 1,
    height: 30,
    displayValue: false,
  });
  const barcodeDataUrl = barcodeCanvas.toDataURL("image/png");

  const barcodeWidth = 80;
  const barcodeHeight = 15;
  const barcodeX = (pageWidth - barcodeWidth) / 2;
  const barcodeY = 65 + totalHeight + 10;

  doc.addImage(
    barcodeDataUrl,
    "PNG",
    barcodeX,
    barcodeY,
    barcodeWidth,
    barcodeHeight,
  );

  doc.text(
    "Bon de livraison N° : " + order.customId,
    pageWidth / 2,
    barcodeY - 2,
    {
      align: "center",
    },
  );

  // Table of items
  const tableStartY = barcodeY + barcodeHeight + 10;
  autoTable(doc, {
    startY: tableStartY,
    head: [["CODE", "DESCRIPTION", "UNITÉ", "QTE", "P.U", "TOTAL"]],
    body: order.Checkout.productInCheckout.map((item: ProductInCheckout) => [
      item.product.reference || "",
      item.product.name || "",
      "PCE",
      item.productQuantity,
      item.price.toFixed(3),
      (item.productQuantity * item.price).toFixed(3),
    ]),
    theme: "striped",
    headStyles: { fillColor: [32, 41, 57], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
    },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  const productTotal = order.Checkout.productInCheckout.reduce(
    (sum, item) => sum + item.productQuantity * item.price,
    0,
  );
  const deliveryFee = order.Checkout.freeDelivery ? 0.0 : deliveryPrice;
  const manualDiscount = order.Checkout.manualDiscount || 0;
  const subtotal = productTotal + deliveryFee - manualDiscount;
  const total = order.Checkout.total;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  let currentY = finalY;

  doc.text("Total produits:", 140, currentY);
  doc.text(productTotal.toFixed(3) + " DT", 190, currentY, { align: "right" });
  currentY += 5;

  doc.text("Frais de livraison:", 140, currentY);
  doc.text(deliveryFee.toFixed(3) + " DT", 190, currentY, { align: "right" });
  currentY += 5;

  if (manualDiscount > 0) {
    doc.text("Remise:", 140, currentY);
    doc.text("-" + manualDiscount.toFixed(3) + " DT", 190, currentY, {
      align: "right",
    });
    currentY += 5;
  }

  doc.setFont("helvetica", "bold");
  doc.text("Sous-total:", 140, currentY);
  doc.text(subtotal.toFixed(3) + " DT", 190, currentY, { align: "right" });
  currentY += 7;

  doc.setFontSize(12);
  doc.text("Total:", 140, currentY);
  doc.text(total.toFixed(3) + " DT", 190, currentY, { align: "right" });

  // Save the PDF
  doc.save(`BonLivraison_${order.customId}.pdf`);
};
