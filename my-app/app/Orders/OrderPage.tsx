"use client";
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { ORDERS_QUERY } from "../graph/queries";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import OrderTable from "./components/OrderTable";
import Pagination from "../components/Paginations";
import SmallSpinner from "../components/SmallSpinner";
import { translateStatus } from "../Helpers/_translateStatus";
import { generateInvoice } from "../Helpers/_generateInvoice";
import { formatDate } from "../Helpers/_formatDate";
import Link from "next/link";
import Loading from './loading';

const OrdersPage: React.FC = () => {
  const [searchCommande, setSearchCommande] = useState("");
  const [filter, setFilter] = useState("Toute");
  const [page, setPage] = useState(1);
  const ordersPerPage = 5;

  const { loading, error, data } = useQuery(ORDERS_QUERY);

  // if (!loading) return <Loading/>;
  if (loading) return <Loading/>;
  if (error) return <p>Erreur : {error.message}</p>;

  // Filtrage des commandes
  const filteredOrders = data.getAllPackages.filter((order: any) => {
    const matchesSearch = order.customId.toLowerCase().includes(searchCommande.toLowerCase());
    const matchesFilter = filter === "Toute" || translateStatus(order.status) === filter;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastOrder = page * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const exportToPDFPackageList = () => {
    const doc = new jsPDF();
    const mainColor: [number, number, number] = [32, 41, 57];
    doc.setFontSize(18);
    doc.setTextColor(...mainColor);
    doc.text("Liste des Commandes", 14, 22);
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()}`;
    const formattedTime = currentDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    doc.setFontSize(12);
    doc.text(`Généré le: ${formattedDate} à ${formattedTime}`, 14, 32);

    autoTable(doc, {
      startY: 40,
      head: [["Réf", "Date de création", "Client", "Statut", "Total"]],
      body: filteredOrders.map((order: any) => [
        order.customId,
        formatDate(order.createdAt),
        order.Checkout.userName,
        translateStatus(order.status),
        order.Checkout.total,
      ]),
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
    });

    const fileName = `commandes_${formattedDate.replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredOrders.map((order: any) => ({
        Réf: order.customId,
        "Date de création": formatDate(order.createdAt),
        Client: order.Checkout.userName,
        Statut: translateStatus(order.status),
        Total: order.Checkout.total,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Commandes");
    XLSX.writeFile(wb, "commandes.xlsx");
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
            <option>EN TRAITEMENT	</option>
            <option>TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON	</option>
            <option>PAYÉ</option>
            <option>REMBOURSER</option>
          </select>
      
          <button
            className="border px-4 py-2 rounded"
            onClick={() => {
              setSearchCommande("");
              setFilter("Toute");
            }}
          >
            Effacer
          </button>
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
            filteredOrders.length === 0 ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={exportToPDFPackageList}
          disabled={filteredOrders.length === 0}
        >
          Exporter en PDF
        </button>
        <button
          className={`bg-mainColorAdminDash text-white px-4 py-2 rounded ${
            filteredOrders.length === 0 ? "cursor-not-allowed" : "cursor-pointer"
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
