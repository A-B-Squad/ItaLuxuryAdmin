"use client";
import React, { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_PACKAGES_QUERY } from "../../../graph/queries";
import SmallSpinner from "../../components/SmallSpinner";
import { translateStatus } from "../../Helpers/_translateStatus";
import { calculateDetailedStats } from "../../Helpers/DashboardStats/_calculateDetailedStats";
import { PackageData } from "@/app/types";
import { FaBoxOpen } from "react-icons/fa";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { LuCalendarClock } from "react-icons/lu";
import { BsCalendarMonth } from "react-icons/bs";

interface StatsPeriod {
  count: number;
  total: number;
}

interface PackageStats {
  today: StatsPeriod;
  thisWeek: StatsPeriod;
  thisMonth: StatsPeriod;
  thisYear: StatsPeriod;
  byStatus: Record<string, number>;
}

const Stats: React.FC = () => {
  const { loading: packagesLoading, error, data: packageData } =
    useQuery<PackageData>(GET_PACKAGES_QUERY, {
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true
    });

  const filteredPackages = useMemo(() => {
    if (!packageData) return [];
    return packageData.getAllPackages;
  }, [packageData]);

  const packageStats = useMemo(() => {
    if (!filteredPackages.length) {
      return {
        today: { count: 0, total: 0 },
        thisWeek: { count: 0, total: 0 },
        thisMonth: { count: 0, total: 0 },
        thisYear: { count: 0, total: 0 },
        byStatus: {}
      };
    }
    return calculateDetailedStats(filteredPackages);
  }, [filteredPackages]);

  const statCards = [
    { 
      title: "Commandes aujourd'hui", 
      period: "today" as const, 
      icon: <HiOutlineCalendarDays className="text-white text-xl" />,
      bgColor: "bg-blue-600"
    },
    { 
      title: "Commandes cette semaine", 
      period: "thisWeek" as const, 
      icon: <LuCalendarClock className="text-white text-xl" />,
      bgColor: "bg-purple-600"
    },
    { 
      title: "Commandes ce mois-ci", 
      period: "thisMonth" as const, 
      icon: <BsCalendarMonth className="text-white text-xl" />,
      bgColor: "bg-indigo-600"
    },
    { 
      title: "Commandes cette année", 
      period: "thisYear" as const, 
      icon: <FaBoxOpen className="text-white text-xl" />,
      bgColor: "bg-mainColorAdminDash"
    },
  ];

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      "PENDING": "bg-yellow-100 text-yellow-800",
      "CONFIRMED": "bg-blue-100 text-blue-800",
      "SHIPPED": "bg-indigo-100 text-indigo-800",
      "DELIVERED": "bg-green-100 text-green-800",
      "PAYED_AND_DELIVERED": "bg-emerald-100 text-emerald-800",
      "CANCELLED": "bg-red-100 text-red-800",
      "RETURNED": "bg-orange-100 text-orange-800",
      "REFUNDED": "bg-gray-100 text-gray-800",
    };
    
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span className="w-2 h-6 bg-mainColorAdminDash rounded-sm"></span>
        Tableau de bord des commandes
      </h2>
      
      <div className="w-full mt-4 mb-6 text-sm text-gray-600 border-l-2 rounded px-4 py-2 border-mainColorAdminDash left-3 tracking-wider bg-gray-50">
        <p>
          Ces statistiques excluent les commandes remboursées, annulées ou retournées.
        </p>
      </div>
      
      {error && (
        <div className="w-full p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600">
          <p className="font-medium">Erreur de chargement des données</p>
          <p className="text-sm">Veuillez rafraîchir la page ou réessayer plus tard.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ title, period, icon, bgColor }) => (
          <div
            key={period}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md"
          >
            <div className={`${bgColor} p-4 flex justify-between items-center`}>
              <h3 className="text-sm font-medium text-white">{title}</h3>
              {icon}
            </div>
            <div className="p-4">
              {packagesLoading ? (
                <div className="flex justify-center py-2">
                  <SmallSpinner />
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-800">
                    {packageStats[period].total.toFixed(2)} <span className="text-sm font-normal">DT</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <span className="font-semibold">{packageStats[period].count}</span> 
                    Commande{packageStats[period].count !== 1 ? "s" : ""}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <span className="w-1 h-5 bg-mainColorAdminDash rounded-sm"></span>
          Statut des commandes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.entries(packageStats.byStatus).map(([status, count]) => (
            <div 
              key={status} 
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 transition-all hover:shadow-md"
            >
              <div className={`inline-block px-2 py-1 rounded-md text-xs font-medium mb-2 ${getStatusColor(status)}`}>
                {translateStatus(status)}
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;