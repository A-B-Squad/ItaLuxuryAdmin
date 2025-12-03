"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import SmallSpinner from "@/app/(mainApp)/components/SmallSpinner";
import {
  ADD_PRODUCT_TO_TOP_DEALS_MUTATION,
  DELETE_PRODUCT_FROM_DEALS_MUTATION,
} from "@/app/graph/mutations";
import DeleteModal from "@/app/(mainApp)/components/DeleteModal";
import { PRODUCT_IN_TOP_DEALS } from "@/app/graph/queries";
import SearchProduct from "@/app/(mainApp)/components/searchProduct";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  productDiscounts: Array<{ Discount: { percentage: number }; newPrice?: number }>;
}

const MAX_TOP_DEALS = 2;

const TopDealsPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();

  const [deleteProductFromDealsMutation] = useMutation(
    DELETE_PRODUCT_FROM_DEALS_MUTATION,
  );
  const [addProductToTopDealsMutation] = useMutation(
    ADD_PRODUCT_TO_TOP_DEALS_MUTATION,
  );
  const { data, loading, refetch } = useQuery(PRODUCT_IN_TOP_DEALS);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProductFromDealsMutation({
        variables: {
          productId: productToDelete.id,
        },
      });
      await refetch();
      setProductToDelete(null);
      setShowDeleteModal(false);
      toast({
        title: "Succès",
        description: "Produit supprimé des meilleures offres avec succès.",
        variant: "default",
        className: "bg-mainColorAdminDash text-white",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erreur",
        description:
          "Erreur lors de la suppression du produit des meilleures offres.",
        variant: "destructive",
      });
    }
  };

  const handleAddToTopDeals = async (product: Product) => {
    // Check if product has discounts
    if (product.productDiscounts.length === 0) {
      toast({
        title: "Attention",
        description:
          "Ce produit n'a pas de réduction active. Il ne peut pas être ajouté aux meilleures offres.",
        variant: "destructive",
      });
      return;
    }

    // Check if we've reached the maximum number of products
    if (data?.allDeals?.length >= MAX_TOP_DEALS) {
      toast({
        title: "Limite atteinte",
        description: `Vous ne pouvez pas ajouter plus de ${MAX_TOP_DEALS} produits aux meilleures offres.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await addProductToTopDealsMutation({
        variables: {
          productId: product.id,
        },
      });
      await refetch();
      toast({
        title: "Succès",
        description: "Produit ajouté aux meilleures offres avec succès.",
        className: "bg-mainColorAdminDash text-white",
      });
    } catch (error) {
      console.error("Error adding product to top deals:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du produit aux meilleures offres.",
        variant: "destructive",
      });
    }
  };

  const calculateDiscount = (originalPrice: number, newPrice: number) => {
    if (!originalPrice || !newPrice) return 0;
    return Math.round(((originalPrice - newPrice) / originalPrice) * 100);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 py-8">
      <div className="shadow-lg rounded-lg bg-white overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700">
          <h1 className="text-2xl font-bold text-white">
            Meilleures offres
          </h1>
          <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            {data?.allDeals?.length || 0} / {MAX_TOP_DEALS} produits
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Ajouter un produit</h2>
            <p className="text-sm text-gray-600 mb-4">
              Recherchez et ajoutez des produits avec des réductions actives aux meilleures offres.
            </p>
            <SearchProduct onProductSelect={handleAddToTopDeals} />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <SmallSpinner />
            </div>
          ) : data?.allDeals?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune offre ajoutée</h3>
              <p className="text-gray-600">Utilisez la recherche ci-dessus pour ajouter des produits en promotion.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {data?.allDeals.map((deal: any) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-2/5 h-48">
                      <Image
                        fill
                        src={deal.product.images[0] || "/placeholder-product.png"}
                        alt={deal.product.name}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{calculateDiscount(
                          deal.product.price,
                          deal.product?.productDiscounts[0]?.newPrice
                        )}%
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 line-clamp-2 mb-2">
                          {deal.product.name}
                        </h2>
                        <div className="flex items-center mb-1">
                          <span className="text-gray-500 text-sm mr-2">Prix original:</span>
                          <span className="line-through text-gray-500">
                            {deal.product.price.toFixed(3)} DT
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-800 text-sm mr-2">Nouveau prix:</span>
                          <span className="text-green-600 font-semibold text-lg">
                            {deal.product?.productDiscounts[0]?.newPrice?.toFixed(3) || "N/A"} DT
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setProductToDelete({
                            id: deal.product.id,
                            name: deal.product.name,
                            productDiscounts: deal.product.productDiscounts,
                          });
                          setShowDeleteModal(true);
                        }}
                        className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default TopDealsPage;