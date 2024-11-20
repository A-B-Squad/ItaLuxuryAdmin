"use client";

import React, { useEffect, useState } from "react";
import { LuPackage2 } from "react-icons/lu";
import { MdOutlineAttachMoney } from "react-icons/md";
import moment from "moment-timezone";
import { useQuery } from "@apollo/client";
import { GET_PACKAGES_QUERY } from "../../graph/queries";
import Stats from "./components/stats";
import SmallSpinner from "../components/SmallSpinner";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_TIMEZONE = "Africa/Tunis";

interface Checkout {
  id: string;
  total: number;
  freeDelivery: boolean;
}

interface Package {
  id: string;
  checkoutId: string;
  status: string;
  createdAt: string;
  Checkout: Checkout;
}

interface PackageData {
  getAllPackages: Package[];
}

interface Stats {
  orders: number[];
  earnings: number[];
}
const DELIVERY_PRICE = 8;

const getStats = (packages: Package[]): Stats => {
  const stats: Stats = {
    orders: [0, 0, 0, 0, 0],
    earnings: [0, 0, 0, 0, 0],
  };

  packages.forEach((pkg) => {
    if (pkg.status === "PAYED_AND_DELIVERED") {
      const packageDate = moment.tz(parseInt(pkg.createdAt), DEFAULT_TIMEZONE);
      const earningsAfterDelivery = pkg.Checkout.freeDelivery
        ? pkg.Checkout.total 
        : pkg.Checkout.total - DELIVERY_PRICE;

      if (packageDate.isSame(moment(), "day")) {
        stats.orders[0]++;
        stats.earnings[0] += earningsAfterDelivery;
      } else if (packageDate.isSame(moment().subtract(1, "days"), "day")) {
        stats.orders[1]++;
        stats.earnings[1] += earningsAfterDelivery;
      }
      if (packageDate.isSame(moment(), "week")) {
        stats.orders[2]++;
        stats.earnings[2] += earningsAfterDelivery;
      }
      if (packageDate.isSame(moment(), "month")) {
        stats.orders[3]++;
        stats.earnings[3] += earningsAfterDelivery;
      }
      if (packageDate.isSame(moment(), "year")) {
        stats.orders[4]++;
        stats.earnings[4] += earningsAfterDelivery;
      }
    }
  });
  return stats;
};

const DashboardPage: React.FC = () => {
  const { toast } = useToast();

  const [packageData, setPackageData] = useState<Package[]>([]);
  const [stats, setStats] = useState<Stats>({
    orders: [0, 0, 0, 0, 0],
    earnings: [0, 0, 0, 0, 0],
  });

  const { loading, data, error } = useQuery<PackageData>(GET_PACKAGES_QUERY, {
    onCompleted: (data) => {
      if (data) {
        setPackageData(data.getAllPackages);
      }
    },
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

  useEffect(() => {
    if (packageData.length) {
      const calculatedStats = getStats(packageData);
      setStats(calculatedStats);
    }
  }, [packageData]);

  const totalPayedPackagesCount = packageData.filter(
    (pkg) => pkg.status === "PAYED_AND_DELIVERED",
  ).length;

  const totalEarningsDelivered = packageData.reduce(
    (total, pkg) =>
      pkg.status === "PAYED_AND_DELIVERED" ? total + pkg.Checkout.total : total,
    0,
  );

  return (
    <div className="w-full py-10 lg:p-8 relative">
      <Stats />
      <div className="w-full mt-10 border shadow-md rounded-sm ">
        <h1 className="font-semibold py-5 px-4 border-b-2 w-full">
          Aperçu de votre tableau de bord
        </h1>
        <p className="px-4 py-2 text-sm text-gray-600 border-l-2 ml-3 mt-3 rounded  border-mainColorAdminDash  tracking-wider">
          Les tableaux ci-dessous montrent uniquement les commandes avec le
          statut (payées).
        </p>
        <div className="flex flex-col lg:flex-row justify-around mt-8 p-5">
          <div className="border w-full lg:w-[45%] rounded-sm bg-slate-50">
            <h1 className="flex  items-center tracking-wider gap-2 p-3 font-semibold text-sm w-full border-b-2">
              <LuPackage2 size={24} />
              Commandes payées
            </h1>
            <p className="px-3 text-xs text-gray-500 border-l-2 ml-3 mt-3 rounded border-mainColorAdminDash p-1 tracking-wider">
              Affiche uniquement les commandes payées
            </p>

            <div className="m-5 border  flex flex-col bg-white font-semibold text-gray-600 divide-y text-sm tracking-wider rounded-md">
              <div className="flex justify-between items-center   p-4">
                <span>Aujourd'hui</span>
                {loading ? <SmallSpinner /> : <span>{stats.orders[0]}</span>}
              </div>
              <div className="flex justify-between items-center   p-4">
                <span>Hier</span>
                {loading ? <SmallSpinner /> : <span>{stats.orders[1]}</span>}
              </div>
              <div className="flex justify-between items-center  p-4">
                <span>Cette semaine</span>
                {loading ? <SmallSpinner /> : <span>{stats.orders[2]}</span>}
              </div>
              <div className="flex justify-between items-center  p-4">
                <span>Ce mois-ci</span>
                {loading ? <SmallSpinner /> : <span>{stats.orders[3]}</span>}
              </div>
              <div className="flex justify-between items-center  p-4">
                <span>Cette année</span>
                {loading ? <SmallSpinner /> : <span>{stats.orders[4]}</span>}
              </div>
              <div className="flex font-bold justify-between items-center  p-4">
                <span>Total des commandes payées</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span className="font-bold">{totalPayedPackagesCount}</span>
                )}
              </div>
            </div>
          </div>
          <div className="border w-full lg:w-[45%]  rounded-sm bg-slate-50 ">
            <h1 className="flex items-center gap-2 font-semibold text-sm tracking-wider p-3 w-full border-b-2 ">
              <MdOutlineAttachMoney size={24} />
              Gains
            </h1>
            <p className="px-3 text-xs text-gray-500 border-l-2 ml-3 mt-3 rounded border-black  tracking-wider p-1">
              Affiche uniquement les gains des commandes payées
            </p>

            <div className="m-5 border  flex flex-col bg-white text-sm text-gray-600 font-semibold tracking-wider rounded-md divide-y ">
              <div className="flex justify-between items-center  p-4">
                <span>Aujourd'hui</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span>
                    {stats.earnings[0].toFixed(2)}
                    TND
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center  p-4">
                <span>Hier</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span>{stats.earnings[1].toFixed(2)} TND</span>
                )}
              </div>
              <div className="flex justify-between items-center border-b-2 p-4">
                <span>Cette semaine</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span>{stats.earnings[2].toFixed(2)} TND</span>
                )}
              </div>
              <div className="flex justify-between items-center border-b-2 p-4">
                <span>Ce mois-ci</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span>{stats.earnings[3].toFixed(2)} TND</span>
                )}
              </div>
              <div className="flex justify-between items-center border-b-2 p-4">
                <span>Cette année</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span>{stats.earnings[4].toFixed(2)} TND</span>
                )}
              </div>
              <div className="flex font-bold justify-between items-center border-b-2 p-4">
                <span>Total des gains</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span className="font-bold">
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
