"use client";
import React, { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { DateRange } from "react-day-picker";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Product {
  name: string;
  price: number;
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

const DoughnutProductSalesCharts: React.FC<{
  data: Data;
  dateRange: DateRange | undefined;
}> = ({ data, dateRange }) => {
  const processData = useMemo(() => {
    const productQuantities: { [productName: string]: number } = {};
    const productTotalSales: { [productName: string]: number } = {};

    data.getAllPackages.forEach((pkg) => {
      const packageDate = new Date(parseInt(pkg.createdAt));
      if (dateRange && dateRange.from && dateRange.to) {
        if (packageDate < dateRange.from || packageDate > dateRange.to) {
          return;
        }
      }

      pkg.Checkout.productInCheckout.forEach((item) => {
        const { product, productQuantity, price } = item;
        if (!productQuantities[product.name]) {
          productQuantities[product.name] = 0;
          productTotalSales[product.name] = 0;
        }
        productQuantities[product.name] += productQuantity;
        productTotalSales[product.name] += price * productQuantity;
      });
    });

    return { productQuantities, productTotalSales };
  }, [data, dateRange]);
  const chartData = {
    labels: Object.keys(processData.productQuantities),
    datasets: [
      {
        data: Object.values(processData.productQuantities),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage = ((value / total) * 100).toFixed(2);
            const totalSales = processData.productTotalSales[label].toFixed(2);
            return `${label}: ${value} (${percentage}%) - Total: ${totalSales} TND`;
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-4/5 place-content-evenly p-4 bg-white shadow rounded-lg">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Product Sales (Doughnut Chart)
        </h2>
        <div style={{ width: "300px", height: "300px" }}>
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DoughnutProductSalesCharts;
