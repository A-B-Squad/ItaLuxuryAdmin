"use client";

import React, { useCallback, useMemo } from "react";
import { IoSearch } from "react-icons/io5";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      if (newOrder && newOrder !== "default") {
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
      updateSearchParams(
        e.target.value,
        searchParams.get("order") || "default",
      );
    },
    [updateSearchParams, searchParams],
  );

  const handleFilterChange = useCallback(
    (value: string) => {
      updateSearchParams(searchParams.get("q") || "", value);
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
      return [
        { value: "default", label: "Filtres de recherche" },
        { value: "USED", label: "Utilisé" },
        { value: "UNUSED", label: "Non Utilisé" },
      ];
    } else if (
      page !== "Products/Categories" &&
      page !== "Products/Inventory" &&
      page !== "TopDeals"
    ) {
      return [
        { value: "default", label: "Filtres de recherche" },
        { value: "ASC", label: "prix : Asc" },
        { value: "DESC", label: "prix : Desc" },
      ];
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
      {showFilter && filterOptions && (
        <Select
          onValueChange={handleFilterChange}
          defaultValue={searchParams.get("order") || "default"}
        >
          <SelectTrigger className="w-[20%]">
            <SelectValue placeholder="Filtres de recherche" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </form>
  );
};

export default SearchBarForTables;
