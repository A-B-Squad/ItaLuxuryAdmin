"use client"
import { PACKAGES_QUERY } from "@/app/graph/queries";
import { Packages } from "@/app/types";
import DateRangePicker from "@/components/ui/date-range-picker";
import { useQuery } from "@apollo/client";
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
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { DateRange } from "react-day-picker";
import { FaChartBar } from "react-icons/fa";
import { translateStatus } from "../../Helpers/_translateStatus";
import Loading from "../loading";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);



const MarketingPage = () => {
  // Add dateRange state
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

  const chartData = useMemo(() => {
    if (!data || !data.getAllPackages.packages)
      return {
        byDate: { labels: [], datasets: [] },
        byStatus: { labels: [], datasets: [] },
      };

    const packageData: Packages[] = data.getAllPackages.packages;

    // Filter packages based on date range
    const filteredPackages = packageData.filter((pkg) => {
      const pkgDate = moment(parseInt(pkg.createdAt));
      if (dateRange && dateRange.from && dateRange.to) {
        return pkgDate.isBetween(dateRange.from, dateRange.to, "day", "[]");
      }
      return true;
    });

    // Group packages by date
    const groupedByDate: { [key: string]: { total: number; count: number } } =
      {};

    filteredPackages.forEach((pkg) => {
      const date = moment(parseInt(pkg.createdAt)).format("MMM DD");
      if (!groupedByDate[date]) {
        groupedByDate[date] = { total: 0, count: 0 };
      }
      groupedByDate[date].total += pkg.Checkout.total;
      groupedByDate[date].count += 1;
    });

    // Sort dates
    const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
      moment(a, "MMM DD").diff(moment(b, "MMM DD")),
    );

    // Group packages by status
    const groupedByStatus: { [key: string]: { total: number; count: number } } =
      {};
    filteredPackages.forEach((pkg) => {
      const status = translateStatus(pkg.status);
      if (!groupedByStatus[status]) {
        groupedByStatus[status] = { total: 0, count: 0 };
      }
      groupedByStatus[status].total += pkg.Checkout.total;
      groupedByStatus[status].count += 1;
    });

    const statuses = Object.keys(groupedByStatus);
    const statusTotals = statuses.map(
      (status) => groupedByStatus[status].total,
    );

    const statusCounts = statuses.map(
      (status) => groupedByStatus[status].count,
    );
    return {
      byDate: {
        labels: sortedDates,
        datasets: [
          {
            label: "Total des commandes (TND)",
            data: sortedDates.map((date) => groupedByDate[date].total),
            backgroundColor: "rgba(59, 130, 246, 0.7)", // dashboard-primary
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
          {
            label: "Nombre de commandes",
            data: sortedDates.map((date) => groupedByDate[date].count),
            backgroundColor: "rgba(16, 185, 129, 0.7)", // dashboard-success
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
          }
        ],
      },
      byStatus: {
        labels: statuses,
        datasets: [
          {
            label: "Total des commandes (TND)",
            data: statusTotals,
            backgroundColor: "rgba(99, 102, 241, 0.7)", // dashboard-secondary
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 1,
          },
          {
            label: "Nombre de commandes",
            data: statusCounts,
            backgroundColor: "rgba(6, 182, 212, 0.7)", // dashboard-info
            borderColor: "rgba(6, 182, 212, 1)",
            borderWidth: 1,
          },
        ],
      }
    }
  }, [data, dateRange]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 20,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          padding: 15
        }
      },
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
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            if (label.includes("Total")) {
              const countDataset = context.chart.data.datasets[1];
              const count = countDataset
                ? countDataset.data[context.dataIndex]
                : null;
              return `${label}: ${value.toFixed(2)} TND (${count} commandes)`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, family: "'Inter', sans-serif" }
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        title: {
          display: true,
          text: "Total (TND)",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 'bold'
          }
        },
        ticks: {
          font: { size: 11, family: "'Inter', sans-serif" }
        }
      },
    },
  }), []);

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

  return (
    <div className="w-full bg-dashboard-neutral-50 p-2 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 border-b pb-3">
          <h1 className="text-xl md:text-2xl font-bold text-dashboard-neutral-800 mb-2 md:mb-0">Analyse Marketing</h1>

          {/* DateRangePicker component */}
          <div className="w-full md:w-auto">
            <DateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-md border border-dashboard-neutral-200">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-dashboard-neutral-800">Résumé des commandes</h2>
                <div className="bg-dashboard-primary-light p-2 rounded-full text-dashboard-primary">
                  <FaChartBar size={18} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-dashboard-neutral-50 p-3 rounded-lg">
                  <p className="text-sm text-dashboard-neutral-600 mb-1">Total des commandes</p>
                  <p className="text-2xl font-bold text-dashboard-neutral-900">
                    {chartData.byDate.datasets[1]?.data.reduce((a: number, b: number) => a + b, 0) || 0}
                  </p>
                </div>
                <div className="bg-dashboard-neutral-50 p-3 rounded-lg">
                  <p className="text-sm text-dashboard-neutral-600 mb-1">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-dashboard-neutral-900">
                    {(chartData.byDate.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) || 0).toFixed(2)} TND
                  </p>
                </div>
                <div className="bg-dashboard-neutral-50 p-3 rounded-lg">
                  <p className="text-sm text-dashboard-neutral-600 mb-1">Commande moyenne</p>
                  <p className="text-2xl font-bold text-dashboard-neutral-900">
                    {chartData.byDate.datasets[1]?.data.reduce((a: number, b: number) => a + b, 0) > 0
                      ? (chartData.byDate.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) /
                        chartData.byDate.datasets[1]?.data.reduce((a: number, b: number) => a + b, 0)).toFixed(2)
                      : 0} TND
                  </p>
                </div>
                <div className="bg-dashboard-neutral-50 p-3 rounded-lg">
                  <p className="text-sm text-dashboard-neutral-600 mb-1">Statut principal</p>
                  <p className="text-2xl font-bold text-dashboard-neutral-900">
                    {chartData.byStatus.labels.length > 0 && chartData.byStatus.datasets[1]?.data.length > 0
                      ? chartData.byStatus.labels[
                      chartData.byStatus.datasets[1].data.indexOf(
                        Math.max(...chartData.byStatus.datasets[1].data)
                      )
                      ]
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-lg shadow-md border border-dashboard-neutral-200">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-dashboard-neutral-800 flex items-center">
                  <div className="w-1 h-5 md:h-6 bg-dashboard-primary rounded-full mr-2"></div>
                  <span className="truncate">Commandes par date</span>
                </h2>
                <div className="text-xs md:text-sm text-dashboard-neutral-500 whitespace-nowrap">
                  {chartData.byDate.labels.length} jours
                </div>
              </div>
              <div className="h-[300px] md:h-[400px]">
                <Bar
                  options={{
                    ...options,
                    plugins: {
                      ...options.plugins,
                      title: {
                        display: true,
                        text: "Évolution des commandes",
                        font: {
                          size: 16,
                          family: "'Inter', sans-serif",
                          weight: 'bold' as const,
                        },
                        padding: {
                          top: 10,
                          bottom: 20
                        }
                      },
                    }
                  } as any}
                  data={chartData.byDate}
                />
              </div>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-lg shadow-md border border-dashboard-neutral-200">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-dashboard-neutral-800 flex items-center">
                  <div className="w-1 h-5 md:h-6 bg-dashboard-secondary rounded-full mr-2"></div>
                  <span className="truncate">Commandes par statut</span>
                </h2>
                <div className="text-xs md:text-sm text-dashboard-neutral-500 whitespace-nowrap">
                  {chartData.byStatus.labels.length} statuts
                </div>
              </div>
              <div className="h-[300px] md:h-[400px]">
                <Bar
                  options={{
                    ...options,
                    plugins: {
                      ...options.plugins,
                      title: {
                        display: true,
                        text: "Répartition par statut",
                        font: {
                          size: 16,
                          family: "'Inter', sans-serif",
                          weight: 'bold' as const,
                        },
                        padding: {
                          top: 10,
                          bottom: 20
                        }
                      },
                    },
                    indexAxis: 'y' as const,
                  } as any}
                  data={chartData.byStatus}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-4 md:mt-6 bg-white p-3 md:p-4 rounded-lg shadow-md border border-dashboard-neutral-200">
          <h2 className="text-base md:text-lg font-semibold text-dashboard-neutral-800 mb-3 md:mb-4">Insights Marketing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="p-3 bg-dashboard-neutral-50 rounded-lg">
              <h3 className="text-dashboard-primary font-medium mb-2">Meilleur jour</h3>
              <p className="text-dashboard-neutral-800">
                {chartData.byDate.labels.length > 0 && chartData.byDate.datasets[0]?.data.length > 0
                  ? chartData.byDate.labels[
                  chartData.byDate.datasets[0].data.indexOf(
                    Math.max(...chartData.byDate.datasets[0].data)
                  )
                  ]
                  : "N/A"}
                {chartData.byDate.datasets[0]?.data.length > 0 && (
                  <span className="text-dashboard-success font-medium ml-2">
                    ({Math.max(...chartData.byDate.datasets[0].data).toFixed(2)} TND)
                  </span>
                )}
              </p>
            </div>
            <div className="p-3 bg-dashboard-neutral-50 rounded-lg">
              <h3 className="text-dashboard-danger font-medium mb-2">Jour le moins performant</h3>
              <p className="text-dashboard-neutral-800 break-words">
                {chartData.byDate.labels.length > 0 && chartData.byDate.datasets[0]?.data.length > 0
                  ? chartData.byDate.labels[
                  chartData.byDate.datasets[0].data.indexOf(
                    Math.min(...chartData.byDate.datasets[0].data.filter(n => n > 0))
                  )
                  ]
                  : "N/A"}
                {chartData.byDate.datasets[0]?.data.length > 0 && (
                  <span className="text-dashboard-danger font-medium ml-2 block sm:inline mt-1 sm:mt-0">
                    ({Math.min(...chartData.byDate.datasets[0].data.filter(n => n > 0)).toFixed(2)} TND)
                  </span>
                )}
              </p>
            </div>
            <div className="p-3 bg-dashboard-neutral-50 rounded-lg">
              <h3 className="text-dashboard-info font-medium mb-2">Statut le plus rentable</h3>
              <p className="text-dashboard-neutral-800">
                {chartData.byStatus.labels.length > 0 && chartData.byStatus.datasets[0]?.data.length > 0
                  ? chartData.byStatus.labels[
                  chartData.byStatus.datasets[0].data.indexOf(
                    Math.max(...chartData.byStatus.datasets[0].data)
                  )
                  ]
                  : "N/A"}
                {chartData.byStatus.datasets[0]?.data.length > 0 && (
                  <span className="text-dashboard-info font-medium ml-2">
                    ({Math.max(...chartData.byStatus.datasets[0].data).toFixed(2)} TND)
                  </span>
                )}
              </p>
            </div>
            <div className="p-3 bg-dashboard-neutral-50 rounded-lg">
              <h3 className="text-dashboard-secondary font-medium mb-2">Recommandation</h3>
              <p className="text-dashboard-neutral-800">
                {chartData.byDate.labels.length > 0 && chartData.byDate.datasets[0]?.data.length > 0
                  ? "Concentrez vos efforts marketing sur les jours à faible performance pour augmenter les ventes."
                  : "Pas assez de données pour générer des recommandations."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPage;
