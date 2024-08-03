import React from "react";
import TopDealsPage from "./TopDealsPage";
interface ProductsProps {
  searchParams: {
    q?: string;
  };
}
const page = ({ searchParams }: ProductsProps) => {
  return <TopDealsPage />;
};

export default page;
