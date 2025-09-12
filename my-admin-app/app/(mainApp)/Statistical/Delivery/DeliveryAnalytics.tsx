"use client";
import { useQuery } from "@apollo/client";

import { useCallback, useEffect, useState } from "react";

import {  PACKAGES_QUERY } from "@/app/graph/queries";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { subDays } from "date-fns";
import moment from "moment";
import { DateRange } from "react-day-picker";
import {
  FaBox,
  FaBoxOpen,
  FaMoneyBillWave,
  FaTruck,
  FaWarehouse
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

import DateRangePicker from "@/components/ui/date-range-picker";

import { translateStatus } from "../../Helpers/_translateStatus";
import Loading from "../loading";
import HeaderTitle from "../Components/HeaderTitle";
import StatusCards from "./Components/StatusCards";
import Charts from "./Components/Charts";

type Status =
  | "RETOUR"
  | "ÉCHANGE"
  | "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON"
  | "EN TRAITEMENT"
  | "COMMANDE CONFIRMÉ"
  | "ANNULÉ"
  | "PAYÉ ET LIVRÉ"
  | "PAYÉ MAIS NON LIVRÉ"
  | string;

interface Package {
  id: string;
  status: string;
  createdAt: string;
  delivredAt?: string | null;
  inTransitAt?: string | null;
  returnedAt?: string | null;
  Checkout: {
    total: number;
  };
}

interface StatusCardData {
  title: string;
  count: number;
  icon: React.ReactElement;
  color: string;
}

const DeliveryAnalytics: React.FC = () => {
  const [statusCards, setStatusCards] = useState<StatusCardData[]>([]);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [averageDeliveryTime, setAverageDeliveryTime] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 28),
    to: new Date(),
  });

  const { loading, error, data } = useQuery(PACKAGES_QUERY, {
    variables: {
      dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
      dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true
  });

  // Helper function to categorize status for charts
  const getChartCategory = useCallback((status: Status) => {
    switch (status) {
      case "EN TRAITEMENT":
        return "processing";
      case "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON":
        return "transit";
      case "PAYÉ ET LIVRÉ":
        return "delivered";
      case "PAYÉ MAIS NON LIVRÉ":
        return "paidNotDelivered";
      case "RETOUR":
      case "ÉCHANGE":
      case "ANNULÉ":
      case "REMBOURSER":
        return "returned";
      default:
        return "processing";
    }
  }, []);

  // Process data with memoization for better performance
  const processData = useCallback((packages: Package[]) => {
    const statusCounts: { [key: string]: number } = {};
    const dateData: { [key: string]: { [key: string]: number } } = {};
    const totalPriceData: { [key: string]: { [key: string]: number } } = {};
    let totalDeliveryTime = 0;
    let totalDelivered = 0;

    const filteredPackages = packages.filter((pkg) => {
      const createdAt = moment(parseInt(pkg.createdAt));
      return (
        dateRange &&
        dateRange.from &&
        dateRange.to &&
        createdAt.isBetween(dateRange.from, dateRange.to, null, "[]")
      );
    });

    filteredPackages.forEach((pkg) => {
      const translatedStatus = translateStatus(pkg.status);
      statusCounts[translatedStatus] = (statusCounts[translatedStatus] || 0) + 1;

      // Calculate delivery time for delivered packages
      if (
        translatedStatus === "PAYÉ ET LIVRÉ" &&
        pkg.createdAt &&
        pkg.delivredAt
      ) {
        totalDelivered++;
        const createdAtDate = moment(parseInt(pkg.createdAt));
        const deliveredAtDate = moment(parseInt(pkg.delivredAt));

        if (createdAtDate.isValid() && deliveredAtDate.isValid()) {
          const deliveryDuration = moment.duration(
            deliveredAtDate.diff(createdAtDate),
          );
          totalDeliveryTime += deliveryDuration.asMilliseconds();
        }
      }

      // Process data for charts - FIXED: Process ALL packages, not just "EN TRAITEMENT"
      const date = moment(parseInt(pkg.createdAt)).format("YYYY-MM-DD");
      
      if (!dateData[date]) {
        dateData[date] = {
          processing: 0,
          transit: 0,
          delivered: 0,
          returned: 0,
          paidNotDelivered: 0,
        };

        totalPriceData[date] = {
          processing: 0,
          transit: 0,
          delivered: 0,
          returned: 0,
          paidNotDelivered: 0,
        };
      }
      
      const category = getChartCategory(translatedStatus);
      dateData[date][category]++;
      totalPriceData[date][category] += pkg.Checkout.total;
    });

    const newStatusCards: StatusCardData[] = [
      {
        title: "Commandes en dépôt",
        count: statusCounts["EN TRAITEMENT"] || 0,
        icon: <FaWarehouse />,
        color: "bg-dashboard-warning",
      },
      {
        title: "Commandes en dépôt et Confirme",
        count: statusCounts["COMMANDE CONFIRMÉ"] || 0,
        icon: <FaWarehouse />,
        color: "bg-dashboard-secondary",
      },
      {
        title: "En transit",
        count: statusCounts["TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON"] || 0,
        icon: <FaTruck />,
        color: "bg-dashboard-primary",
      },
      {
        title: "Commandes payées non livrées",
        count: statusCounts["PAYÉ MAIS NON LIVRÉ"] || 0,
        icon: <FaMoneyBillWave />,
        color: "bg-dashboard-info",
      },
      {
        title: "Commandes payées et livrées",
        count: statusCounts["PAYÉ ET LIVRÉ"] || 0,
        icon: <FaBoxOpen />,
        color: "bg-dashboard-success",
      },
      {
        title: "Commandes retournées",
        count:
          (statusCounts["RETOUR"] || 0) +
          (statusCounts["ÉCHANGE"] || 0) +
          (statusCounts["ANNULÉ"] || 0),
        icon: <FaBox />,
        color: "bg-dashboard-danger",
      },
    ];
    setStatusCards(newStatusCards);

    setAverageDeliveryTime(
      totalDelivered ? totalDeliveryTime / totalDelivered : 0,
    );

    // Generate chart data
    const labels = Object.keys(dateData).sort();
    
    // Only include datasets that have data
    const datasets = [
      {
        label: "EN TRAITEMENT",
        data: labels.map((date) => dateData[date].processing),
        backgroundColor: "rgba(245, 158, 11, 0.7)",
        total: labels.map((date) => totalPriceData[date]?.processing || 0),
      },
      {
        label: "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON",
        data: labels.map((date) => dateData[date].transit),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        total: labels.map((date) => totalPriceData[date]?.transit || 0),
      },
      {
        label: "PAYÉ MAIS NON LIVRÉ",
        data: labels.map((date) => dateData[date].paidNotDelivered),
        backgroundColor: "rgba(6, 182, 212, 0.7)",
        total: labels.map(
          (date) => totalPriceData[date]?.paidNotDelivered || 0,
        ),
      },
      {
        label: "PAYÉ ET LIVRÉ",
        data: labels.map((date) => dateData[date].delivered),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        total: labels.map((date) => totalPriceData[date]?.delivered || 0),
      },
      {
        label: "ANNULÉ/RETOURNÉ",
        data: labels.map((date) => dateData[date].returned),
        backgroundColor: "rgba(239, 68, 68, 0.7)",
        total: labels.map((date) => totalPriceData[date]?.returned || 0),
      },
    ];

    console.log("Chart data being set:", { labels, datasets });
    setChartData({ labels, datasets });
  }, [dateRange, getChartCategory]);

  useEffect(() => {
    if (data && data.getAllPackages.packages) {
      console.log("Raw packages data:", data.getAllPackages.packages);
      processData(data.getAllPackages.packages);
    }
  }, [data, dateRange, processData]);

  if (loading) return <Loading />;
  if (error) return (
    <div className="flex items-center justify-center h-96 bg-dashboard-neutral-50 rounded-lg">
      <div className="text-center p-6 bg-white rounded-lg shadow-md border border-dashboard-neutral-200">
        <div className="text-dashboard-danger text-5xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-dashboard-neutral-800 mb-2">Error Loading Data</h3>
        <p className="text-dashboard-neutral-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-dashboard-primary text-white px-4 py-2 rounded-md hover:bg-dashboard-primary-dark transition-all"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const averageTimeInHours = (averageDeliveryTime / (1000 * 60 * 60)).toFixed(2);
  const maxDeliveryTime = 48 * 60 * 60 * 1000;
  const deliveryTimePercentage = Math.min(
    (averageDeliveryTime / maxDeliveryTime) * 100,
    100,
  );
  const getColorForPercentage = (percentage: number): string => {
    if (percentage <= 33) return "#10B981";
    if (percentage <= 66) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="w-full bg-dashboard-neutral-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <HeaderTitle
          mainTitle={"Analyse des Livraisons"}
        />
        {/* Calendar and Date Range Selection */}
        <DateRangePicker
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {/* Status Cards */}
        <StatusCards statusCards={statusCards} />

        {/* Charts and Delivery Time */}
        <Charts
          getColorForPercentage={getColorForPercentage}
          deliveryTimePercentage={deliveryTimePercentage}
          averageTimeInHours={averageTimeInHours}
          chartData={chartData}
        />
      </div>
    </div>
  );
};

export default DeliveryAnalytics;