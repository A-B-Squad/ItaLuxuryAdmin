"use client";
import React, { useState, useMemo, useCallback } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { BEST_SELLS_QUERY, SEARCH_PRODUCTS_QUERY } from "@/app/graph/queries";
import {
  ADD_BEST_SELLS_MUTATIONS,
  DELETE_BEST_SELLS_MUTATIONS,
} from "@/app/graph/mutations";
import { CategorySection } from "./Components/CategorySection";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  productDiscounts: any[];
  categories: {
    id: string;
    name: string;
    subcategories: any[];
  }[];
}

interface Category {
  id: string;
  name: string;
}

interface BestSellItem {
  Product: Product;
  Category: Category;
}

interface TopSellsData {
  getBestSells: BestSellItem[];
}

interface SearchData {
  searchProducts: {
    results: {
      products: Product[];
    };
  };
}

interface CategorizedProducts {
  [key: string]: {
    name: string;
    products: Product[];
  };
}

interface SearchInputs {
  [key: string]: string;
}

const TopSellsPage = () => {
  const [searchInputs, setSearchInputs] = useState<SearchInputs>({});
  const [searchResults, setSearchResults] = useState<{
    [key: string]: Product[];
  }>({});
  const { toast } = useToast();

  const {
    data: topSellsData,
    loading: topSellsLoading,
    refetch,
  } = useQuery<TopSellsData>(BEST_SELLS_QUERY);

  const [searchProducts, { loading: searchLoading }] = useLazyQuery<SearchData>(
    SEARCH_PRODUCTS_QUERY,
  );

  const [addProductToBestSells, { loading: addLoading }] = useMutation(ADD_BEST_SELLS_MUTATIONS);
  const [deleteProductFromBestSells, { loading: deleteLoading }] = useMutation(DELETE_BEST_SELLS_MUTATIONS);

  // Memoize categorized products to improve performance
  const categorizedProducts = useMemo<CategorizedProducts>(() => {
    if (!topSellsData) return {};

    return topSellsData.getBestSells.reduce(
      (acc: CategorizedProducts, item: BestSellItem) => {
        const mainCategory = item.Product.categories[0];
        const categoryId = mainCategory.id;
        if (!acc[categoryId]) {
          acc[categoryId] = {
            name: mainCategory.name,
            products: [],
          };
        }
        acc[categoryId].products.push(item.Product);
        return acc;
      },
      {},
    );
  }, [topSellsData]);

  // Get selected products as a Set for efficient lookup
  const getSelectedProducts = useCallback(() => {
    return new Set(
      Object.values(categorizedProducts).flatMap((category) =>
        category.products.map((product) => product.id),
      ),
    );
  }, [categorizedProducts]);

  // Handle search with debounce
  const handleSearch = useCallback(async (categoryKey: string, value: string) => {
    setSearchInputs((prev) => ({ ...prev, [categoryKey]: value }));

    if (value.trim() === "") {
      setSearchResults((prev) => ({ ...prev, [categoryKey]: [] }));
      return;
    }

    try {
      const { data } = await searchProducts({
        variables: {
          input: {
            query: value,
            page: 1,
            pageSize: 20,
            visibleProduct: true,
          },
        },
      });

      if (data) {
        const selectedProductIds = getSelectedProducts();
        const filteredProducts = data.searchProducts.results.products.filter(
          (product) => !selectedProductIds.has(product.id),
        );
        setSearchResults((prev) => ({
          ...prev,
          [categoryKey]: filteredProducts,
        }));
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Erreur de recherche",
        description: "Une erreur s'est produite lors de la recherche",
        variant: "destructive",
      });
    }
  }, [getSelectedProducts, searchProducts, toast]);

  // Get the top 3 categories or use default placeholders to always show 3 cards
  const getTopCategories = useMemo(() => {
    const entries = Object.entries(categorizedProducts);
    const result = [...entries];

    // If we have less than 3 categories, add placeholder categories
    if (result.length < 3) {
      const placeholders: [string, { name: string; products: Product[] }][] = [
        ["category1", { name: "Catégorie 1", products: [] }],
        ["category2", { name: "Catégorie 2", products: [] }],
        ["category3", { name: "Catégorie 3", products: [] }],
      ];

      // Add only as many placeholders as needed to reach 3 total
      for (let i = result.length; i < 3; i++) {
        result.push(placeholders[i]);
      }
    }

    // Ensure we only have 3 categories max
    return result.slice(0, 3);
  }, [categorizedProducts]);

  // Get all category IDs for validation
  const allowedCategoryIds = useMemo(() => {
    return new Set(getTopCategories.map(([categoryId]) => categoryId));
  }, [getTopCategories]);

  // Modified handleAddToBestSells to check category limit
  const handleAddToBestSells = useCallback(async (
    productId: string,
    categoryId: string,
    categoryName: string,
  ) => {
    // Check if we already have 3 categories and this is a new one
    const existingCategories = Object.keys(categorizedProducts);
    if (existingCategories.length >= 3 && !existingCategories.includes(categoryId)) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez sélectionner que 3 catégories principales pour les meilleures ventes.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addProductToBestSells({ variables: { productId, categoryId } });
      await refetch();
      toast({
        title: "Succès",
        description: `Produit ajouté aux meilleures ventes de ${categoryName}`,
        className: "bg-green-600 text-white",
      });
    } catch (error) {
      console.error("Add to Best Sells error:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'ajout du produit aux meilleures ventes",
        variant: "destructive",
      });
    }
  }, [addProductToBestSells, categorizedProducts, refetch, toast]);



  const handleRemoveFromBestSells = useCallback(async (
    productId: string,
  ) => {
    try {
      await deleteProductFromBestSells({ variables: { productId } });
      await refetch();
      toast({
        title: "Succès",
        description: "Produit supprimé des meilleures ventes",
        className: "bg-blue-600 text-white",
      });
    } catch (error) {
      console.error("Remove from Best Sells error:", error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression du produit des meilleures ventes",
        variant: "destructive",
      });
    }
  }, [deleteProductFromBestSells, refetch, toast]);


  // In the return statement, use getTopCategories instead of getAllCategories
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meilleures Ventes</h1>
        <p className="text-gray-600 mt-2">
          Gérez les produits qui apparaissent dans les sections "Meilleures Ventes" sur votre site.
        </p>
      </div>

      {topSellsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg shadow-md overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-blue-600/40 to-indigo-700/40 px-6 py-4 animate-pulse">
                <div className="h-6 w-3/4 bg-white/50 rounded-md"></div>
              </div>
              <div className="p-6">
                <div className="h-10 w-full bg-gray-200 rounded-md mb-6 animate-pulse"></div>
                <div className="space-y-4">
                  <div className="h-20 w-full bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-20 w-full bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-20 w-full bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getTopCategories.map(([categoryId, category], index) => {
            const categoryKey = `category${index + 1}`;
            // Ensure category is the correct type
            const categoryData = typeof category === 'string' ? { name: category, products: [] } : category;

            return (
              <div
                key={String(categoryId)}
                className="border rounded-lg shadow-md overflow-hidden bg-white transition-all hover:shadow-lg"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    {categoryData.name}
                  </h2>
                </div>
                <div className="p-6">
                  <CategorySection
                    categoryId={String(categoryId)}
                    categoryName={categoryData.name}
                    products={categoryData.products}
                    searchResults={searchResults[categoryKey] || []}
                    searchInput={searchInputs[categoryKey] || ""}
                    onSearch={(value: string) => handleSearch(categoryKey, value)}
                    onAddToBestSells={handleAddToBestSells}
                    onRemoveFromBestSells={(productId: string) =>
                      handleRemoveFromBestSells(productId)
                    }
                    isSearchLoading={searchLoading}
                    isAddLoading={addLoading}
                    isDeleteLoading={deleteLoading}
                  />

                  {categoryData.products.length === 0 && (
                    <div className="text-center py-8 px-4 bg-gray-50 rounded-lg mt-4">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-3"
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
                      <p className="text-gray-600 font-medium">
                        Aucun produit dans cette catégorie
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Utilisez la recherche ci-dessus pour ajouter des produits
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopSellsPage;
