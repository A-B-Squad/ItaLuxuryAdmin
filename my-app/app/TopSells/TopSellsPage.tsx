"use client";
import React, { useState, useMemo } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { BEST_SELLS_QUERY, SEARCH_PRODUCTS_QUERY } from "../graph/queries";
import {
  ADD_BEST_SELLS_MUTATIONS,
  DELETE_BEST_SELLS_MUTATIONS,
} from "../graph/mutations";

import { CategorySection } from "./Components/CategorySection";

// Define types for the API responses
interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  productDiscounts: any[]; // Replace 'any' with a more specific type if needed
  categories: {
    id: string;
    name: string;
    subcategories: any[]; // Replace 'any' with a more specific type if needed
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

interface CategoryState {
  id: string | null;
  name: string | null;
}

interface CategoryStates {
  [key: string]: CategoryState;
}

interface SearchInputs {
  [key: string]: string;
}

const TopSellsPage: React.FC = () => {
  const [searchInputs, setSearchInputs] = useState<SearchInputs>({});
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [categoryStates, setCategoryStates] = useState<CategoryStates>({
    category1: { id: null, name: null },
    category2: { id: null, name: null },
    category3: { id: null, name: null },
  });

  const { data: topSellsData, refetch } =
    useQuery<TopSellsData>(BEST_SELLS_QUERY);
  const [searchProducts] = useLazyQuery<SearchData>(SEARCH_PRODUCTS_QUERY);

  const [addProductToBestSells] = useMutation(ADD_BEST_SELLS_MUTATIONS);
  const [deleteProductFromBestSells] = useMutation(DELETE_BEST_SELLS_MUTATIONS);

  const categorizedProducts = useMemo<CategorizedProducts>(() => {
    if (!topSellsData) return {};

    return topSellsData.getBestSells.reduce(
      (acc: CategorizedProducts, item: BestSellItem) => {
        const categoryId = item.Category.id;
        if (!acc[categoryId]) {
          acc[categoryId] = {
            name: item.Category.name,
            products: [],
          };
        }
        acc[categoryId].products.push(item.Product);
        return acc;
      },
      {},
    );
  }, [topSellsData]);

  const handleSearch = async (categoryKey: string, value: string) => {
    setSearchInputs((prev) => ({ ...prev, [categoryKey]: value }));

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    const { data } = await searchProducts({
      variables: {
        input: {
          query: value,
          page: 1,
          pageSize: 20,
        },
      },
    });

    if (data) {
      setSearchResults(data.searchProducts.results.products);
    }
  };

  const handleAddToBestSells = async (
    productId: string,
    categoryId: string,
    categoryName: string,
  ) => {
    await addProductToBestSells({ variables: { productId, categoryId } });
    refetch();

    // Update category state if it's the first product
    setCategoryStates((prev) => {
      const emptyKey = Object.keys(prev).find((key) => prev[key].id === null);
      if (emptyKey) {
        return { ...prev, [emptyKey]: { id: categoryId, name: categoryName } };
      }
      return prev;
    });
  };

  const handleRemoveFromBestSells = async (
    productId: string,
    categoryId: string,
  ) => {
    await deleteProductFromBestSells({ variables: { productId } });
    await refetch();

    // Check if this was the last product in the category
    const updatedProducts = (await refetch()).data.getBestSells;
    const categoryProducts = updatedProducts.filter(
      (item: BestSellItem) => item.Category.id === categoryId,
    );

    if (categoryProducts.length === 0) {
      // If no products left, set the category state back to null
      setCategoryStates((prev) => {
        const categoryKey = Object.keys(prev).find(
          (key) => prev[key].id === categoryId,
        );
        if (categoryKey) {
          return { ...prev, [categoryKey]: { id: null, name: null } };
        }
        return prev;
      });
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Best Sells</h1>

      {Object.entries(categoryStates).map(([key, category], index) => (
        <CategorySection
          key={key}
          categoryId={category.id || ""}
          categoryName={category.name || `Category ${index + 1}`}
          products={
            category.id ? categorizedProducts[category.id]?.products || [] : []
          }
          searchResults={searchResults.filter(
            (product) =>
              !category.id ||
              product.categories.some((cat) => cat.id === category.id),
          )}
          searchInput={searchInputs[key] || ""}
          onSearch={(value: string) => handleSearch(key, value)}
          onAddToBestSells={handleAddToBestSells}
          onRemoveFromBestSells={(productId: string) =>
            handleRemoveFromBestSells(productId, category.id || "")
          }
        />
      ))}
    </div>
  );
};

export default TopSellsPage;
