"use client";
import React, { useState, useCallback } from "react";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import { FiPlus, FiFilter, FiDownload } from "react-icons/fi";
import SearchBarForTables from "../components/SearchBarForTables";
import SmallSpinner from "../components/SmallSpinner";
import Pagination from "../components/Paginations";
import ProductTable from "./components/productTable";
import DeleteModal from "../components/DeleteModal";
import useProducts from "./hooks/UseProducts";
import { DELETE_PRODUCT_MUTATIONS } from "../../graph/mutations";
import { useToast } from "@/components/ui/use-toast";

const PAGE_SIZE = 12;

interface ProductsProps {
  searchParams: {
    q?: string;
    order?: "ASC" | "DESC";
    category?: string;
  };
}

const ProductPage = ({ searchParams }: ProductsProps) => {
  const { q: query, order } = searchParams;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { toast } = useToast();

  const {
    limitSearchedProducts,
    allProducts,
    loading,
    page,
    setPage,
    numberOfPages,
    fetchProducts,
  } = useProducts(query, order, PAGE_SIZE);

  const [deleteProductMutation] = useMutation(DELETE_PRODUCT_MUTATIONS);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProductMutation({
        variables: {
          productId: productToDelete.id,
        },
      });

      toast({
        title: "Produit supprimé",
        description: `Le produit "${productToDelete.name}" a été supprimé avec succès.`,
        className: "bg-green-600 text-white",
      });

      await fetchProducts();
      setProductToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="w-full">
      <div className="lg:container w-full bg-white border shadow-md rounded-lg overflow-hidden">
        <div className="flex justify-between items-center border-b-2 px-6 py-4">
          <h1 className="font-bold text-2xl text-gray-800">
            Produits{" "}
            <span className="text-gray-500 font-medium text-base ml-2">
              ({allProducts.length || 0})
            </span>
          </h1>

        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBarForTables page="Products" />
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/Products?order=${order === 'ASC' ? 'DESC' : 'ASC'}${query ? `&q=${query}` : ''}`}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="h-4 w-4" />
                <span>{order === 'DESC' ? 'Prix ↑' : 'Prix ↓'}</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <SmallSpinner />
            </div>
          ) : limitSearchedProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Aucun produit trouvé</p>
              <Link
                href="Products/CreateProduct"
                className="inline-flex items-center gap-2 text-white py-2 px-4 rounded-md shadow-md bg-mainColorAdminDash hover:bg-opacity-90 transition-all"
              >
                <FiPlus className="h-4 w-4" />
                <span>Ajouter un produit</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <ProductTable
                products={limitSearchedProducts}
                onDeleteClick={(product) => {
                  setProductToDelete(product);
                  setShowDeleteModal(true);
                }}
              />
            </div>
          )}

          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            {limitSearchedProducts.length > 0 && (
              <Pagination
                currentPage={page}
                totalPages={numberOfPages}
                onPageChange={setPage}
              />
            )}
            <p className="text-sm text-gray-500">
              Affichage de {limitSearchedProducts.length} sur {allProducts.length} produits
            </p>
          </div>
        </div>
      </div>

      {showDeleteModal && productToDelete && (
        <DeleteModal
          sectionName="Product"
          productName={productToDelete.name}
          onConfirm={handleDeleteProduct}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default ProductPage;
