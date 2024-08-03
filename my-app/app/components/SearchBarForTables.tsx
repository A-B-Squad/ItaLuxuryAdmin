"use client";

import React, { useCallback, useMemo } from "react";
import { IoSearch } from "react-icons/io5";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  page:
    | "Products/Categories"
    | "Products/Inventory"
    | "Products/Reviews"
    | "Products"
    | "Coupons"
    | "TopDeals";
}

const SearchBarForTables: React.FC<SearchBarProps> = ({ page }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearchParams = useCallback(
    (newQuery: string, newOrder: string) => {
      const params = new URLSearchParams(searchParams);
      if (newQuery) {
        params.set("q", newQuery);
      } else {
        params.delete("q");
      }
      if (newOrder) {
        params.set("order", newOrder);
      } else {
        params.delete("order");
      }
      router.push(`/${page}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, page],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSearchParams(e.target.value, searchParams.get("order") || "");
    },
    [updateSearchParams, searchParams],
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSearchParams(searchParams.get("q") || "", e.target.value);
    },
    [updateSearchParams, searchParams],
  );

  const placeholder = useMemo(() => {
    switch (page) {
      case "Products/Categories":
        return "Rechercher une catégorie";
      case "Coupons":
        return "Rechercher un coupon";
      default:
        return "Trouver un produit";
    }
  }, [page]);

  const filterOptions = useMemo(() => {
    if (page === "Coupons") {
      return (
        <>
          <option value="">Filtres de recherche</option>
          <option value="USED">Utilisé</option>
          <option value="UNUSED">Non Utilisé</option>
        </>
      );
    } else if (
      page !== "Products/Categories" &&
      page !== "Products/Inventory" &&
      page !== "TopDeals"
    ) {
      return (
        <>
          <option value="">Filtres de recherche</option>
          <option value="ASC">prix : Asc</option>
          <option value="DESC">prix : Desc</option>
        </>
      );
    }
    return null;
  }, [page]);

  const showFilter = useMemo(
    () =>
      page !== "Products/Categories" &&
      page !== "Products/Inventory" &&
      page !== "TopDeals",
    [page],
  );

  return (
    <form
      className="flex w-full gap-3 px-3 mb-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="relative flex w-[80%]">
        <input
          onChange={handleInputChange}
          type="text"
          placeholder={placeholder}
          className="px-10 w-full h-10 rounded-l border-2"
          defaultValue={searchParams.get("q") || ""}
        />
        <button
          type="submit"
          className="absolute left-1 bottom-2 text-gray-700 cursor-pointer"
        >
          <IoSearch size={24} />
        </button>
      </div>
      {showFilter && (
        <select
          onChange={handleFilterChange}
          className="w-[20%] h-10 border-2 border-sky-500 text-sky-500 rounded px-2 md:px-3 py-0 md:py-1 tracking-wider"
          defaultValue={searchParams.get("order") || ""}
        >
          {filterOptions}
        </select>
      )}
    </form>
  );
};

export default SearchBarForTables;
