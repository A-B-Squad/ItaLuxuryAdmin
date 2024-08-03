"use client";
import React, { useMemo } from "react";
import { useQuery } from "@apollo/client";
import moment from "moment-timezone";
import { TbPackages } from "react-icons/tb";
import { GET_PACKAGES_QUERY } from "../graph/queries";
import SmallSpinner from "./SmallSpinner";
import { translateStatus } from "../Helpers/_translateStatus";

const DEFAULT_TIMEZONE = "Africa/Tunis";

interface Package {
  id: string;
  checkoutId: string;
  status: string;
  createdAt: string;
  Checkout: {
    id: string;
    total: number;
  };
}

interface PackageData {
  getAllPackages: Package[];
}

interface StatsPeriod {
  count: number;
  total: number;
}

interface PackageStats {
  today: StatsPeriod;
  thisWeek: StatsPeriod;
  thisMonth: StatsPeriod;
  byStatus: Record<string, number>;
}

const Stats: React.FC = () => {
  const { loading: packagesLoading, data: packageData } =
    useQuery<PackageData>(GET_PACKAGES_QUERY);

  const filteredPackages = useMemo(() => {
    if (!packageData) return [];
    return packageData.getAllPackages.filter(
      (pkg) => !["REFUNDED", "CANCELLED", "BACK"].includes(pkg.status),
    );
  }, [packageData]);

  const packageStats = useMemo(() => {
    const now = moment().tz(DEFAULT_TIMEZONE);
    const startOfDay = now.clone().startOf("day");
    const startOfWeek = now.clone().startOf("week");
    const startOfMonth = now.clone().startOf("month");

    return filteredPackages.reduce<PackageStats>(
      (stats, pkg) => {
        const packageDate = moment.tz(
          parseInt(pkg.createdAt),
          DEFAULT_TIMEZONE,
        );
        const total = pkg.Checkout.total;

        if (packageDate.isSameOrAfter(startOfDay)) {
          stats.today.count++;
          stats.today.total += total;
        }
        if (packageDate.isSameOrAfter(startOfWeek)) {
          stats.thisWeek.count++;
          stats.thisWeek.total += total;
        }
        if (packageDate.isSameOrAfter(startOfMonth)) {
          stats.thisMonth.count++;
          stats.thisMonth.total += total;
        }

        stats.byStatus[pkg.status] = (stats.byStatus[pkg.status] || 0) + 1;

        return stats;
      },
      {
        today: { count: 0, total: 0 },
        thisWeek: { count: 0, total: 0 },
        thisMonth: { count: 0, total: 0 },
        byStatus: {},
      },
    );
  }, [filteredPackages]);

  const statCards: Array<{
    title: string;
    period: keyof Omit<PackageStats, "byStatus">;
  }> = [
    { title: "Commandes aujourd'hui", period: "today" },
    { title: "Commandes cette semaine", period: "thisWeek" },
    { title: "Commandes ce mois-ci", period: "thisMonth" },
  ];

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md relative">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Tableau de bord des commandes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map(({ title, period }) => (
          <div
            key={period}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="bg-mainColorAdminDash p-4">
              <h3 className="text-sm font-medium text-purple-100">{title}</h3>
            </div>
            <div className="p-4">
              {packagesLoading ? (
                <SmallSpinner />
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-800">
                    {packageStats[period].total.toFixed(2)} DT
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {packageStats[period].count} Commande
                    {packageStats[period].count !== 1 ? "s" : ""}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.entries(packageStats.byStatus).map(([status, count]) => (
            <div key={status} className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm font-medium text-gray-600">
                {translateStatus(status)}
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
