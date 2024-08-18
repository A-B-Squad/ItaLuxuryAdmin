"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { BEST_SELLS_QUERY, SEARCH_PRODUCTS_QUERY } from "../graph/queries";
import {
  ADD_BEST_SELLS_MUTATIONS,
  DELETE_BEST_SELLS_MUTATIONS,
} from "../graph/mutations";
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
    error: topSellsError,
    refetch,
  } = useQuery<TopSellsData>(BEST_SELLS_QUERY);

  const [searchProducts, { loading: searchLoading }] = useLazyQuery<SearchData>(
    SEARCH_PRODUCTS_QUERY,
  );

  const [addProductToBestSells] = useMutation(ADD_BEST_SELLS_MUTATIONS);
  const [deleteProductFromBestSells] = useMutation(DELETE_BEST_SELLS_MUTATIONS);

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

  const getSelectedProducts = () => {
    return new Set(
      Object.values(categorizedProducts).flatMap((category) =>
        category.products.map((product) => product.id),
      ),
    );
  };

  const handleSearch = async (categoryKey: string, value: string) => {
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
  };

  const handleAddToBestSells = async (
    productId: string,
    categoryId: string,
    categoryName: string,
  ) => {
    try {
      await addProductToBestSells({ variables: { productId, categoryId } });
      await refetch();
      toast({
        title: "Succès",
        description: "Produit ajouté aux meilleures ventes",
      });
    } catch (error) {
      console.error("Add to Best Sells error:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'ajout du produit aux meilleures ventes",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromBestSells = async (
    productId: string,
    categoryId: string,
  ) => {
    try {
      await deleteProductFromBestSells({ variables: { productId } });
      await refetch();
      toast({
        title: "Succès",
        description: "Produit supprimé des meilleures ventes",
      });
    } catch (error) {
      console.error("Remove from Best Sells error:", error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression du produit des meilleures ventes",
        variant: "destructive",
      });
    }
  };

  if (topSellsLoading) return <p>Chargement des meilleures ventes...</p>;
  if (topSellsError)
    return <p>Erreur de chargement : {topSellsError.message}</p>;

  const categories: [string, { name: string; products: Product[] }][] =
    Object.keys(categorizedProducts).length > 0
      ? Object.entries(categorizedProducts)
      : [
          ["category1", { name: "Catégorie 1", products: [] }],
          ["category2", { name: "Catégorie 2", products: [] }],
          ["category3", { name: "Catégorie 3", products: [] }],
        ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-12">
        Meilleures Ventes
      </h1>
      {categories.length === 0 ? (
        <p className="text-center">
          Aucune catégorie disponible pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(([categoryId, category], index) => {
            const categoryKey = `category${index + 1}`;
            return (
              <div
                key={categoryId}
                className="border rounded-lg shadow-md p-4 bg-white"
              >
                <CategorySection
                  categoryId={categoryId}
                  categoryName={category.name}
                  products={category.products}
                  searchResults={searchResults[categoryKey] || []}
                  searchInput={searchInputs[categoryKey] || ""}
                  onSearch={(value: string) => handleSearch(categoryKey, value)}
                  onAddToBestSells={handleAddToBestSells}
                  onRemoveFromBestSells={(productId: string) =>
                    handleRemoveFromBestSells(productId, categoryId)
                  }
                  isSearchLoading={searchLoading}
                />
                {category.products.length === 0 && (
                  <p className="text-center mt-4">
                    Aucun produit dans cette catégorie. Utilisez la recherche
                    pour ajouter des produits.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopSellsPage;
