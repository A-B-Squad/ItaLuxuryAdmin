"use client";
import { SEARCH_PRODUCTS_QUERY } from "@/app/graph/queries";
import { useOutsideClick } from "@/app/Helpers/_outsideClick";
import { useLazyQuery } from "@apollo/client";
import Image from "next/image";
import React, { ChangeEvent, useRef, useState } from "react";

interface SearchProductProps {
  onProductSelect: (product: any) => void;
}

const SearchProduct: React.FC<SearchProductProps> = ({ onProductSelect }) => {
  const [showSearchProduct, setShowSearchProduct] = useState<Boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [searchProducts, { loading, data, error }] = useLazyQuery(
    SEARCH_PRODUCTS_QUERY,
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
    setShowSearchProduct(true);

    searchProducts({
      variables: {
        input: {
          query: inputValue,
          page: 1,
          pageSize: 20,
        },
      },
    });
  };

  const clickOutside = useOutsideClick(() => {
    setShowSearchProduct(false);
  });

  return (
    <div className="relative w-full" ref={clickOutside}>
      <input
        ref={inputRef}
        className="w-full my-3 px-4 py-2 border rounded-md text-sm outline-none focus:border-blue-500"
        type="text"
        placeholder="Rechercher un produit"
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => setShowSearchProduct(true)}
      />

      {data && showSearchProduct && (
        <div
          className={`search-results bg-white absolute border w-full ${
            showSearchProduct ? "visible" : "invisible"
          } left-0 mt-1 max-h-60 overflow-y-auto rounded-md shadow-lg z-10`}
        >
          <div className="py-4">
            <h3 className="font-bold mb-2 px-4 text-gray-700">
              Résultat de la recherche: (
              {data.searchProducts.results.products.length})
            </h3>
            <div className="flex flex-col">
              {data.searchProducts.results.products.map((product: any) => (
                <div
                  key={product.id}
                  className="product-item flex items-center border-b last:border-none hover:bg-gray-50 px-4 py-2 transition-colors cursor-pointer"
                  onClick={() => {
                    onProductSelect(product);
                    setShowSearchProduct(false);
                    setSearchQuery("");
                  }}
                >
                  <div className="relative w-10 h-10 mr-4">
                    <Image
                      layout="fill"
                      src={product.images[0]}
                      objectFit="contain"
                      alt={product.name}
                    />
                  </div>
                  <p className="text-base font-medium text-gray-800">
                    {product.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchProduct;
