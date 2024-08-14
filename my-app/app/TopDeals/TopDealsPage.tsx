"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import SmallSpinner from "../components/SmallSpinner";
import {
  ADD_PRODUCT_TO_TOP_DEALS_MUTATION,
  DELETE_PRODUCT_FROM_DEALS_MUTATION,
} from "../graph/mutations";
import DeleteModal from "../components/DeleteModal";
import { PRODUCT_IN_TOP_DEALS } from "../graph/queries";
import SearchProduct from "../components/searchProduct";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  productDiscounts: Array<{ Discount: { percentage: number } }>;
}

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
    if (
      product.productDiscounts.length === 0 ||
      product.productDiscounts[0].Discount.percentage === 0
    ) {
      toast({
        title: "Attention",
        description:
          "Ce produit n'a pas de réduction active. Il ne peut pas être ajouté aux meilleures offres.",
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

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 py-8">
      <div className="shadow-lg rounded-lg  bg-white">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Meilleures offres
          </h1>
        </div>
        <div className="p-6">
          <SearchProduct onProductSelect={handleAddToTopDeals} />
          {loading ? (
            <div className="flex justify-center py-10">
              <SmallSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {data?.allDeals.map((deal: any) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row"
                >
                  <Image
                    height={500}
                    width={500}
                    src={deal.product.images[0]}
                    alt={deal.product.name}
                    className="md:w-1/3 w-full object-cover"
                  />
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {deal.product.name}
                      </h2>
                      <p className="text-gray-600 mt-2 inline-block ">
                        Prix original:
                        <span className="line-through">
                          {" "}
                          {deal.product.price.toFixed(3)} DT
                        </span>
                      </p>
                      <p className="text-green-600 font-semibold mt-1">
                        Nouveau prix:{" "}
                        {deal.product.productDiscounts[0]?.newPrice?.toFixed(3)}{" "}
                        DT
                      </p>
                      <p className="text-blue-600 font-semibold mt-1">
                        Réduction:{" "}
                        {deal.product.productDiscounts[0]?.Discount?.percentage}
                        %
                      </p>
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
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors mt-4 self-start"
                    >
                      Supprimer
                    </button>
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
