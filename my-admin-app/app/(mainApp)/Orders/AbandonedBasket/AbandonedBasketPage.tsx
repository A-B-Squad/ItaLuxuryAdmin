"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { FETCH_ALL_BASKET } from "@/app/graph/queries";
import Image from "next/image";
import Link from "next/link";
import { FaInfoCircle, FaShoppingCart, FaUser } from "react-icons/fa";
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
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Memoize basket grouping for performance
  const baskets = useMemo(() => {
    const basketItems: BasketItem[] = data?.fetchAllBasket || [];
    return basketItems.reduce(
      (acc, item) => {
        if (!acc[item.userId]) {
          acc[item.userId] = [];
        }
        acc[item.userId].push(item);
        return acc;
      },
      {} as Record<string, BasketItem[]>,
    );
  }, [data]);

  // Filter baskets based on search term
  const filteredBaskets = useMemo(() => {
    if (!searchTerm) return Object.entries(baskets);
    
    return Object.entries(baskets).filter(([userId]) => 
      userId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [baskets, searchTerm]);

  // Calculate total value of a basket
  const calculateBasketValue = (items: BasketItem[]): number => {
    return items.reduce((total, item) => {
      const price = item.Product.productDiscounts.length > 0
        ? item.Product.productDiscounts[0].newPrice
        : item.Product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  if (loading) return <Loading />;
  
  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0 text-red-500">
            <FaInfoCircle size={24} />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Erreur de chargement</h3>
            <p className="mt-2 text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Paniers Abandonnés
        </h1>
        <div className="mt-4 md:mt-0 relative">
          <input
            type="text"
            placeholder="Rechercher par ID utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-mainColorAdminDash focus:border-mainColorAdminDash outline-none transition-all"
          />
          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {filteredBaskets.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <FaShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-600 text-lg">
            {searchTerm ? "Aucun panier ne correspond à votre recherche." : "Aucun panier abandonné trouvé."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white shadow-md rounded-lg p-4 h-fit">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
              Liste des paniers ({filteredBaskets.length})
            </h2>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {filteredBaskets.map(([userId, items]) => (
                <div
                  key={userId}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedBasket === userId
                      ? "bg-mainColorAdminDash text-white border-transparent shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  }`}
                  onClick={() => setSelectedBasket(userId)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold truncate max-w-[70%]" title={userId}>
                      ID: {userId.substring(0, 8)}...
                    </p>
                    <span className="bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                      {items.length} {items.length > 1 ? "produits" : "produit"}
                    </span>
                  </div>
                  <p className={`text-sm ${selectedBasket === userId ? "text-white" : "text-gray-600"}`}>
                    Valeur: {calculateBasketValue(items).toFixed(3)} TND
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white shadow-md rounded-lg p-6">
            {selectedBasket ? (
              <>
                <div className="flex justify-between items-center mb-6 pb-3 border-b">
                  <h2 className="text-xl font-semibold">
                    Détails du panier
                  </h2>
                  <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {baskets[selectedBasket].length} {baskets[selectedBasket].length > 1 ? "produits" : "produit"} · 
                    {" "}{calculateBasketValue(baskets[selectedBasket]).toFixed(3)} TND
                  </div>
                </div>
                
                {baskets[selectedBasket].length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {baskets[selectedBasket].map((item, index) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <Link
                          href={`${process.env.NEXT_PUBLIC_BASE_URL_DOMAIN}/products/tunisie?productId=${item.Product.id}`}
                          target="_blank"
                          className="block"
                        >
                          <div className="relative h-48 w-full bg-gray-100">
                            <Image
                              src={item.Product.images[0]}
                              alt={item.Product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              priority={index < 2}
                              className="object-contain"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
                                {item.Product.name}
                              </h3>
                              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                                x{item.quantity}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">
                                <span className="font-semibold">Référence:</span>{" "}
                                {item.Product.reference}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-semibold">Catégorie:</span>{" "}
                                {item.Product.categories[0]?.name || "N/A"}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-semibold">Prix unitaire:</span>{" "}
                                {item.Product.productDiscounts.length > 0 ? (
                                  <span>
                                    <span className="line-through text-gray-400 mr-1">
                                      {item.Product.price.toFixed(3)}
                                    </span>
                                    {item.Product.productDiscounts[0].newPrice.toFixed(3)}
                                  </span>
                                ) : (
                                  item.Product.price.toFixed(3)
                                )}{" "}
                                TND
                              </p>
                              <p className="font-semibold text-mainColorAdminDash">
                                Total: {((item.Product.productDiscounts.length > 0
                                  ? item.Product.productDiscounts[0].newPrice
                                  : item.Product.price) * item.quantity).toFixed(3)} TND
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Aucun produit dans ce panier.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <FaShoppingCart size={48} className="mb-4 text-gray-300" />
                <p>Sélectionnez un panier pour voir les produits.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAbandonedBasketPage;
