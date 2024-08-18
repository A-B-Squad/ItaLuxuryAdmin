import React from "react";
import TopDealsPage from "./TopDealsPage";
interface ProductsProps {
  searchParams: {
    q?: string;
  };
}
const page = () => {
  return <TopDealsPage />;
};

export default page;
