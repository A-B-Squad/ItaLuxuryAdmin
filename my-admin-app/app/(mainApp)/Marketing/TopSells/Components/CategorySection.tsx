import React from "react";
import { ProductCard } from "./ProductCard";
import { SearchBar } from "./SearchBar";
import { FiSearch } from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  productDiscounts: any[];
  categories: {
    id: string;
    name: string;
  }[];
}

interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
  products: Product[]; 
  searchResults: Product[];
  searchInput: string;
  onSearch: (value: string) => void;
  onAddToBestSells: (productId: string, categoryId: string, categoryName: string) => void;
  onRemoveFromBestSells: (productId: string) => void;
  isSearchLoading?: boolean;
  isAddLoading?: boolean;
  isDeleteLoading?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categoryId,
  categoryName,
  products,
  searchResults,
  searchInput,
  onSearch,
  onAddToBestSells,
  onRemoveFromBestSells,
  isSearchLoading = false,
  isAddLoading = false,
  isDeleteLoading = false,
}) => {
  const displayProducts = searchInput ? searchResults : products;
  const isSearchMode = searchInput.trim().length > 0;

  return (
    <div>
      <div className="mb-6">
        <SearchBar 
          value={searchInput} 
          onChange={onSearch} 
          isLoading={isSearchLoading}
          placeholder={`Rechercher des produits pour ${categoryName}...`}
        />
      </div>

      {isSearchMode && searchResults.length === 0 && !isSearchLoading && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-600">
            Aucun produit trouvé pour <span className="font-medium">"{searchInput}"</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {isSearchMode && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 flex items-center">
              <FiSearch className="mr-1" size={14} />
              Résultats de recherche
              <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {searchResults.length}
              </span>
            </h3>
          </div>
        )}

        {!isSearchMode && products.length > 0 && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Produits en vedette
              <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            </h3>
          </div>
        )}

        {displayProducts.length > 0 ? (
          <div className="space-y-3">
            {displayProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                isBestSell={products.some((p) => p.id === product.id)}
                onAddToBestSells={() =>
                  onAddToBestSells(
                    product.id,
                    product.categories[0]?.id || categoryId,
                    product.categories[0]?.name || categoryName
                  )
                }
                onRemoveFromBestSells={() => onRemoveFromBestSells(product.id)}
                isAddLoading={isAddLoading}
                isDeleteLoading={isDeleteLoading}
              />
            ))}
          </div>
        ) : (
          !isSearchMode && (
            <div className="text-center py-6">
              <p className="text-gray-500">
                Utilisez la recherche pour ajouter des produits à cette catégorie.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
