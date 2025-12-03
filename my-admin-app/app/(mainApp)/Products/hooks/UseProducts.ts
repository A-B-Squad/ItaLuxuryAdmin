"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_PRODUCTS_QUERY } from "@/app/graph/queries";

const useProducts = (
  query: string | undefined,
  sortBy?: "createdAt" | "price" | "name" | "isVisible" | "outOfStock",
  pageSize?: number,
  sortOrder: "asc" | "desc" = "desc",
) => {
  const [limitSearchedProducts, setLimitSearchedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchProducts] = useLazyQuery(SEARCH_PRODUCTS_QUERY);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: searchedProductWithLimit } = await searchProducts({
        variables: {
          input: {
            query: query || undefined,
            page,
            pageSize,
            sortBy: sortBy ,
            sortOrder: sortOrder ,
            visibleProduct: sortBy === "isVisible" ? (sortOrder === "asc" ? true : false) : undefined
          },
        },
        fetchPolicy: "cache-and-network",
      });

      // Fetch all products for total count (without pagination)
      const { data: allSearchedProduct } = await searchProducts({
        variables: {
          input: {
            query: query || undefined,
            page: 1,
            pageSize: 1000, 
            sortBy: sortBy || "createdAt",
            sortOrder: sortOrder || "desc",
          },
        },
        fetchPolicy: "cache-and-network",
      });

      let fetchedProducts = [
        ...(searchedProductWithLimit?.searchProducts?.results?.products || []),
      ];

      setLimitSearchedProducts(fetchedProducts);
      setTotalCount(searchedProductWithLimit?.searchProducts?.totalCount || 0);
      setAllProducts(
        allSearchedProduct?.searchProducts?.results?.products || [],
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, sortBy, sortOrder, searchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [query, page, sortBy, sortOrder, fetchProducts]);

  const numberOfPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / (pageSize || 12))),
    [totalCount, pageSize],
  );

  return {
    limitSearchedProducts,
    totalCount,
    loading,
    page,
    setPage,
    fetchProducts,
    numberOfPages,
    searchProducts,
    allProducts,
  };
};

export default useProducts;
