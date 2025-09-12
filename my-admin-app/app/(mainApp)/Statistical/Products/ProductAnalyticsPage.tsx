"use client";
import React, { useState } from "react";
import { PACKAGES_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import SalesChart from "./Components/SalesChart";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import Loading from "../loading";
import DateRangePicker from "@/components/ui/date-range-picker";
import HeaderTitle from "../Components/HeaderTitle";

const ProductAnalyticsPage = () => {
  const { loading, error, data } = useQuery(PACKAGES_QUERY);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 28),
    to: new Date(),
  });

  if (loading) return <Loading />

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-dashboard-neutral-50 p-2 md:p-6">
      <div className="max-w-7xl mx-auto">

        <HeaderTitle
          mainTitle={"Analyse des Produits"}
          subTitle={"Tableau de bord analytique pour le suivi des ventes par produit et région"}
        />
        {/* Date Range Picker Section */}
        <DateRangePicker
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        {/* Analytics Section */}
        <div className="my-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Analytics Avancés</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Analyse complète des ventes avec répartition géographique
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Données en temps réel</span>
              </div>
            </div>

            <SalesChart data={data} dateRange={dateRange} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsPage;