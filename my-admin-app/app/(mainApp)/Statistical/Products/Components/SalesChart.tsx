"use client";
import React, { useMemo } from "react";
import { Chart, registerables, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import "chartjs-adapter-date-fns";
import { Packages } from "@/app/types";

Chart.register(...registerables);


interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
}

interface PackagesResponse {
  packages: Packages[];
  pagination: Pagination;
}

interface Data {
  getAllPackages: PackagesResponse;
}

const SalesChart: React.FC<{
  data: Data;
  dateRange: DateRange | undefined;
}> = ({ data, dateRange }) => {

  const processData = (data: Data) => {
    // Access the packages array from the nested structure
    const packages = data.getAllPackages?.packages || [];

    const productSales: {
      [date: string]: {
        [productName: string]: {
          quantity: number;
          price: number;
          reference: string;
        };
      };
    } = {};

    const productQuantities: { [productName: string]: number } = {};

    packages.forEach((pkg) => {
      const { productInCheckout } = pkg.Checkout;
      const date = format(new Date(parseInt(pkg.createdAt)), "yyyy-MM-dd");

      if (dateRange && dateRange.from && dateRange.to) {
        const packageDate = new Date(parseInt(pkg.createdAt));
        if (packageDate < dateRange.from || packageDate > dateRange.to) {
          return;
        }
      }

      productInCheckout.forEach((item) => {
        const { product, productQuantity } = item;
        const { name, price, reference } = product;
        if (!productSales[date]) {
          productSales[date] = {};
        }
        if (!productSales[date][name]) {
          productSales[date][name] = { quantity: 0, price, reference };
        }
        productSales[date][name].quantity += productQuantity;

        if (!productQuantities[name]) {
          productQuantities[name] = 0;
        }
        productQuantities[name] += productQuantity;
      });
    });

    return { productSales, productQuantities };
  };

  const { productSales, productQuantities } = useMemo(
    () => processData(data),
    [data, dateRange],
  );

  const mostPurchasedProduct = useMemo(() => {
    const entries = Object.entries(productQuantities);
    if (entries.length === 0) {
      return "No products purchased";
    }
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }, [productQuantities]);

  const chartData = useMemo(() => {
    const labels = Object.keys(productSales)
      .sort()
      .map((dateStr) => new Date(dateStr));
    const productNames = Array.from(
      new Set(Object.values(productSales).flatMap(Object.keys)),
    );

    const datasets = productNames.map((product, index) => ({
      label: product,
      data: labels.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return productSales[dateStr]?.[product]?.quantity || 0;
      }),
      borderColor: `hsl(${(index * 360) / productNames.length}, 70%, 50%)`,
      backgroundColor: `hsla(${(index * 360) / productNames.length
        }, 70%, 50%, 0.2)`,
      fill: false,
      tension: 0.4,
    }));

    return { labels, datasets };
  }, [productSales]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
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
        mode: "index",
        intersect: false,
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
          label: function (context) {
            const dataIndex = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            const date = format(
              chartData.labels[dataIndex] as Date,
              "yyyy-MM-dd",
            );
            const product = chartData.datasets[datasetIndex].label;
            const productInfo = productSales[date]?.[product];

            if (productInfo) {
              const { quantity, price, reference } = productInfo;
              return `${product} - Qty: ${quantity}, Ref: ${reference}, Price: ${price} TND`;
            }
            return "";
          },
        },
      },
      title: {
        display: true,
        text: "Quantités de produits vendus",
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20
        },
        color: '#1e293b' // dashboard-neutral-800
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "PP",
          displayFormats: {
            day: "MMM d",
          },
        },
        title: {
          display: true,
          text: "Date",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 'bold'
          },
          color: '#64748b' // dashboard-neutral-500
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        }
      },
      y: {
        title: {
          display: true,
          text: "Quantité vendue",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 'bold'
          },
          color: '#64748b' // dashboard-neutral-500
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        }
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-dashboard-neutral-800">Ventes par produit</h2>
          <p className="text-sm text-dashboard-neutral-600">
            Produit le plus vendu: <span className="font-semibold text-dashboard-primary">{mostPurchasedProduct}</span>
          </p>
        </div>
      </div>
      <div className="h-[350px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );

};

export default SalesChart;
