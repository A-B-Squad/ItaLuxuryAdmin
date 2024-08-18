import { ORDERS_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface Package {
  id: string;
  customId: string;
  Checkout: {
    total: number;
  };
  createdAt: string;
  status: string;
}

import { DateRange } from "react-day-picker";
import { translateStatus } from "@/app/Helpers/_translateStatus";

interface MarketingPageProps {
  dateRange: DateRange | undefined;
}

const MarketingPage: React.FC<MarketingPageProps> = ({ dateRange }) => {
  const { loading, error, data } = useQuery(ORDERS_QUERY);

  const chartData = useMemo(() => {
    if (!data || !data.getAllPackages)
      return {
        byDate: { labels: [], datasets: [] },
        byStatus: { labels: [], datasets: [] },
      };

    const packageData: Package[] = data.getAllPackages;

    // Filter packages based on date range
    const filteredPackages = packageData.filter((pkg) => {
      const pkgDate = moment(parseInt(pkg.createdAt));
      if (dateRange && dateRange.from && dateRange.to) {
        return pkgDate.isBetween(dateRange.from, dateRange.to, "day", "[]");
      }
      return true; // If no date range is set, include all packages
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
            label: "Total Orders",
            data: sortedDates.map((date) => groupedByDate[date].total),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
          },
        ],
      },
      byStatus: {
        labels: statuses,
        datasets: [
          {
            label: "Total Orders",
            data: statusTotals,
            backgroundColor: "rgba(255, 159, 64, 0.6)",
          },
          {
            label: "Order Count",
            data: statusCounts,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      },
    };
  }, [data, dateRange]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            const countDataset = context.chart.data.datasets[1];
            const count = countDataset
              ? countDataset.data[context.dataIndex]
              : null;
            const countText = count !== null ? ` (${count} orders)` : "";
            return `${label}: ${value} TND${countText}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total (DT)",
        },
      },
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="MarketingPage w-full flex justify-center flex-col">
      <div>
        <h2>Total Orders by Date</h2>
        <Bar
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              title: { display: true, text: "Total Orders by Date" },
            },
          }}
          data={chartData.byDate}
        />
      </div>
      <div>
        <h2>Total Orders by Status</h2>
        <Bar
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              title: { display: true, text: "Total Orders by Status" },
            },
          }}
          data={chartData.byStatus}
        />
      </div>
    </div>
  );
};

export default MarketingPage;
