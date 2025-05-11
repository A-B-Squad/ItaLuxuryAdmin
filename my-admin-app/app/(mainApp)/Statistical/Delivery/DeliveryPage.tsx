"use client";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";

import { COMPANY_INFO_QUERY, PACKAGES_QUERY } from "@/app/graph/queries";
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
  FaRegMoneyBillAlt,
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
import { IoTrendingDown, IoTrendingUp } from "react-icons/io5";
import { translateStatus } from "../../Helpers/_translateStatus";
import AnimatedCounter from "../../Hook/AnimatedCounter";
import Loading from "../loading";

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
  payment?: number;
  profit?: number;
  loss?: number;
}

const DeliveryPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 28),
    to: new Date(),
  }); const { loading, error, data } = useQuery(PACKAGES_QUERY, {
    variables: {
      dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
      dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true
  });
  const [statusCards, setStatusCards] = useState<StatusCardData[]>([]);
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);

  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [averageDeliveryTime, setAverageDeliveryTime] = useState(0);



  useQuery(COMPANY_INFO_QUERY, {
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
  });



  // Process data when it changes
  useEffect(() => {
    if (data && data.getAllPackages.packages) {
      processData(data.getAllPackages.packages);
    }
  }, [data, translateStatus, dateRange]);

  // Process data with memoization for better performance
  const processData = useCallback((packages: Package[]) => {
    const statusCounts: { [key: string]: number } = {};
    const dateData: { [key: string]: { [key: string]: number } } = {};
    const totalPriceData: { [key: string]: { [key: string]: number } } = {};
    let totalDeliveryTime = 0;
    let totalDelivered = 0;
    let totalRevenueDelivered = 0;
    let totalRevenueDeposit = 0;
    let totalRevenueTransit = 0;
    let totalRevenuePaidNotDelivered = 0;
    let totalProfit = 0;
    let totalLoss = 0;

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
      statusCounts[translatedStatus] =
        (statusCounts[translatedStatus] || 0) + 1;

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

          // Calculate profit
          const deliveryCost = deliveryPrice;
          const packagingCost = 1;
          const sponsorCost = 5;
          const totalCosts = deliveryCost + packagingCost + sponsorCost;

          totalRevenueDelivered += pkg.Checkout.total;
          totalProfit += pkg.Checkout.total * 0.2;
          totalProfit -= totalCosts;
        }
      } else if (translatedStatus === "EN TRAITEMENT" && pkg.createdAt) {
        const createdAtDate = moment(parseInt(pkg.createdAt));

        if (createdAtDate.isValid()) {
          totalRevenueDeposit += pkg.Checkout.total;
        }
      } else if (
        translatedStatus === "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON" &&
        pkg.createdAt &&
        pkg.inTransitAt
      ) {
        const createdAtDate = moment(parseInt(pkg.createdAt));
        const inTransitAtDate = moment(parseInt(pkg.inTransitAt));

        if (createdAtDate.isValid() && inTransitAtDate.isValid()) {
          totalRevenueTransit += pkg.Checkout.total;
        }
      } else if (translatedStatus === "PAYÉ MAIS NON LIVRÉ" && pkg.createdAt) {
        const createdAtDate = moment(parseInt(pkg.createdAt));

        if (createdAtDate.isValid()) {
          totalRevenuePaidNotDelivered += pkg.Checkout.total;
        }
      }

      if (
        translatedStatus === "RETOUR" ||
        translatedStatus === "ÉCHANGE" ||
        translatedStatus === "ANNULÉ"
      ) {
        totalLoss += pkg.Checkout.total * 0.1;
        totalLoss += deliveryPrice;
        totalLoss += 1;
        totalLoss += 5;
      }

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
      dateData[date][getChartCategory(translatedStatus)]++;
      totalPriceData[date][getChartCategory(translatedStatus)] +=
        pkg.Checkout.total;
    });

    const newStatusCards: StatusCardData[] = [
      {
        title: "Commandes en dépôt",
        count: statusCounts["EN TRAITEMENT"] || 0,
        icon: <FaWarehouse />,
        color: "bg-dashboard-warning",
        payment: totalRevenueDeposit,
      },
      {
        title: "Commandes en dépôt et Confirme",
        count: statusCounts["COMMANDE CONFIRMÉ"] || 0,
        icon: <FaWarehouse />,
        color: "bg-dashboard-secondary",
        payment: totalRevenueDeposit,
      },
      {
        title: "En transit",
        count: statusCounts["TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON"] || 0,
        icon: <FaTruck />,
        color: "bg-dashboard-primary",
        payment: totalRevenueTransit,
      },
      {
        title: "Commandes payées non livrées",
        count: statusCounts["PAYÉ MAIS NON LIVRÉ"] || 0,
        icon: <FaMoneyBillWave />,
        color: "bg-dashboard-info",
        payment: totalRevenuePaidNotDelivered,
      },
      {
        title: "Commandes payées et livrées",
        count: statusCounts["PAYÉ ET LIVRÉ"] || 0,
        icon: <FaBoxOpen />,
        color: "bg-dashboard-success",
        payment: totalRevenueDelivered,
        profit: totalProfit,
      },
      {
        title: "Commandes retournées",
        count:
          (statusCounts["RETOUR"] || 0) +
          (statusCounts["ÉCHANGE"] || 0) +
          (statusCounts["ANNULÉ"] || 0),
        icon: <FaBox />,
        color: "bg-dashboard-danger",
        loss: totalLoss,
      },
    ];
    setStatusCards(newStatusCards);

    setAverageDeliveryTime(
      totalDelivered ? totalDeliveryTime / totalDelivered : 0,
    );

    const labels = Object.keys(dateData).sort();

    const datasets = [
      {
        label: "EN TRAITEMENT",
        data: labels.map((date) => dateData[date].processing),
        backgroundColor: "rgba(245, 158, 11, 0.7)", // dashboard-warning
        total: labels.map((date) => totalPriceData[date]?.processing || 0),
      },
      {
        label: "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON",
        data: labels.map((date) => dateData[date].transit),
        backgroundColor: "rgba(59, 130, 246, 0.7)", // dashboard-primary
        total: labels.map((date) => totalPriceData[date]?.transit || 0),
      },
      {
        label: "PAYÉ MAIS NON LIVRÉ",
        data: labels.map((date) => dateData[date].paidNotDelivered),
        backgroundColor: "rgba(6, 182, 212, 0.7)", // dashboard-info
        total: labels.map(
          (date) => totalPriceData[date]?.paidNotDelivered || 0,
        ),
      },
      {
        label: "PAYÉ ET LIVRÉ",
        data: labels.map((date) => dateData[date].delivered),
        backgroundColor: "rgba(16, 185, 129, 0.7)", // dashboard-success
        total: labels.map((date) => totalPriceData[date]?.delivered || 0),
      },
      {
        label: "ANNULÉ",
        data: labels.map((date) => dateData[date].returned),
        backgroundColor: "rgba(239, 68, 68, 0.7)", // dashboard-danger
        total: labels.map((date) => totalPriceData[date]?.returned || 0),
      },
    ];

    setChartData({ labels, datasets });
  }, [dateRange, deliveryPrice]);

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



  // Chart options with memoization
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, family: "'Inter', sans-serif" },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          font: { size: 11, family: "'Inter', sans-serif" }
        }
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)', // dashboard-neutral-800
        titleFont: {
          size: 13,
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 12,
        cornerRadius: 4,
        callbacks: {
          afterBody: (tooltipItems: any) => {
            if (tooltipItems.length === 0) return "";
            const datasetIndex = tooltipItems[0].datasetIndex;
            const dataIndex = tooltipItems[0].dataIndex;
            const dataset = chartData.datasets[datasetIndex];
            const totalPrice = dataset.total[dataIndex];
            return `Total Price: ${totalPrice.toFixed(2)} DT`;
          },
        },
      },
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 20,
          font: { size: 11, family: "'Inter', sans-serif" },
          padding: 15
        }
      },
      title: {
        display: true,
        text: "Statut de la commande au fil du temps",
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
    },
  }), [chartData]) as any;

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
  const maxDeliveryTime = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
  const deliveryTimePercentage = Math.min(
    (averageDeliveryTime / maxDeliveryTime) * 100,
    100,
  );
  const getColorForPercentage = (percentage: number): string => {
    if (percentage <= 33) return "#10B981"; // dashboard-success
    if (percentage <= 66) return "#F59E0B"; // dashboard-warning
    return "#EF4444"; // dashboard-danger
  };

  return (
    <div className="w-full bg-dashboard-neutral-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-dashboard-neutral-800 mb-6 border-b pb-3">Analyse des Livraisons</h1>

        {/* Calendar and Date Range Selection */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-dashboard-neutral-100 p-4 rounded-lg">
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statusCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white border-l-4 ${card.color.replace('bg-', 'border-')} shadow-md p-4 rounded-lg`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-dashboard-neutral-800 font-semibold text-sm">{card.title}</h3>
                <div className={`${card.color} p-2 rounded-full text-white`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-dashboard-neutral-900">
                    <AnimatedCounter from={0} to={card.count} />
                  </p>
                  <span className="text-xs font-medium text-dashboard-neutral-500">unités</span>
                </div>

                {card.payment !== undefined && (
                  <div className="mt-2 flex items-center text-dashboard-neutral-700">
                    <FaRegMoneyBillAlt className="mr-1 text-dashboard-primary" />
                    <span className="font-medium">
                      <AnimatedCounter from={0} to={card.payment} /> DT
                    </span>
                  </div>
                )}

                {card.profit !== undefined && (
                  <div className="mt-1 flex items-center text-dashboard-success">
                    <IoTrendingUp className="mr-1" />
                    <span className="font-medium">
                      <AnimatedCounter from={0} to={card.profit} /> DT
                    </span>
                  </div>
                )}

                {card.loss !== undefined && (
                  <div className="mt-1 flex items-center text-dashboard-danger">
                    <IoTrendingDown className="mr-1" />
                    <span className="font-medium">
                      <AnimatedCounter from={0} to={card.loss} /> DT
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Delivery Time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow-md rounded-lg border border-dashboard-neutral-200 p-4">
            <h3 className="text-lg font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
              <div className="w-1 h-6 bg-dashboard-info rounded-full mr-2"></div>
              Délai de livraison moyen
            </h3>
            <div className="flex flex-col items-center justify-center">
              <svg width="220" height="220" viewBox="0 0 220 220" className="mb-4">
                <circle
                  cx="110"
                  cy="110"
                  r="90"
                  fill="none"
                  stroke="#E2E8F0" // dashboard-neutral-200
                  strokeWidth="20"
                />
                <motion.circle
                  cx="110"
                  cy="110"
                  r="90"
                  fill="none"
                  stroke={getColorForPercentage(deliveryTimePercentage)}
                  strokeWidth="20"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  transform="rotate(-90 110 110)"
                  initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 90 * (1 - deliveryTimePercentage / 100),
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
                <text
                  x="110"
                  y="100"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="32px"
                  fontWeight="700"
                  fill="#1E293B" // dashboard-neutral-800
                >
                  {averageTimeInHours}
                </text>
                <text
                  x="110"
                  y="135"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16px"
                  fontWeight="500"
                  fill="#64748B" // dashboard-neutral-500
                >
                  heures
                </text>
              </svg>
              <div className="text-center">
                <p className="text-dashboard-neutral-600 text-sm">
                  Temps moyen entre la commande et la livraison
                </p>
                <div className="mt-2 flex justify-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-dashboard-success mr-1"></div>
                    <span className="text-xs text-dashboard-neutral-600">Rapide (&lt;16h)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-dashboard-warning mr-1"></div>
                    <span className="text-xs text-dashboard-neutral-600">Normal (16-32h)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-dashboard-danger mr-1"></div>
                    <span className="text-xs text-dashboard-neutral-600">Lent (&gt;32h)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 shadow-md rounded-lg border border-dashboard-neutral-200 lg:col-span-2">
            <h3 className="text-lg font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
              <div className="w-1 h-6 bg-dashboard-primary rounded-full mr-2"></div>
              Statut des commandes au fil du temps
            </h3>
            <div className="h-[400px]">
              <Bar
                data={{
                  ...chartData,
                  datasets: chartData.datasets.map((dataset: any, index: number) => ({
                    ...dataset,
                    backgroundColor: [
                      "rgba(245, 158, 11, 0.7)", // dashboard-warning
                      "rgba(59, 130, 246, 0.7)", // dashboard-primary
                      "rgba(6, 182, 212, 0.7)",  // dashboard-info
                      "rgba(16, 185, 129, 0.7)", // dashboard-success
                      "rgba(239, 68, 68, 0.7)",  // dashboard-danger
                    ][index % 5]
                  }))
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;