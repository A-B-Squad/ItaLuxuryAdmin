import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { formatDate } from "./_formatDate";
import { translatePaymentMethodStatus, translateStatus } from "./_translateStatus";
import { DateRange } from "react-day-picker";
export const 
exportToPDFAllPackageList = (filteredOrders: any[], dateRange: DateRange | undefined ,deliveryPrice: number) => {
    const doc = new jsPDF({ orientation: "landscape" });
    const mainColor: [number, number, number] = [32, 41, 57];
    doc.setFontSize(18);
    doc.setTextColor(...mainColor);
    doc.text("Liste des Commandes", 14, 22);
    doc.setLineWidth(0.5);
    doc.line(14, 25, 282, 25);

    const currentDate = new Date();
    const formattedDate = `${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${currentDate.getFullYear()}`;
    const formattedTime = currentDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    doc.setFontSize(12);
    doc.text(`Généré le: ${formattedDate} à ${formattedTime}`, 14, 32);

    let dateRangeText = "Toutes les dates";
    if (dateRange && dateRange.from && dateRange.to) {
        dateRangeText = `Du ${formatDate(
            dateRange.from.getTime().toString(),
        )} au ${formatDate(dateRange.to.getTime().toString())}`;
    }
    doc.text(`Période: ${dateRangeText}`, 14, 38);

    // Calculate totals
    const totalAmount = filteredOrders.reduce(
        (sum: any, order: { Checkout: { total: any } }) =>
            sum + order.Checkout.total,
        0,
    );

    // table with custom styles
    autoTable(doc, {
        startY: 46,
        head: [
            [
                "Réf",
                "Date de création",
                "Client Id",
                "Client",
                "Phone",
                "Statut",
                "Livraison",
                "Total",
                "Méthode de paiement",
            ],
        ],
        body: [
            ...filteredOrders.map((order: any) => [
                order.customId,
                formatDate(order.createdAt),
                order.Checkout.userId,
                order.Checkout.userName,
                `${order.Checkout.phone[0]}${order.Checkout.phone[1] ? ` / ${order.Checkout.phone[1]}` : ""
                }`,
                translateStatus(order.status),
                order.Checkout.freeDelivery ? 0.0 : deliveryPrice.toFixed(3),
                order.Checkout.total.toFixed(3),
                translatePaymentMethodStatus(order.Checkout.paymentMethod),
            ]),
            ["Total", "", "", "", "", "", "", totalAmount.toFixed(3), ""],
        ],
        styles: {
            fontSize: 10,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: mainColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        margin: { top: 40 },
        tableLineWidth: 0.1,
        tableLineColor: [0, 0, 0], // Border color
    });

    const fileName = `commandes_${formattedDate.replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
};