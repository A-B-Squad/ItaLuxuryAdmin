import * as XLSX from "xlsx-js-style";
import { formatDate } from "./_formatDate";
import { translatePaymentMethodStatus, translateStatus } from "./_translateStatus";
import { DateRange } from "react-day-picker";


export const exportToEXCELAllPackage = (filteredOrders: any[], dateRange: DateRange | undefined, deliveryPrice: number) => {
  // Prepare data
  const data = filteredOrders.map((order: any) => ({
    Réf: order.customId,
    "Date de création": formatDate(order.createdAt),
    ClientId: order.Checkout.userId,
    Client: order.Checkout.userName,
    Phone: `${order.Checkout.phone[0]}${order.Checkout.phone[1] ? ` / ${order.Checkout.phone[1]}` : ""
      }`,
    Statut: translateStatus(order.status),
    Livraison: order.Checkout.freeDelivery ? 0.0 : deliveryPrice.toFixed(3),
    Total: order.Checkout.total.toFixed(3),
    "Méthode de paiement": translatePaymentMethodStatus(
      order.Checkout.paymentMethod,
    ),
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Add totals
  const total = filteredOrders.reduce(
    (sum: number, order: any) => sum + order.Checkout.total,
    0,
  );
  const lastRow = filteredOrders.length + 2;
  XLSX.utils.sheet_add_aoa(
    ws,
    [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        `Total: ${total.toFixed(3)}`,
      ],
    ],
    { origin: -1 },
  );

  // Style the header row
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "203764" } }, // Dark blue
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  if (ws["!ref"]) {
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!ws[address]) continue;
      ws[address].s = headerStyle;
    }

    // Add date range information
    let dateRangeText = "All dates";
    if (dateRange && dateRange.from && dateRange.to) {
      dateRangeText = `From ${formatDate(
        dateRange.from.getTime().toString(),
      )} to ${formatDate(dateRange.to.getTime().toString())}`;
    }
    XLSX.utils.sheet_add_aoa(ws, [["Date Range:", dateRangeText]], {
      origin: "A1",
    });

    // Style date range cells
    ws.A1.s = { font: { bold: true } };
    ws.B1.s = { font: { italic: true } };

    // Auto-size columns
    const colWidths = filteredOrders.reduce(
      (widths: any[], row: { [x: string]: { toString: () => any } }) => {
        Object.keys(row).forEach((key, i) => {
          const value = row[key] ? row[key].toString() : "";
          widths[i] = Math.max(widths[i] || 0, value.length);
        });
        return widths;
      },
      {},
    );

    ws["!cols"] = Object.keys(colWidths).map((i) => ({ wch: colWidths[i] }));

    // Add border to all cells
    const borderStyle = {
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    for (let R = range.s.r; R <= lastRow; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[address]) continue;
        ws[address].s = { ...ws[address].s, ...borderStyle };
      }
    }
  } else {
    // Handle the case where ws["!ref"] is undefined
    console.error("The worksheet reference is undefined.");
  }

  // Create workbook and write file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Commandes");
  XLSX.writeFile(
    wb,
    `commandes_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};