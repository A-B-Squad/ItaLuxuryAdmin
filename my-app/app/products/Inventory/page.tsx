"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLazyQuery, useMutation } from "@apollo/client";

import SearchBar from "../../components/SearchBar";
import SmallSpinner from "../../components/SmallSpinner";
import Pagination from "../../components/Paginations";
import InventoryTable from "./components/InventoryTable";
import { useToast } from "@/components/ui/use-toast";
import { SEARCH_PRODUCTS_QUERY } from "@/app/graph/queries";
import { UPDATE_PRODUCT_INVENTORY_MUTATION } from "@/app/graph/mutations";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
interface Product {
  id: string;
  name: string;
  reference: string;
  solde: number;
  inventory: number;
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

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [updateInventory] = useMutation(UPDATE_PRODUCT_INVENTORY_MUTATION);

  const PAGE_SIZE = 10;
  const numberOfPages = useMemo(
    () => Math.ceil(totalCount / PAGE_SIZE),
    [totalCount],
  );

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [searchProducts, { loading, refetch }] = useLazyQuery(
    SEARCH_PRODUCTS_QUERY,
    {
      onCompleted: (data) => {
        const fetchedProducts = data.searchProducts?.results?.products || [];
        setTotalCount(data.searchProducts?.totalCount || 0);

        const sortedProducts = order
          ? [...fetchedProducts].sort((a, b) =>
              order === "ASC" ? a.price - b.price : b.price - a.price,
            )
          : fetchedProducts;

        setProducts(sortedProducts);
      },
      onError: (error) => {
        console.error("Error fetching products:", error);
        toast({
          title: "Erreur",
          description:
            "Impossible de récupérer les produits. Veuillez réessayer.",
          className: "text-white bg-red-600 border-0",
          duration: 5000,
        });
      },
    },
  );

  const fetchProducts = useCallback(() => {
    searchProducts({
      variables: {
        input: {
          query: query || undefined,
          page,
          pageSize: PAGE_SIZE,
        },
      },
    });
  }, [searchProducts, query, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Define the main color as a tuple
    const mainColor: [number, number, number] = [32, 41, 57];

    // Add a title
    doc.setFontSize(18);
    doc.setTextColor(...mainColor);
    doc.text("Rapport d'Inventaire", 14, 22);

    // Add a separation line
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    // Format the current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = currentDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Add a subtitle with date and time
    doc.setFontSize(12);
    doc.text(`Généré le: ${formattedDate} à ${formattedTime}`, 14, 32);

    // Add the table with custom styles
    autoTable(doc, {
      startY: 40, // Starting position of the table
      head: [["Nom", "Référence", "Solde", "Inventaire"]],
      body: products.map((product) => [
        product.name,
        product.reference,
        product.solde,
        product.inventory,
      ]),
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
      margin: { top: 40 }, // Top margin of the table
    });

    // Save the PDF
    doc.save("inventaire.pdf");
  };
  const exportToExcel = () => {
    // Préparer les données
    const data = [
      ["Nom", "Référence", "Solde", "Inventaire"], // En-têtes
      ...products.map((product) => [
        product.name,
        product.reference,
        product.solde,
        product.inventory,
      ]),
    ];

    // Créer une feuille de calcul
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Ajouter des largeurs de colonnes
    const wscols = [
      { wch: 20 }, // "Nom" colonne
      { wch: 20 }, // "Référence" colonne
      { wch: 10 }, // "Solde" colonne
      { wch: 15 }, // "Inventaire" colonne
    ];
    ws["!cols"] = wscols;

    // Créer un classeur et ajouter la feuille de calcul
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventaire");

    // Écrire le fichier
    XLSX.writeFile(wb, "inventaire.xlsx");
  };

  const handleAddToInventory = async (productId: string) => {
    const inputValue = inputRefs.current[productId]?.value;
    if (!inputValue) {
      toast({
        title: "Erreur : Informations manquantes",
        className: "text-white bg-red-600 border-0",
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
      console.log(updateData, "kd,lk,d");

      if (updateData && updateData.addProductInventory) {
        await refetch();

        if (inputRefs.current[productId]) {
          inputRefs.current[productId].value = "";
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
        className: "text-white bg-red-600 border-0",
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
            ({products.length || 0})
          </span>
        </h1>
        <div className="mt-5 ">
          <SearchBar page="Products/Inventory" />
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
              products={products}
              inputRefs={inputRefs}
              handleAddToInventory={handleAddToInventory}
            />
          )}
          {products.length > 0 && (
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
