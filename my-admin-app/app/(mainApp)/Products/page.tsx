import React from "react";
import ProductPage from "./ProductPage";
interface ProductsProps {
  searchParams: {
    q?: string;
    order?: "ASC" | "DESC";
  };
}
const page = ({ searchParams }: ProductsProps) => {
  return <ProductPage searchParams={searchParams} />;
};

export default page;
