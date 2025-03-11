"use client";

import React, { useRef } from "react";
import { useMutation } from "@apollo/client";

import SearchBarForTables from "@/app/(mainApp)/components/SearchBarForTables";
import SmallSpinner from "../../components/SmallSpinner";
import Pagination from "../../components/Paginations";
import InventoryTable from "./components/InventoryTable";
import { useToast } from "@/components/ui/use-toast";
import { UPDATE_PRODUCT_INVENTORY_MUTATION } from "@/app/graph/mutations";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import {
  calculateProfitMargin,
  calculateEarnings,
} from "../../Helpers/_calcProfit";
import useProducts from "../hooks/UseProducts";

interface Product {
  id: string;
  name: string;
  reference: string;
  solde: number;
  inventory: number;
  price: number;
  purchasePrice: number;
  broken: number;
  images: string[];
  categories: any[];
}

interface InventoryProps {
  searchParams: {
    q?: string;
    order?: "ASC" | "DESC";
  };
}

const Inventory: React.FC<InventoryProps> = ({ searchParams }) => {
  const { q: query, order } = searchParams;
  const { toast } = useToast();

  const [updateInventory] = useMutation(UPDATE_PRODUCT_INVENTORY_MUTATION);

  const PAGE_SIZE = 10;

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const {
    limitSearchedProducts,
    loading,
    page,
    allProducts,
    setPage,
    numberOfPages,
    fetchProducts,
  } = useProducts(query, order, PAGE_SIZE);

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Define the main color as a tuple
    const mainColor: [number, number, number] = [32, 41, 57];

    // Add a title
    doc.setFontSize(18);
    doc.setTextColor(...mainColor);
    doc.text("Rapport d'Inventaire", 14, 22);

    // Add a separation line
    doc.setLineWidth(0.5);
    doc.line(14, 25, 282, 25);

    // Format the current date and time
    const currentDate = new Date();
    const formattedDate = currentDate
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    const formattedTime = currentDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Add a subtitle with date and time
    doc.setFontSize(12);
    doc.text(`Généré le: ${formattedDate} à ${formattedTime}`, 14, 32);

    // Calculate totals
    const totalEarnings = allProducts.reduce(
      (sum, product) =>
        sum + calculateEarnings(product.price, product.purchasePrice),
      0,
    );
    const totalInventory = allProducts.reduce(
      (sum, product) => sum + product.inventory,
      0,
    );
    // Add the total number of products
    const totalProducts = allProducts.length;
    doc.text(`Nombre total de produits: ${totalProducts}`, 14, 38);

    // Add the table with custom styles
    autoTable(doc, {
      startY: 40, // Starting position of the table
      head: [
        [
          "Nom",
          "Référence",
          "Prix d'achat",
          "Prix",
          "Marge bénéficiaire",
          "Gains",
          "Vendus",
          "Casse",
          "Inventaire",
        ],
      ],
      body: [
        ...allProducts.map((product) => [
          product.name,
          product.reference,
          product.purchasePrice.toFixed(2),
          product.price.toFixed(2),
          calculateProfitMargin(product.price, product.purchasePrice) + "%",
          calculateEarnings(product.price, product.purchasePrice).toFixed(2),
          product.solde,
          product.broken,
          product.inventory,
        ]),
        ["Total", "", "", "", "", totalEarnings.toFixed(2),"" ,"", totalInventory],
      ],
      styles: {
        fontSize: 10, // Cell font size
        cellPadding: 3, // Cell padding
      },
      headStyles: {
        fillColor: mainColor, // Header background color
        textColor: [255, 255, 255], // Header text color
        fontStyle: "bold", // Header font style
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Alternate row background color
      },
      columnStyles: {
        0: { cellWidth: "auto" }, // Nom
        1: { cellWidth: "auto" }, // Référence
        2: { cellWidth: "auto" }, // Prix
        3: { cellWidth: "auto" }, // Prix d'achat
        4: { cellWidth: "auto" }, // Marge bénéficiaire
        5: { cellWidth: "auto" }, // Gains
        6: { cellWidth: "auto" }, // Casse
        7: { cellWidth: "auto" }, // Inventaire
      },
      tableLineWidth: 0,
      margin: { top: 40 }, // Top margin of the table
    });

    // Save the PDF with date in the filename
    doc.save(`inventaire_${formattedDate}.pdf`);
  };

  const exportToExcel = () => {
    // Préparer les données
    const data = [
      [
        "Nom",
        "Référence",
        "Prix d'achat",
        "Prix",
        "Marge bénéficiaire",
        "Gains",
        "Casse",
        "Vendus",
        "Inventaire",
      ], // En-têtes
      ...allProducts.map((product) => [
        product.name,
        product.reference,
        product.purchasePrice.toFixed(2),
        product.price.toFixed(2),
        calculateProfitMargin(product.price, product.purchasePrice) + "%",
        calculateEarnings(product.price, product.purchasePrice).toFixed(2),
        product.solde,
        product.broken,
        product.inventory,
      ]),
    ];

    // Calculer les totaux
    const totalEarnings = allProducts.reduce(
      (sum, product) =>
        sum + calculateEarnings(product.price, product.purchasePrice),
      0,
    );
    const totalInventory = allProducts.reduce(
      (sum, product) => sum + product.inventory,
      0,
    );

    // Add the total number of products
    const totalProducts = allProducts.length;
    data.push([
      `Nombre total de produits: ${totalProducts}`, 
      "",
      "",
      "",
      "",
      totalEarnings.toFixed(2),
      "",
      "",
      totalInventory,
    ]);
    // Créer une feuille de calcul
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Ajouter des styles de cellule
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "204060" } },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };
    const cellStyle = {
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };
    const totalStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E0E0E0" } },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    // Appliquer les styles aux en-têtes
    for (let i = 0; i < data[0].length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!ws[cellRef]) ws[cellRef] = { t: "s" };
      ws[cellRef].s = headerStyle;
    }

    // Appliquer les styles aux cellules de données
    for (let r = 1; r < data.length; r++) {
      for (let c = 0; c < data[0].length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: "s" };
        ws[cellRef].s = r === data.length - 1 ? totalStyle : cellStyle;
      }
    }

    // Ajouter des largeurs de colonnes
    const wscols = [
      { wch: 20 }, // "Nom" colonne
      { wch: 20 }, // "Référence" colonne
      { wch: 10 }, // "Prix" colonne
      { wch: 15 }, // "Prix d'achat" colonne
      { wch: 20 }, // "Marge bénéficiaire" colonne
      { wch: 15 }, // "Gains" colonne
      { wch: 10 }, // "Casse" colonne
      { wch: 15 }, // "Inventaire" colonne
    ];
    ws["!cols"] = wscols;

    // Créer un classeur et ajouter la feuille de calcul
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventaire");

    // Format the current date
    const currentDate = new Date();
    const formattedDate = currentDate
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    // Écrire le fichier avec la date dans le nom
    XLSX.writeFile(wb, `inventaire_${formattedDate}.xlsx`);
  };
  const handleAddToInventory = async (productId: string) => {
    const inputValue = inputRefs.current[productId]?.value;
    if (!inputValue) {
      toast({
        title: "Erreur : Informations manquantes",
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires.",
        duration: 5000,
      });
      return;
    }

    const inventoryToAdd = parseInt(inputValue, 10);

    if (isNaN(inventoryToAdd)) {
      console.error("Invalid inventory value");
      return;
    }

    try {
      const { data: updateData } = await updateInventory({
        variables: {
          productId,
          inventory: inventoryToAdd,
        },
      });

      if (updateData && updateData.addProductInventory) {
        await fetchProducts();

        if (inputRefs.current[productId] !== null) {
          inputRefs.current[productId]!.value = "";
        }

        toast({
          title: "Succès",
          className: "text-white bg-green-600 border-0",
          description: "L'inventaire a été mis à jour avec succès.",
          duration: 3000,
        });

        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description:
          "Une erreur est survenue lors de la mise à jour de l'inventaire.",
        duration: 5000,
      });
    }
  };
  return (
    <div className="w-full">
      <div className="container w-full pb-5">
        <h1 className="font-bold text-2xl py-5 px-4 w-full">
          Produits{" "}
          <span className="text-gray-600 font-medium text-base">
            ({limitSearchedProducts.length || 0})
          </span>
        </h1>
        <div className="mt-5 ">
          <SearchBarForTables page="Products/Inventory" />
          <div className="flex justify-end space-x-4 mb-4">
            <button
              onClick={exportToPDF}
              className="bg-mainColorAdminDash text-white px-4 py-2 rounded"
            >
              Exporter PDF
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Exporter Excel
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center ">
              <SmallSpinner />
            </div>
          ) : (
            <InventoryTable
              products={limitSearchedProducts}
              inputRefs={inputRefs}
              handleAddToInventory={handleAddToInventory}
            />
          )}
          {limitSearchedProducts.length >= 0 && (
            <Pagination
              currentPage={page}
              totalPages={numberOfPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
