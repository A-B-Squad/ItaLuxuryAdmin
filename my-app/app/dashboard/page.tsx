"use client";

import React, { useEffect, useState } from "react";
import { LuPackage2 } from "react-icons/lu";
import { MdOutlineAttachMoney } from "react-icons/md";
import moment from "moment-timezone";
import { useQuery } from "@apollo/client";
import { GET_PACKAGES_QUERY } from "../graph/queries";
import Stats from "../components/stats";
import SmallSpinner from "../components/SmallSpinner";

const DEFAULT_TIMEZONE = "Africa/Tunis";

interface Checkout {
  id: string;
  total: number;
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

const getStats = (packages: Package[]) => {
  const stats = {
    today: [0, 0],
    lastDay: [0, 0],
    thisWeek: [0, 0],
    thisMonth: [0, 0],
    thisYear: [0, 0],
  };

  packages.forEach((pkg) => {
    const packageDate = moment.tz(parseInt(pkg.createdAt), DEFAULT_TIMEZONE);
    if (pkg.status === "PAYED") {
      if (packageDate.isSame(moment(), "day")) {
        stats.today[0]++;
        stats.today[1] += pkg.Checkout.total;
      } else if (packageDate.isSame(moment().subtract(1, "days"), "day")) {
        stats.lastDay[0]++;
        stats.lastDay[1] += pkg.Checkout.total;
      } else if (packageDate.isSame(moment(), "week")) {
        stats.thisWeek[0]++;
        stats.thisWeek[1] += pkg.Checkout.total;
      } else if (packageDate.isSame(moment(), "month")) {
        stats.thisMonth[0]++;
        stats.thisMonth[1] += pkg.Checkout.total;
      }
      if (packageDate.isSame(moment(), "year")) {
        stats.thisYear[0]++;
        stats.thisYear[1] += pkg.Checkout.total;
      }
    }
  });
  return stats;
};

const Dashboard: React.FC = () => {
  const [packageData, setPackageData] = useState<Package[]>([]);
  const [stats, setStats] = useState({
    today: [0, 0],
    lastDay: [0, 0],
    thisWeek: [0, 0],
    thisMonth: [0, 0],
    thisYear: [0, 0],
  });

  const { loading, data, error } = useQuery<PackageData>(GET_PACKAGES_QUERY, {
    onCompleted: (data) => {
      if (data) {
        setPackageData(data.getAllPackages);
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    if (packageData.length) {
      const calculatedStats = getStats(packageData);
      setStats(calculatedStats);
    }
  }, [packageData]);

  const deliveredPackagesCount = packageData.filter(
    (pkg) => pkg.status === "PAYED"
  ).length;

  const totalEarningsDelivered = packageData.reduce(
    (total, pkg) =>
      pkg.status === "PAYED" ? total + pkg.Checkout.total : total,
    0
  );

  return (
    <div className="w-full p-8 relative">
      <Stats />
      <div className="w-full mt-10 border shadow-md rounded-sm ">
        <h1 className="font-semibold py-5 px-4 border-b-2 w-full">
          Aperçu de votre tableau de bord
        </h1>
        <div className="flex justify-around mt-8 p-5">
          <div className="border w-[45%] rounded-sm bg-slate-50">
            <h1 className="flex  items-center tracking-wider gap-2 p-3 font-semibold text-sm w-full border-b-2">
              <LuPackage2 size={24} />
              Commandes
            </h1>
            <div className="m-5 border  flex flex-col bg-white font-semibold text-gray-600 divide-y text-sm tracking-wider rounded-md">
              <div className="flex justify-between items-center   p-4">
                <span>Aujourd’hui</span>
                {loading ? <SmallSpinner /> : <span>{stats.today[0]}</span>}
              </div>
              <div className="flex justify-between items-center   p-4">
                <span >Hier</span>
                {loading ? <SmallSpinner /> : <span>{stats.lastDay[0]}</span>}
              </div>
              <div className="flex justify-between items-center  p-4">
                <span >Cette semaine</span>
                {loading ? <SmallSpinner /> : <span>{stats.thisWeek[0]}</span>}
              </div>
              <div className="flex justify-between items-center  p-4">
                <span >Ce mois-ci</span>
                {loading ? <SmallSpinner /> : <span>{stats.thisMonth[0]}</span>}
              </div>
              <div className="flex justify-between items-center  p-4">
                <span >Cette année</span>
                {loading ? <SmallSpinner /> : <span>{stats.thisYear[0]}</span>}
              </div>
              <div className="flex font-bold justify-between items-center  p-4">
                <span  >
                  Total des livraisons
                </span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span className="font-bold">{deliveredPackagesCount}</span>
                )}
              </div>
            </div>
          </div>
          <div className="border w-[45%] rounded-sm bg-slate-50 ">
            <h1 className="flex items-center gap-2 font-semibold text-sm tracking-wider p-3 w-full border-b-2 ">
              <MdOutlineAttachMoney size={24} />
              Gains
            </h1>
            <div className="m-5 border  flex flex-col bg-white text-sm text-gray-600 font-semibold tracking-wider rounded-md divide-y ">
              <div className="flex justify-between items-center  p-4">
                <span>Aujourd’hui</span>
                {loading ? <SmallSpinner /> : <span>{stats.today[1]} TND</span>}
              </div>
              <div className="flex justify-between items-center  p-4">
                <span>Hier</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span>{stats.lastDay[1]} TND</span>
                )}
              </div>
              <div className="flex justify-between items-center border-b-2 p-4">
                <span>Cette semaine</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span>{stats.thisWeek[1]} TND</span>
                )}
              </div>
              <div className="flex justify-between items-center border-b-2 p-4">
                <span>Ce mois-ci</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span>{stats.thisMonth[1]} TND</span>
                )}
              </div>
              <div className="flex justify-between items-center border-b-2 p-4">
                <span>Cette année</span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span>{stats.thisYear[1]} TND</span>
                )}
              </div>
              <div className="flex font-bold justify-between items-center border-b-2 p-4">
                <span >
                  Total des gains livrés
                </span>
                {loading ? (
                  <SmallSpinner />
                ) : (
                  <span className="font-bold">
                    {totalEarningsDelivered} TND
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

export default Dashboard;
