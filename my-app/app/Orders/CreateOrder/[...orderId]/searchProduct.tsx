"use client";
import { SEARCH_PRODUCTS_QUERY } from "@/app/graph/queries";
import { useOutsideClick } from "@/app/Helpers/_outsideClick";
import { useLazyQuery } from "@apollo/client";
import Image from "next/image";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

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
    <div className=" h-full" ref={inputRef}>
      <input
        ref={inputRef}
        className="w-full my-3 px-3 py-2 border-2 text-sm outline-none"
        type="text"
        placeholder="Rechercher un produit"
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => setShowSearchProduct(true)}
      />

      {data && showSearchProduct && (
        <div
          className={`search-results bg-white absolute border-2 w-full ${
            showSearchProduct ? "visible" : "invisible"
          }    left-0  h-[200px] overflow-y-auto  rounded-md shadow-lg z-10`}
        >
          <div className="py-4 overflow-y-auto">
            <h3 className="font-bold mb-2 px-4">
              Résultat de la recherche: (
              {data.searchProducts.results.products.length})
            </h3>
            <div
              className="flex flex-col h-96 overflow-y-auto"
              ref={clickOutside}
            >
              {data.searchProducts.results.products.map((product: any) => (
                <div
                  key={product.id}
                  className="product-item flex items-center  border-b  hover:bg-gray-50 mx-h-96 transition-shadow cursor-pointer"
                  onClick={() => {
                    onProductSelect(product);
                    setShowSearchProduct(false);
                    setSearchQuery("");
                  }}
                >
                  <div className="relative w-10 h-10 mb-2">
                    <Image
                      layout="fill"
                      src={product.images[0]}
                      objectFit="contain"
                      alt={product.name}
                    />
                  </div>
                  <p className="text-base font-light tracking-widest text-center">
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
