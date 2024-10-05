"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_PRODUCTS_QUERY } from "@/app/graph/queries";

const useProducts = (
  query: string | undefined,
  order?: "ASC" | "DESC" | undefined,
  pageSize?: number,
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
          },
        },
        fetchPolicy: "cache-and-network",
      });
      const { data: allSearchedProduct } = await searchProducts({
        variables: {
          input: {
            query: query || undefined,
            page: 1,
            pageSize: undefined,
          },
        },
        fetchPolicy: "cache-and-network",
      });

      let fetchedProducts = [
        ...(searchedProductWithLimit?.searchProducts?.results?.products || []),
      ];
      if (order === "ASC") {
        fetchedProducts.sort((a, b) => a.price - b.price);
      } else if (order === "DESC") {
        fetchedProducts.sort((a, b) => b.price - a.price);
      }

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
  }, [page, pageSize, query, order, searchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [query, page]);

  const numberOfPages = useMemo(
    () => Math.ceil(totalCount / (pageSize || 0)),
    [totalCount],
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
