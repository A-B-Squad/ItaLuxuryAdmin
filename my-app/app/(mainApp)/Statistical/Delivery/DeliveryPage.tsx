"use client";
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FaCalendarAlt,
  FaWarehouse,
  FaTruck,
  FaBoxOpen,
  FaBox,
  FaRegMoneyBillAlt,
} from "react-icons/fa";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { subDays, startOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { COMPANY_INFO_QUERY, PACKAGES_QUERY } from "@/app/graph/queries";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

import AnimatedCounter from "../../Hook/AnimatedCounter";
import { IoTrendingDown, IoTrendingUp } from "react-icons/io5";
import { FiPieChart } from "react-icons/fi";
import Loading from "../loading";

type Status =
  | "RETOUR"
  | "ÉCHANGE"
  | "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON"
  | "EN TRAITEMENT"
  | "PAYÉ"
  | "ANNULÉ"
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
  const { loading, error, data } = useQuery(PACKAGES_QUERY);
  const [statusCards, setStatusCards] = useState<StatusCardData[]>([]);
  const [formattedDateRange, setFormattedDateRange] = useState<string>("");
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);

  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [averageDeliveryTime, setAverageDeliveryTime] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 28),
    to: new Date(),
  });
  const [selectedPreset, setSelectedPreset] = useState("last28");
  const translateStatus = useCallback((status: string): Status => {
    const statusTranslations: { [key: string]: Status } = {
      BACK: "RETOUR",
      EXCHANGE: "ÉCHANGE",
      TRANSFER_TO_DELIVERY_COMPANY: "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON",
      PROCESSING: "EN TRAITEMENT",
      PAYED: "PAYÉ",
      CANCELLED: "ANNULÉ",
    };
    return statusTranslations[status] || status;
  }, []);

  useQuery(COMPANY_INFO_QUERY, {
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
  });
  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      const fromFormatted = moment(dateRange.from).format("DD/MM/YYYY");
      const toFormatted = moment(dateRange.to).format("DD/MM/YYYY");
      setFormattedDateRange(`${fromFormatted} - ${toFormatted}`);
    } else {
      setFormattedDateRange("");
    }
  }, [dateRange]);
  useEffect(() => {
    if (data && data.getAllPackages) {
      processData(data.getAllPackages);
    }
  }, [data, translateStatus, dateRange]);

  const processData = (packages: Package[]) => {
    const statusCounts: { [key: string]: number } = {};
    const dateData: { [key: string]: { [key: string]: number } } = {};
    const totalPriceData: { [key: string]: { [key: string]: number } } = {};
    let totalDeliveryTime = 0;
    let totalDelivered = 0;
    let totalRevenueDelivered = 0;
    let totalRevenueDeposit = 0;
    let totalRevenueTransit = 0;
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

      if (translatedStatus === "PAYÉ" && pkg.createdAt && pkg.delivredAt) {
        totalDelivered++;
        const createdAtDate = moment(parseInt(pkg.createdAt));
        const deliveredAtDate = moment(parseInt(pkg.delivredAt));

        if (createdAtDate.isValid() && deliveredAtDate.isValid()) {
          const deliveryDuration = moment.duration(
            deliveredAtDate.diff(createdAtDate),
          );
          totalDeliveryTime += deliveryDuration.asMilliseconds();

          // Calculate profit
          const deliveryCost = deliveryPrice; // Delivery price
          const packagingCost = 1; // Packaging cost
          const sponsorCost = 5; // Sponsor cost
          const totalCosts = deliveryCost + packagingCost + sponsorCost;

          totalRevenueDelivered += pkg.Checkout.total;
          totalProfit += pkg.Checkout.total * 0.2; // Assuming 20% profit margin
          totalProfit -= totalCosts; // Subtract delivery, packaging, and sponsor costs
        }
      } else if (translatedStatus === "EN TRAITEMENT" && pkg.createdAt) {
        const createdAtDate = moment(parseInt(pkg.createdAt));

        if (createdAtDate.isValid()) {
          totalRevenueDeposit += pkg.Checkout.total;
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
      }

      if (
        translatedStatus === "RETOUR" ||
        translatedStatus === "ÉCHANGE" ||
        translatedStatus === "ANNULÉ"
      ) {
        totalLoss += pkg.Checkout.total * 0.1; // Assuming 10% loss on returns/cancellations
        totalLoss += deliveryPrice; // Delivery price
        totalLoss += 1; // Packaging cost
        totalLoss += 5; // Facebook sponsor expense (assuming it's 5 DT)
      }

      const date = moment(parseInt(pkg.createdAt)).format("YYYY-MM-DD");
      if (!dateData[date]) {
        dateData[date] = {
          processing: 0,
          transit: 0,
          delivered: 0,
          returned: 0,
        };

        totalPriceData[date] = {
          processing: 0,
          transit: 0,
          delivered: 0,
          returned: 0,
        };
      }
      dateData[date][getChartCategory(translatedStatus)]++;
      totalPriceData[date][getChartCategory(translatedStatus)] +=
        pkg.Checkout.total;
    });

    const newStatusCards: StatusCardData[] = [
      {
        title: "Orders in Deposit",
        count: statusCounts["EN TRAITEMENT"] || 0,
        icon: <FaWarehouse />,
        color: "bg-yellow-700",
        payment: totalRevenueDeposit,
      },
      {
        title: "In Transit",
        count: statusCounts["TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON"] || 0,
        icon: <FaTruck />,
        color: "bg-green-700",
        payment: totalRevenueTransit,
      },
      {
        title: "Delivered Orders",
        count: statusCounts["PAYÉ"] || 0,
        icon: <FaBoxOpen />,
        color: "bg-purple-800",
        payment: totalRevenueDelivered,
        profit: totalProfit,
      },
      {
        title: "Returned Orders",
        count:
          (statusCounts["RETOUR"] || 0) +
          (statusCounts["ÉCHANGE"] || 0) +
          (statusCounts["ANNULÉ"] || 0),
        icon: <FaBox />,
        color: "bg-blue-700",
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
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        total: labels.map((date) => totalPriceData[date]?.processing || 0),
      },
      {
        label: "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON",
        data: labels.map((date) => dateData[date].transit),
        backgroundColor: "rgba(255, 159, 64, 0.5)",
        total: labels.map((date) => totalPriceData[date]?.transit || 0),
      },
      {
        label: "PAYÉ",
        data: labels.map((date) => dateData[date].delivered),
        backgroundColor: "rgba(255, 205, 86, 0.5)",
        total: labels.map((date) => totalPriceData[date]?.delivered || 0),
      },
      {
        label: "ANNULÉ",
        data: labels.map((date) => dateData[date].returned),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        total: labels.map((date) => totalPriceData[date]?.returned || 0),
      },
    ];

    setChartData({ labels, datasets });
  };

  const getChartCategory = (status: Status): string => {
    switch (status) {
      case "EN TRAITEMENT":
        return "processing";
      case "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON":
        return "transit";
      case "PAYÉ":
        return "delivered";
      case "RETOUR":
      case "ÉCHANGE":
      case "ANNULÉ":
        return "returned";
      default:
        return "processing";
    }
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    const today = new Date();
    let from: Date;
    switch (value) {
      case "today":
        from = startOfDay(today);
        break;
      case "yesterday":
        from = startOfDay(subDays(today, 1));
        break;
      case "last7":
        from = subDays(today, 7);
        break;
      case "last14":
        from = subDays(today, 14);
        break;
      case "last28":
        from = subDays(today, 28);
        break;
      default:
        from = subDays(today, 28);
    }
    setDateRange({ from, to: today });
  };

  if (loading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;

  const averageTimeInHours = (averageDeliveryTime / (1000 * 60 * 60)).toFixed(
    2,
  );
  const maxDeliveryTime = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
  const deliveryTimePercentage = Math.min(
    (averageDeliveryTime / maxDeliveryTime) * 100,
    100,
  );
  const getColorForPercentage = (percentage: number): string => {
    if (percentage <= 33) return "#4CAF50";
    if (percentage <= 66) return "#FFC107";
    return "#F44336";
  };

  return (
    <div className="DeliveryPage">
      <div className=" container text-mainColorAdminDash p-5 w-full">
        <div className="relative flex flex-col items-end z-50 mb-5">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center border p-2 rounded bg-white text-mainColorAdminDash hover:bg-[#374151] transition duration-300"
          >
            <FaCalendarAlt className="mr-2" />
            {showCalendar ? "Hide Calendar" : "Show Calendar"}
          </button>
          {showCalendar && (
            <div className="top-24 absolute bg-white p-2 rounded-md text-mainColorAdminDash">
              <Select onValueChange={handlePresetChange} value={selectedPreset}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last14">Last 14 Days</SelectItem>
                  <SelectItem value="last28">Last 28 Days</SelectItem>
                </SelectContent>
              </Select>

              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange(range)}
                numberOfMonths={2}
              />
            </div>
          )}
          <div className="mb-5">
            <p className="text-lg font-bold mb-2">Selected Date Range:</p>
            <p className="text-md">
              {formattedDateRange || "No date range selected"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {statusCards.map((card, index) => {
            return (
              <div
                key={index}
                className={`${card.color} text-white shadow-md p-4 rounded-lg flex flex-col items-start justify-between`}
              >
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-bold">{card.title}</h3>
                  {card.icon}
                </div>
                <div className="mt-2 relative w-full">
                  <div className="flex items-center justify-between w-full relative">
                    <p className="text-2xl font-bold">
                      <AnimatedCounter from={0} to={card.count} /> Unit
                    </p>

                    {card.payment !== undefined && (
                      <p className="text-sm flex items-center gap-1 font-semibold">
                        <FaRegMoneyBillAlt />
                        <AnimatedCounter from={0} to={card.payment} />
                        DT
                      </p>
                    )}
                  </div>
                  {card.profit !== undefined && (
                    <p className="text-sm float-right flex items-center">
                      <IoTrendingUp />
                      <AnimatedCounter from={0} to={card.profit} /> DT
                    </p>
                  )}
                  {card.loss !== undefined && (
                    <p className="text-sm flex items-center float-right">
                      {" "}
                      <IoTrendingDown />
                      <AnimatedCounter from={0} to={card.loss} /> DT
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 h-[500px] gap-3">
          <div className="bg-white shadow-md text-mainColorAdminDash grid-cols-1 flex items-center justify-center w-full h-full rounded-lg border">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold mb-1">
                Délai de livraison (moyen)
              </h3>
              <svg width="300" height="300" viewBox="0 0 300 300">
                <circle
                  cx="150"
                  cy="150"
                  r="120"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="30"
                />
                <motion.circle
                  cx="150"
                  cy="150"
                  r="120"
                  fill="none"
                  stroke={getColorForPercentage(deliveryTimePercentage)}
                  strokeWidth="30"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  transform="rotate(-90 150 150)"
                  initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 120 * (1 - deliveryTimePercentage / 100),
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
                <text
                  x="150"
                  y="140"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="35px"
                  fontWeight="800"
                  fill="#333"
                >
                  {averageTimeInHours}
                </text>
                <text
                  x="150"
                  y="180"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="20px"
                  fontWeight="600"
                  fill="#666"
                >
                  hours
                </text>
              </svg>
              <p className="mt-2 text-center text-sm">
                Délai moyen de livraison
              </p>
            </div>
          </div>

          <div className="  bg-gray-50 p-2  shadow-md text-mainColorAdminDash flex items-center justify-center col-span-2 rounded-lg h-full w-full border">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      afterBody: (tooltipItems) => {
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
                  },
                  title: {
                    display: true,
                    text: "Statut de la commande au fil du temps",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
