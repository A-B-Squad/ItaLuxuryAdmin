"use client";
import React, { useMemo, useState } from "react";
import { Chart, registerables, ChartOptions } from "chart.js";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import "chartjs-adapter-date-fns";
import { Packages } from "@/app/types";

import SearchProduct from "@/app/(mainApp)/components/searchProduct";
import SelectedProductInfo from "./SelectedProductInfo";
import ChartsGrid from "./ChartsGrid";

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

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  parentId: string;
  subcategories?: Subcategory[];
}

interface Color {
  id: string;
  color: string;
  Hex: string;
}

interface ProductDiscount {
  dateOfStart: string;
  dateOfEnd: string;
  price: number;
  newPrice: number;
}

interface Governorate {
  name: string;
}

interface Package {
  status: string;
}

interface Checkout {
  phone: string[];
  package: Package[];
  Governorate: Governorate;
}

interface ProductInCheckout {
  checkout: Checkout;
}

//  Product interface 
interface Product {
  id: string;
  name: string;
  price: number;
  purchasePrice: number;
  isVisible: boolean;
  reference: string;
  description: string;
  inventory: number;
  solde: number;
  broken: number;
  images: string[];
  createdAt: string;
  reviews: Review[];
  categories: Category[];
  Colors: Color[];
  productDiscounts: ProductDiscount[];
  ProductInCheckout: ProductInCheckout[];
}

const SalesChart: React.FC<{
  data: Data;
  dateRange: DateRange | undefined;
}> = ({ data, dateRange }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Create filtered packages based on date range
  const filteredPackages = useMemo(() => {
    const packages = data.getAllPackages?.packages || [];

    if (!dateRange || !dateRange.from || !dateRange.to) {
      return packages;
    }

    return packages.filter((pkg) => {
      const packageDate = new Date(parseInt(pkg.createdAt));
      return packageDate >= dateRange.from! && packageDate <= dateRange.to!;
    });
  }, [data, dateRange]);

  // Create filtered product data for selected product based on actual package data
  const filteredSelectedProductData = useMemo(() => {
    if (!selectedProduct) return null;

    // Create synthetic ProductInCheckout data from filtered packages
    const filteredProductInCheckout: ProductInCheckout[] = [];

    filteredPackages.forEach((pkg) => {
      // Check if this package contains the selected product
      const productInThisPackage = pkg.Checkout.productInCheckout.find(
        (item) => item.product.id === selectedProduct.id
      );

      if (productInThisPackage) {
        // Create a synthetic ProductInCheckout entry that matches the expected structure
        filteredProductInCheckout.push({
          checkout: {
            phone: pkg.Checkout.phone,
            package: [{ status: pkg.status }],
            Governorate: pkg.Checkout.Governorate
          }
        });
      }
    });

    return {
      ...selectedProduct,
      ProductInCheckout: filteredProductInCheckout
    };
  }, [selectedProduct, filteredPackages]);

  const processData = (data: Data) => {
    const packages = filteredPackages;

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

    // Governorate analytics
    const governorateData: {
      [productName: string]: {
        [governorate: string]: number;
      };
    } = {};

    const totalSalesByGovernorate: { [governorate: string]: number } = {};

    packages.forEach((pkg) => {
      const { productInCheckout } = pkg.Checkout;
      const date = format(new Date(parseInt(pkg.createdAt)), "yyyy-MM-dd");
      const governorate = pkg.Checkout.Governorate?.name || "Non spécifié";

      productInCheckout.forEach((item) => {
        const { product, productQuantity } = item;
        const { name, price, reference } = product;

        // Time-based sales logic
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

        // Governorate analytics
        if (!governorateData[name]) {
          governorateData[name] = {};
        }
        if (!governorateData[name][governorate]) {
          governorateData[name][governorate] = 0;
        }
        governorateData[name][governorate] += productQuantity;

        if (!totalSalesByGovernorate[governorate]) {
          totalSalesByGovernorate[governorate] = 0;
        }
        totalSalesByGovernorate[governorate] += productQuantity;
      });
    });

    return {
      productSales,
      productQuantities,
      governorateData,
      totalSalesByGovernorate
    };
  };

  const {
    productSales,
    productQuantities,
    governorateData,
    totalSalesByGovernorate
  } = useMemo(() => processData(data), [filteredPackages]);

  // Get top 5 products for detailed analysis
  const topProducts = useMemo(() => {
    return Object.entries(productQuantities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);
  }, [productQuantities]);

  // Chart data for time series
  const timeChartData = useMemo(() => {
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
      backgroundColor: `hsla(${(index * 360) / productNames.length}, 70%, 50%, 0.2)`,
      fill: false,
      tension: 0.4,
    }));

    return { labels, datasets };
  }, [productSales]);

  // Chart data for governorate distribution
  const governorateChartData = useMemo(() => {
    const governorates = Object.keys(totalSalesByGovernorate);
    const values = Object.values(totalSalesByGovernorate);

    return {
      labels: governorates,
      datasets: [{
        data: values,
        backgroundColor: governorates.map((_, index) =>
          `hsl(${(index * 360) / governorates.length}, 65%, 60%)`
        ),
        borderColor: '#fff',
        borderWidth: 2,
      }]
    };
  }, [totalSalesByGovernorate]);

  // Chart options
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 20,
          font: { size: 11, family: "'Inter', sans-serif" },
          padding: 15
        }
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const dataIndex = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            const date = format(timeChartData.labels[dataIndex] as Date, "yyyy-MM-dd");
            const product = timeChartData.datasets[datasetIndex].label;
            const productInfo = productSales[date]?.[product];

            if (productInfo) {
              const { quantity, price, reference } = productInfo;
              return `${product} - Qté: ${quantity}, Réf: ${reference}, Prix: ${price} TND`;
            }
            return "";
          },
        },
      },
      title: {
        display: true,
        text: "Évolution des ventes par produit",
        font: { size: 16, family: "'Inter', sans-serif", weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e293b'
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "PP",
          displayFormats: { day: "MMM d" },
        },
        title: {
          display: true,
          text: "Date",
          font: { size: 12, family: "'Inter', sans-serif", weight: 'bold' },
          color: '#64748b'
        },
        grid: { display: false },
        ticks: { font: { size: 11, family: "'Inter', sans-serif" } }
      },
      y: {
        title: {
          display: true,
          text: "Quantité vendue",
          font: { size: 12, family: "'Inter', sans-serif", weight: 'bold' },
          color: '#64748b'
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 11, family: "'Inter', sans-serif" }
        },
        grid: { color: "rgba(0, 0, 0, 0.05)" }
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: { size: 11, family: "'Inter', sans-serif" },
          padding: 15,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: "Répartition par gouvernorat",
        font: { size: 16, family: "'Inter', sans-serif", weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e293b'
      },
    },
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recherche de Produit</h2>
            <p className="text-gray-600 text-sm mt-1">
              Recherchez un produit pour voir sa répartition par gouvernorat
              {dateRange && dateRange.from && dateRange.to && (
                <span className="block text-blue-600 font-medium mt-1">
                  Période: {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                </span>
              )}
            </p>
          </div>
          <SearchProduct onProductSelect={handleProductSelect} />
        </div>
      </div>

      {/* Selected Product Info - Now with properly filtered data */}
      {filteredSelectedProductData && (
        <SelectedProductInfo
          selectedProduct={filteredSelectedProductData}
          onClearSelection={handleClearSelection}
          dateRange={dateRange}
        />
      )}

      {/* Charts Grid */}
      <ChartsGrid
        timeChartData={timeChartData}
        governorateChartData={governorateChartData}
        chartOptions={chartOptions}
        doughnutOptions={doughnutOptions}
      />
    </div>
  );
};

export default SalesChart;