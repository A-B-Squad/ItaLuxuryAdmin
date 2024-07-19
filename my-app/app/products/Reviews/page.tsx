"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client";

import SearchBar from "../../components/SearchBar";
import SmallSpinner from "../../components/SmallSpinner";
import Pagination from "../../components/Paginations";
import ReviewsTable from "./components/ReviewsTable";
import { SEARCH_PRODUCTS_QUERY } from "@/app/graph/queries";

interface Product {
  id: string;
  name: string;
  reference: string;
  solde: number;
  inventory: number;
  images: string[];
  categories: any[];
  reviews: { rating: number }[];
}

interface InventoryProps {
  searchParams: {
    q?: string;
    order?: "ASC" | "DESC";
  };
}

const Reviews: React.FC<InventoryProps> = ({ searchParams }) => {
  const { q: query, order } = searchParams;

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 10;
  const numberOfPages = Math.ceil(totalCount / PAGE_SIZE);

  const [searchProducts] = useLazyQuery(SEARCH_PRODUCTS_QUERY);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await searchProducts({
        variables: {
          input: {
            query: query || undefined,
            page,
            pageSize: PAGE_SIZE,
          },
        },
      });

      let fetchedProducts = [
        ...(data?.searchProducts?.results?.products || []),
      ];

      if (order) {
        fetchedProducts.sort((a, b) =>
          order === "ASC" ? a.price - b.price : b.price - a.price,
        );
      }

      setProducts(fetchedProducts);
      setTotalCount(data?.searchProducts?.totalCount || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, query, order, searchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="w-full">
      <div className="container w-full pb-5">
        <h1 className="font-bold text-2xl py-5 px-4 w-full">
          Produits{" "}
          <span className="text-gray-600 font-medium text-base">
            ({products.length || 0})
          </span>
        </h1>
        <div className="mt-5 ">
          <SearchBar page="Products/Reviews" />
          {loading ? (
            <div className="flex justify-center ">
              <SmallSpinner />
            </div>
          ) : (
            <ReviewsTable products={products} />
          )}
          {products.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={numberOfPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
