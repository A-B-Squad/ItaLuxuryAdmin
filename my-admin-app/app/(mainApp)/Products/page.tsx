import React from "react";
import ProductPage from "./ProductPage";
interface ProductsProps {
  searchParams: {
    q?: string;
    sortBy?: "createdAt" | "price" | "name";
    sortOrder: "asc" | "desc"

  };
}
const page = ({ searchParams }: ProductsProps) => {
  return <ProductPage searchParams={searchParams} />;
};

export default page;
