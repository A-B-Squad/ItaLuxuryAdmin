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

const CommandesPage: React.FC = () => {
  const [searchCommande, setSearchCommande] = useState("");
  const [filter, setFilter] = useState("Toute");
  const [page, setPage] = useState(1);
  const ordersPerPage = 5;

  const { loading, error, data } = useQuery(ORDERS_QUERY);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  const exportToPDFPackageList = () => {
    const doc = new jsPDF();

    // Définir la couleur principale
    const mainColor: [number, number, number] = [32, 41, 57];

    // Ajouter un titre
    doc.setFontSize(18);
    doc.setTextColor(...mainColor);
    doc.text("Liste des Commandes", 14, 22);

    // Ajouter une ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    // Ajouter une date et une heure formatées
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

    // Ajouter le tableau avec des styles personnalisés
    autoTable(doc, {
      startY: 40, // Position de départ du tableau
      head: [["Réf", "Date de création", "Client", "Statut", "Total"]],
      body: data.getAllPackages.map((order: any) => [
        order.customId,
        formatDate(order.createdAt),
        order.Checkout.userName,
        translateStatus(order.status),
        order.Checkout.total,
      ]),
      styles: {
        fontSize: 10, // Taille de police des cellules
        cellPadding: 3, // Padding des cellules
      },
      headStyles: {
        fillColor: mainColor, // Couleur de fond des en-têtes
        textColor: [255, 255, 255], // Couleur du texte des en-têtes
        fontStyle: "bold", // Style de police des en-têtes
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Couleur de fond des lignes alternées
      },
      margin: { top: 40 }, // Marge supérieure du tableau
    });

    // Nom du fichier PDF avec la date
    const fileName = `commandes_${formattedDate.replace(/\//g, "-")}.pdf`;

    // Enregistrer le PDF
    doc.save(fileName);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.getAllPackages.map((order: any) => ({
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

  const indexOfLastOrder = page * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = data.getAllPackages.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(data.getAllPackages.length / ordersPerPage);
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Commandes</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="flex p-4  space-x-4 mb-4">
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
            <option>PROCESSING</option>
            <option>PAYED</option>
            <option>DELIVERED</option>
          </select>
          <button className="bg-mainColorAdminDash text-white px-4 py-2 rounded">
            Filtre
          </button>
          <button className="border px-4 py-2 rounded">Clear</button>
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

        {data.getAllPackages.length > 0 && (
          <div className="pb-4 pl-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <div className="mt-4  flex space-x-4">
        <button
          className={`bg-mainColorAdminDash text-white px-4 py-2 rounded ${
            data.getAllPackages.length == 0
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
          onClick={exportToPDFPackageList}
          disabled={data.getAllPackages.length == 0}
        >
          Exportation PDF
        </button>
        <button
          className={`bg-mainColorAdminDash text-white px-4 py-2 rounded ${
            data.getAllPackages.length == 0
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
          onClick={exportToExcel}
          disabled={data.getAllPackages.length == 0}
        >
          Exportation Excel
        </button>
        <button
          className={`bg-mainColorAdminDash text-white px-4 py-2 rounded `}
        >
          + Ajouter une commande
        </button>
      </div>
    </div>
  );
};

export default CommandesPage;
