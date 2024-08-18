"use client";
import React, { useEffect, useRef, useMemo, useState } from "react";
import { Chart, registerables, ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { format, subDays, startOfDay } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import "chartjs-adapter-date-fns";

Chart.register(...registerables);

interface Product {
  name: string;
  price: number;
  reference: string;
}

interface ProductInCheckout {
  product: Product;
  productQuantity: number;
  price: number;
}

interface Checkout {
  productInCheckout: ProductInCheckout[];
  createdAt: string;
}

interface Package {
  Checkout: Checkout;
  createdAt: string;
}

interface Data {
  getAllPackages: Package[];
}

const SalesChart: React.FC<{
  data: Data;
  dateRange: DateRange | undefined;
}> = ({ data, dateRange }) => {
  const chartRef = useRef<Chart | null>(null);

  const [selectedPreset, setSelectedPreset] = useState("last28");
  const processData = (data: Data) => {
    const packages = data.getAllPackages;
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
      backgroundColor: `hsla(${
        (index * 360) / productNames.length
      }, 70%, 50%, 0.2)`,
      fill: false,
      tension: 0.4,
    }));

    return { labels, datasets };
  }, [productSales]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
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
        text: "Product Quantities Sold Over Time",
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
        },
      },
      y: {
        title: {
          display: true,
          text: "Quantity Sold",
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg w-4/5">
      <h2 className="text-lg font-semibold mb-4">Sales Chart</h2>
      <Line data={chartData} options={chartOptions} />
      <p className="mt-4 text-sm text-gray-600">
        Most purchased product:{" "}
        <span className="font-semibold">{mostPurchasedProduct}</span>
      </p>
    </div>
  );
};

export default SalesChart;
