"use client";
import React, { useState } from "react";
import { PACKAGES_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import SalesChart from "./Components/SalesChart";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import Loading from "../loading";
import DateRangePicker from "@/components/ui/date-range-picker";

const ProductPage = () => {
  const { loading, error, data } = useQuery(PACKAGES_QUERY);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 28),
    to: new Date(),
  });

  if (loading) return <Loading />;
  if (error) return (
    <div className="flex items-center justify-center h-96 bg-dashboard-neutral-50 rounded-lg">
      <div className="text-center p-6 bg-white rounded-lg shadow-md border border-dashboard-neutral-200">
        <h3 className="text-xl font-bold text-dashboard-neutral-800 mb-2">Erreur de chargement</h3>
        <p className="text-dashboard-neutral-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-dashboard-primary text-white px-4 py-2 rounded-md hover:bg-dashboard-primary-dark transition-all"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-dashboard-neutral-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-bold text-dashboard-neutral-800">Analyse des Produits</h1>

          {/* DateRangePicker component */}
          <div className="mt-3 md:mt-0">
            <DateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-dashboard-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dashboard-neutral-800">Produits les plus vendus</h2>
            </div>
            <div className="h-[400px]">
              <SalesChart data={data} dateRange={dateRange} />
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ProductPage;
