"use client";
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { FETCH_ALL_BASKET } from "@/app/graph/queries";
import Image from "next/image";
import Link from "next/link";
import prepRoute from "@/app/(mainApp)/Helpers/_prepRoute";
import { FaInfoCircle } from "react-icons/fa";
import Loading from "../loading";

interface ProductDiscount {
  newPrice: number;
}

interface Subcategory {
  name: string;
  id: string;
  subcategories: Subcategory[];
}

interface Category {
  name: string;
  id: string;
  subcategories: Subcategory[];
}

interface Product {
  id: string;
  reference: string;
  name: string;
  price: number;
  images: string[];
  productDiscounts: ProductDiscount[];
  categories: Category[];
}

interface BasketItem {
  reference: string;
  id: string;
  userId: string;
  quantity: number;
  Product: Product;
}

const ClientAbandonedBasketPage: React.FC = () => {
  const { data, loading, error } = useQuery(FETCH_ALL_BASKET);
  const [selectedBasket, setSelectedBasket] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error) return <div>Erreur: {error.message}</div>;

  const basketItems: BasketItem[] = data?.fetchAllBasket || [];

  // Group items by userId
  const baskets = basketItems.reduce(
    (acc, item) => {
      if (!acc[item.userId]) {
        acc[item.userId] = [];
      }
      acc[item.userId].push(item);
      return acc;
    },
    {} as Record<string, BasketItem[]>,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-start">
        Paniers Abandonnés{" "}
      </h1>
      {Object.keys(baskets).length === 0 ? (
        <p className="text-center text-gray-600">
          Aucun panier abandonné trouvé.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Liste des paniers</h2>
            {Object.entries(baskets).map(([userId, items]) => (
              <div
                key={userId}
                className={`p-4 mb-2 rounded-lg cursor-pointer transition duration-300 ${
                  selectedBasket === userId
                    ? "bg-mainColorAdminDash text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedBasket(userId)}
              >
                <p className="font-semibold">ID Utilisateur: {userId}</p>
                <p>{items.length} produit(s)</p>
              </div>
            ))}
          </div>
          <div className="md:col-span-2 border p-4 rounded-lg shadow-lg">
            {selectedBasket ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Produits dans le panier
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {baskets[selectedBasket].length > 0 ? (
                    baskets[selectedBasket].map((item) => (
                      <Link
                        href={{
                          pathname: `${
                            process.env.NEXT_PUBLIC_BASE_URL_DOMAIN
                          }/products/tunisie/${prepRoute(item.Product.name)}`,
                          query: {
                            productId: item.Product.id,
                            collection: [
                              // Get the name of the first category
                              item.Product.categories[0]?.name,
                              // Get the ID of the first category
                              item.Product.categories[0]?.id,
                              // Get the name of the first subcategory of the first category, if available
                              item.Product.categories[0]?.subcategories[0]
                                ?.name,
                              // Get the ID of the first subcategory of the second category, if available
                              item.Product.categories[1]?.subcategories[0]?.id,
                              // Get the name of the second subcategory of the first category, if available
                              item.Product.categories[0]?.subcategories[1]
                                ?.name,
                              // Get the ID of the second subcategory of the first category, if available
                              item.Product.categories[0]?.subcategories[1]?.id,
                              // Get the product name
                              item.Product.name,
                            ],
                          },
                        }}
                        target="_blank"
                        key={item.id}
                        className="bg-white w-full cursor-pointer shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-105"
                      >
                        <div className="relative h-48 w-full">
                          <Image
                            layout="fill"
                            objectFit="cover"
                            src={item.Product.images[0]}
                            alt={item.Product.name}
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2 text-gray-800">
                            {item.Product.name}{" "}
                            <FaInfoCircle
                              size={15}
                              className="inline-block ml-2"
                            />
                          </h3>
                          <p className="text-gray-600 mb-1">
                            <span className="font-semibold">Référence:</span>{" "}
                            {item.Product.reference}
                          </p>
                          <p className="text-gray-600 mb-1">
                            <span className="font-semibold">Quantité:</span>{" "}
                            {item.quantity}
                          </p>
                          <p className="text-gray-600 mb-1">
                            <span className="font-semibold">Prix:</span>{" "}
                            {item.Product.productDiscounts.length > 0
                              ? item.Product.productDiscounts[0].newPrice.toFixed(
                                  3,
                                )
                              : item.Product.price.toFixed(3)}{" "}
                            TND
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Catégorie:</span>{" "}
                            {item.Product.categories[0]?.name || "N/A"}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p>Aucun produit dans ce panier.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="flex items-center justify-center">
                Sélectionnez un panier pour voir les produits.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAbandonedBasketPage;
