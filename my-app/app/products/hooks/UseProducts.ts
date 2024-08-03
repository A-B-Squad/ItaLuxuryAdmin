"use client";
import { useState, useCallback, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_PRODUCTS_QUERY } from "@/app/graph/queries";

const useProducts = (
  query: string | undefined,
  order: "ASC" | "DESC" | undefined,
  pageSize: number,
) => {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchProducts] = useLazyQuery(SEARCH_PRODUCTS_QUERY);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await searchProducts({
        variables: {
          input: {
            query: query || undefined,
            page,
            pageSize,
          },
        },
      });

      let fetchedProducts = [
        ...(data?.searchProducts?.results?.products || []),
      ];
      if (order === "ASC") {
        fetchedProducts.sort((a, b) => a.price - b.price);
      } else if (order === "DESC") {
        fetchedProducts.sort((a, b) => b.price - a.price);
      }

      setProducts(fetchedProducts);
      setTotalCount(data?.searchProducts?.totalCount || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, order, searchProducts]);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  return {
    products,
    totalCount,
    loading,
    page,
    setPage,
    fetchProducts,
  };
};

export default useProducts;
