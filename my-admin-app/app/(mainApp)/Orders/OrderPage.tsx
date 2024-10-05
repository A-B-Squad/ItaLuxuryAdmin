"use client";
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { COMPANY_INFO_QUERY, PACKAGES_QUERY } from "../../graph/queries";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import OrderTable from "./components/OrderTable";
import Pagination from "../components/Paginations";
import SmallSpinner from "../components/SmallSpinner";
import {
  translatePaymentMethodStatus,
  translateStatus,
} from "../Helpers/_translateStatus";
import Link from "next/link";
import Loading from "./loading";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { formatDate } from "../Helpers/_formatDate";
import { generateInvoice } from "../Helpers/_generateInvoice";
import ReloadButton from "../components/ReloadPage";

const OrdersPage: React.FC = () => {
  const [searchCommande, setSearchCommande] = useState("");
  const [filter, setFilter] = useState("Toute");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const ordersPerPage = 5;

  useQuery(COMPANY_INFO_QUERY, {
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
  });
  const { loading, error, data } = useQuery(PACKAGES_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  if (loading) return <Loading />;
  if (error) return <p>Erreur : {error.message}</p>;

  // Filtrage des commandes
  const filteredOrders = data.getAllPackages.filter((order: any) => {
    const orderDate = new Date(parseInt(order.createdAt));
    const matchesSearch =
      order.customId.toLowerCase().includes(searchCommande.toLowerCase()) ||
      order.Checkout?.userId
        .toLowerCase()
        .includes(searchCommande.toLowerCase());
    const matchesFilter =
      filter === "Toute" || translateStatus(order.status) === filter;
    const matchesDateRange =
      !dateRange ||
      !dateRange.from ||
      !dateRange.to ||
      (orderDate >= dateRange.from && orderDate <= dateRange.to);
    return matchesSearch && matchesFilter && matchesDateRange;
  });

  const indexOfLastOrder = page * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const exportToPDFPackageList = () => {
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

    // Add the table with custom styles
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
          `${order.Checkout.phone[0]}${
            order.Checkout.phone[1] ? ` / ${order.Checkout.phone[1]}` : ""
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

  const exportToExcel = () => {
    // Prepare data
    const data = filteredOrders.map((order: any) => ({
      Réf: order.customId,
      "Date de création": formatDate(order.createdAt),
      ClientId: order.Checkout.userId,
      Client: order.Checkout.userName,
      Phone: `${order.Checkout.phone[0]}${
        order.Checkout.phone[1] ? ` / ${order.Checkout.phone[1]}` : ""
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

  return (
    <div className="p-6 w-full h-full relative pb-20">
      <h1 className="text-2xl font-bold mb-4">Commandes</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="flex p-4 space-x-4 mb-4">
          <input
            type="text"
            placeholder="Rechercher une commande"
            className="border p-2 rounded flex-grow"
            value={searchCommande}
            onChange={(e) => setSearchCommande(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Toute</option>
            <option>ANNULÉ</option>
            <option>EN TRAITEMENT </option>
            <option>TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON </option>
            <option>PAYÉ ET LIVRÉ</option>
            <option>PAYÉ MAIS NON LIVRÉ</option>
            <option>REMBOURSER</option>
          </select>

          <div className="flex flex-col relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="border p-2 rounded"
            >
              {showCalendar ? "Hide Calendar" : "Show Calendar"}
            </button>
            {showCalendar && (
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md border absolute bg-white top-10 left-0 z-10"
              />
            )}
            {dateRange && dateRange.from && dateRange.to && (
              <div className="mt-2">
                Selected range:{" "}
                {formatDate(dateRange.from.getTime().toString())} -{" "}
                {formatDate(dateRange.to.getTime().toString())}
              </div>
            )}
          </div>

          <button
            className="border px-4 py-2 rounded"
            onClick={() => {
              setSearchCommande("");
              setFilter("Toute");
              setDateRange(undefined);
              setShowCalendar(false);
            }}
          >
            Effacer
          </button>
          <ReloadButton />
        </div>

        {loading ? (
          <div className="flex justify-center ">
            <SmallSpinner />
          </div>
        ) : (
          <OrderTable
            orders={currentOrders}
            formatDate={formatDate}
            translateStatus={translateStatus}
            generateInvoice={generateInvoice}
            deliveryPrice={deliveryPrice}
          />
        )}

        {filteredOrders.length > 0 && (
          <div className="pb-4 pl-4 mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-4 absolute">
        <button
          className={`bg-mainColorAdminDash text-white px-4 py-2 rounded ${
            filteredOrders.length === 0
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
          onClick={exportToPDFPackageList}
          disabled={filteredOrders.length === 0}
        >
          Exporter en PDF
        </button>
        <button
          className={`bg-mainColorAdminDash text-white px-4 py-2 rounded ${
            filteredOrders.length === 0
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
          onClick={exportToExcel}
          disabled={filteredOrders.length === 0}
        >
          Exporter en Excel
        </button>
        <Link
          href={"Orders/CreateOrder"}
          className="bg-mainColorAdminDash text-white px-4 py-2 rounded"
        >
          + Ajouter une commande
        </Link>
      </div>
    </div>
  );
};

export default OrdersPage;
