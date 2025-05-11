"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { IoSearch, IoClose, IoFilter, IoArrowUp, IoArrowDown } from "react-icons/io5";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReloadButton from "./ReloadPage";
import { debounce } from "lodash";

interface SearchBarProps {
  page:
  | "Products/Categories"
  | "Products/Inventory"
  | "Products/Reviews"
  | "Products/Reviews/AddReviews"
  | "Products"
  | "Coupons"
  | "TopDeals";
}

const SearchBarForTables: React.FC<SearchBarProps> = ({ page }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Update local state when URL params change
  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

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

  // Debounce search to improve performance
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      updateSearchParams(query, searchParams.get("order") || "default");
    }, 300),
    [updateSearchParams, searchParams]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchValue(newValue);
      debouncedSearch(newValue);
    },
    [debouncedSearch],
  );

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
    updateSearchParams("", searchParams.get("order") || "default");
  }, [updateSearchParams, searchParams]);

  const handleFilterChange = useCallback(
    (value: string) => {
      updateSearchParams(searchValue, value);
    },
    [updateSearchParams, searchValue],
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
        { value: "default", label: "Filtres de recherche", icon: <IoFilter /> },
        { value: "USED", label: "Utilisé", icon: null },
        { value: "UNUSED", label: "Non Utilisé", icon: null },
      ];
    } else if (
      page !== "Products/Categories" &&
      page !== "Products/Inventory" &&
      page !== "TopDeals"
    ) {
      return [
        { value: "default", label: "Filtres de recherche", icon: <IoFilter /> },
        { value: "ASC", label: "Prix : Croissant", icon: <IoArrowUp /> },
        { value: "DESC", label: "Prix : Décroissant", icon: <IoArrowDown /> },
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

  const currentOrder = searchParams.get("order") || "default";

  return (
    <form
      className="flex flex-col md:flex-row w-full gap-3 px-3 mb-6"
      onSubmit={(e) => {
        e.preventDefault();
        debouncedSearch.cancel();
        updateSearchParams(searchValue, searchParams.get("order") || "default");
      }}
    >
      <div className="relative flex flex-col sm:flex-row gap-3 w-full md:w-[80%]">
        <div className={`search w-full relative transition-all duration-200 group`}>
          <div className={`absolute inset-0 -m-0.5 rounded-lg ${isSearchFocused ? 'bg-gradient-to-r from-mainColorAdminDash/30 to-blue-500/30' : 'bg-transparent'} transition-all duration-300`}></div>
          <input
            onChange={handleInputChange}
            type="text"
            placeholder={placeholder}
            className="px-12 w-full h-11 relative border border-gray-300 rounded-lg outline-none transition-all bg-white shadow-sm focus:shadow-md"
            value={searchValue}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-mainColorAdminDash transition-colors">
            <IoSearch size={20} />
          </div>

          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
              aria-label="Effacer la recherche"
            >
              <IoClose size={18} />
            </button>
          )}
        </div>
        <div className="sm:w-auto">
          <ReloadButton />
        </div>
      </div>
      {showFilter && filterOptions && (
        <Select
          onValueChange={handleFilterChange}
          value={currentOrder}
        >
          <SelectTrigger className="w-full md:w-[20%] h-11 border-gray-300 bg-white shadow-sm hover:border-mainColorAdminDash transition-colors">
            <SelectValue placeholder="Filtres de recherche" />
          </SelectTrigger>
          <SelectContent className="border-gray-200 shadow-lg">
            <SelectGroup>
              {filterOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    {option.icon && <span className="text-gray-500">{option.icon}</span>}
                    <span>{option.label}</span>
                  </div>
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