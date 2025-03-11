"use client";
import { SEARCH_PRODUCTS_QUERY } from "@/app/graph/queries";
import { useOutsideClick } from "@/app/(mainApp)/Helpers/_outsideClick";
import { useLazyQuery } from "@apollo/client";
import Image from "next/image";
import React, { ChangeEvent, useRef, useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FaSearch, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { debounce } from "lodash";
interface SearchProductProps {
  onProductSelect: (product: any) => void;
}

const SearchProduct: React.FC<SearchProductProps> = ({ onProductSelect }) => {
  const { toast } = useToast();
  const [showSearchProduct, setShowSearchProduct] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [searchProducts, { data, loading }] = useLazyQuery(SEARCH_PRODUCTS_QUERY, {
    onError: (error) => {
      console.error("Error searching products:", error);
      toast({
        title: "Erreur de recherche",
        description:
          "Une erreur est survenue lors de la recherche des produits. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsLoading(false);
    },
    onCompleted: () => {
      setIsLoading(false);
    },
  });

  // Debounce search to improve performance
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        searchProducts({
          variables: {
            input: {
              query,
              page: 1,
              pageSize: 20,
            },
          },
        });
      }
    }, 300),
    [searchProducts]
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);

    if (inputValue.trim().length > 1) {
      setShowSearchProduct(true);
      debouncedSearch(inputValue);
    } else if (inputValue.trim() === "") {
      setShowSearchProduct(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSearchProduct(false);
    inputRef.current?.focus();
  };

  const clickOutside = useOutsideClick(() => {
    setShowSearchProduct(false);
  });

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const products = data?.searchProducts.results.products || [];

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < products.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && selectedIndex >= 0 && products[selectedIndex]) {
      onProductSelect(products[selectedIndex]);
      setShowSearchProduct(false);
      setSearchQuery("");
      setSelectedIndex(-1);
    } else if (e.key === "Escape") {
      setShowSearchProduct(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8" ref={clickOutside}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          className="w-full my-3 pl-10 pr-10 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-mainColorAdminDash focus:border-mainColorAdminDash transition-all"
          type="text"
          placeholder="Rechercher un produit par nom ou référence..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchQuery.trim().length > 1 && setShowSearchProduct(true)}
          onKeyDown={handleKeyDown}
          aria-label="Rechercher un produit"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Effacer la recherche"
          >
            {isLoading ? (
              <FaSpinner className="h-4 w-4 animate-spin" />
            ) : (
              <FaTimesCircle className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {data && showSearchProduct && (
        <div
          className="search-results bg-white absolute border w-full left-0 mt-1 max-h-[60vh] overflow-y-auto rounded-md shadow-lg z-10"
        >
          <div className="py-4">
            <h3 className="font-bold mb-2 px-4 text-gray-700 text-sm sm:text-base flex items-center justify-between">
              <span>
                Résultat de la recherche: ({data.searchProducts.results.products.length})
              </span>
              {isLoading && <FaSpinner className="animate-spin h-4 w-4 text-gray-500" />}
            </h3>

            {data.searchProducts.results.products.length > 0 ? (
              <div className="flex flex-col">
                {data.searchProducts.results.products.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className={`product-item flex items-center border-b last:border-none px-2 sm:px-4 py-2 transition-colors cursor-pointer ${selectedIndex === index ? "bg-mainColorAdminDash/10" : "hover:bg-gray-50"
                      }`}
                    onClick={() => {
                      onProductSelect(product);
                      setShowSearchProduct(false);
                      setSearchQuery("");
                      setSelectedIndex(-1);
                    }}
                  >
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 mr-3 sm:mr-4 flex-shrink-0 border rounded-md overflow-hidden bg-gray-50">
                      <Image
                        fill
                        src={product.images[0]}
                        className="object-contain"
                        alt={product.name}
                        sizes="(max-width: 640px) 2.5rem, 3rem"
                        priority={index < 5}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-800 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        Réf: {product.reference} | Prix: {product.price.toFixed(3)} TND
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                Aucun produit trouvé pour "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchProduct;