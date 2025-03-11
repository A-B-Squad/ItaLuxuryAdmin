"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { LuPackage2 } from "react-icons/lu";
import { MdOutlineAttachMoney } from "react-icons/md";
import moment from "moment-timezone";
import { useQuery } from "@apollo/client";
import { GET_PACKAGES_QUERY } from "../../graph/queries";
import Stats from "./components/stats";
import SmallSpinner from "../components/SmallSpinner";
import { useToast } from "@/components/ui/use-toast";
import { calculateSimpleStats } from "../Helpers/DashboardStats/_calculateSimpleStats";
import { Package, PackageData } from "@/app/types";

const DEFAULT_TIMEZONE = "Africa/Tunis";


interface Stats {
  orders: number[];
  earnings: number[];
}
const DELIVERY_PRICE = 8;

const DashboardPage: React.FC = () => {
  const { toast } = useToast();

  const { loading, error, data } = useQuery<PackageData>(GET_PACKAGES_QUERY, {
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error(error);
      toast({
        title: "Erreur de chargement",
        description:
          "Une erreur est survenue lors du chargement des données du tableau de bord. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const packageData = useMemo(() => data?.getAllPackages || [], [data]);

  const stats = useMemo(() => {
    if (!packageData.length) {
      return {
        orders: [0, 0, 0, 0, 0],
        earnings: [0, 0, 0, 0, 0],
      };
    }
    return calculateSimpleStats(packageData);
  }, [packageData]);

  const { totalPayedPackagesCount, totalEarningsDelivered } = useMemo(() => {
    const currentYear = moment().year();
    const payedCount = packageData.filter(
      (pkg) =>
        pkg.status === "PAYED_AND_DELIVERED" &&
        moment.tz(parseInt(pkg.createdAt), DEFAULT_TIMEZONE).year() === currentYear
    ).length;

    const earnings = packageData.reduce(
      (total, pkg) => {
        const packageDate = moment.tz(parseInt(pkg.createdAt), DEFAULT_TIMEZONE);
        return pkg.status === "PAYED_AND_DELIVERED" && packageDate.year() === currentYear
          ? (pkg.Checkout.freeDelivery
            ? total + pkg.Checkout.total
            : total + pkg.Checkout.total - DELIVERY_PRICE)
          : total;
      },
      0
    );

    return { totalPayedPackagesCount: payedCount, totalEarningsDelivered: earnings };
  }, [packageData]);

  return (
    <div className="w-full py-10 lg:p-8 relative">
      <Stats />
      
      {error && (
        <div className="w-full p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600">
          <p className="font-medium">Erreur de chargement des données</p>
          <p className="text-sm">Veuillez rafraîchir la page ou réessayer plus tard.</p>
        </div>
      )}
      
      <div className="w-full mt-10 border shadow-md rounded-md overflow-hidden bg-white">
        <h1 className="font-semibold py-5 px-6 border-b w-full bg-gray-50 text-gray-800">
          Aperçu de votre tableau de bord
        </h1>
        <p className="px-6 py-3 text-sm text-gray-600 border-l-3 ml-4 mt-4 rounded border-mainColorAdminDash tracking-wider bg-gray-50 max-w-fit">
          Les tableaux ci-dessous montrent uniquement les commandes avec le
          statut (payées).
        </p>
        
        <div className="flex flex-col lg:flex-row justify-between gap-6 mt-6 p-6">
          {/* Orders Card */}
          <div className="border w-full lg:w-[48%] rounded-md bg-white shadow-sm transition-all hover:shadow-md">
            <h1 className="flex items-center tracking-wider gap-2 p-4 font-semibold text-sm w-full border-b bg-gray-50 text-gray-800">
              <LuPackage2 size={24} className="text-mainColorAdminDash" />
              Commandes payées
            </h1>
            <p className="px-4 py-2 text-xs text-gray-500 border-l-2 ml-4 mt-3 rounded border-mainColorAdminDash tracking-wider max-w-fit">
              Affiche uniquement les commandes payées
            </p>

            <div className="m-5 border flex flex-col bg-white font-medium text-gray-700 divide-y text-sm tracking-wider rounded-md overflow-hidden">
              {[
                { label: "Aujourd'hui", value: stats.orders[0] },
                { label: "Hier", value: stats.orders[1] },
                { label: "Cette semaine", value: stats.orders[2] },
                { label: "Ce mois-ci", value: stats.orders[3] },
                { label: "Cette année", value: stats.orders[4] },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 hover:bg-gray-50">
                  <span>{item.label}</span>
                  {loading ? <SmallSpinner /> : <span className="font-semibold">{item.value}</span>}
                </div>
              ))}
              <div className="flex font-bold justify-between items-center p-4 bg-gray-50">
                <span>Total des commandes payées</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span className="font-bold text-mainColorAdminDash">{totalPayedPackagesCount}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Earnings Card */}
          <div className="border w-full lg:w-[48%] rounded-md bg-white shadow-sm transition-all hover:shadow-md">
            <h1 className="flex items-center gap-2 font-semibold text-sm tracking-wider p-4 w-full border-b bg-gray-50 text-gray-800">
              <MdOutlineAttachMoney size={24} className="text-green-600" />
              Gains
            </h1>
            <p className="px-4 py-2 text-xs text-gray-500 border-l-2 ml-4 mt-3 rounded border-green-600 tracking-wider max-w-fit">
              Affiche uniquement les gains des commandes payées
            </p>

            <div className="m-5 border flex flex-col bg-white text-sm text-gray-700 font-medium tracking-wider rounded-md divide-y overflow-hidden">
              {[
                { label: "Aujourd'hui", value: stats.earnings[0] },
                { label: "Hier", value: stats.earnings[1] },
                { label: "Cette semaine", value: stats.earnings[2] },
                { label: "Ce mois-ci", value: stats.earnings[3] },
                { label: "Cette année", value: stats.earnings[4] },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 hover:bg-gray-50">
                  <span>{item.label}</span>
                  {loading ? (
                    <SmallSpinner />
                  ) : (
                    <span className="font-semibold">{item.value.toFixed(2)} TND</span>
                  )}
                </div>
              ))}
              <div className="flex font-bold justify-between items-center p-4 bg-gray-50">
                <span>Total des gains</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span className="font-bold text-green-600">
                    {totalEarningsDelivered.toFixed(2)} TND
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
