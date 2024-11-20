"use client";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { COMPANY_INFO_QUERY, PACKAGES_QUERY } from "../../graph/queries";
import Pagination from "../components/Paginations";
import ReloadButton from "../components/ReloadPage";
import SmallSpinner from "../components/SmallSpinner";
import { exportToEXCELAllPackage } from "../Helpers/_exportToEXCELAllPackage";
import { exportToPDFAllPackageList } from "../Helpers/_exportToPDFAllPackageList";
import { formatDate } from "../Helpers/_formatDate";
import { generateInvoice } from "../Helpers/_generateInvoice";
import { translateStatus } from "../Helpers/_translateStatus";
import OrderTable from "./components/OrderTable";
import Loading from "./loading";

const OrdersPage: React.FC = () => {
  const [searchCommande, setSearchCommande] = useState("");
  const [filter, setFilter] = useState("Toute");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const ordersPerPage = 15;

  useQuery(COMPANY_INFO_QUERY, {
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
  });

  const { loading, error, data } = useQuery(PACKAGES_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  if (loading) return <Loading />;
  if (error) return <p>Erreur : {error.message}</p>;

  // Filtrage des commandes
  const filteredOrders = data.getAllPackages.filter((order: any) => {
    const userId = order.Checkout?.userId || "";
    const userName = order.Checkout?.userName || "";
    const orderDate = new Date(parseInt(order.createdAt));

    const searchLower = (searchCommande || "").toLowerCase();

    const matchesSearch =
      order.customId.toLowerCase().includes(searchLower) ||
      userId.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower)
    const matchesFilter =
      filter === "Toute" || translateStatus(order.status) === filter;

    const matchesDateRange =
      !dateRange ||
      !dateRange.from ||
      !dateRange.to ||
      (orderDate >= dateRange.from && orderDate <= dateRange.to);

    return matchesSearch && matchesFilter && matchesDateRange;
  });

  const indexOfLastOrder = page * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleExportPDF = () => {
    exportToPDFAllPackageList(filteredOrders, dateRange, deliveryPrice);
  };

  const handleExportEXCEL = () => {
    exportToEXCELAllPackage(filteredOrders, dateRange, deliveryPrice);
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 w-full h-full relative  pb-52">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Commandes</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 mb-4">
          {/* Search Input */}
          <div className="w-full sm:w-auto sm:flex-grow">
            <input
              type="text"
              placeholder="Rechercher une commande"
              className="w-full border p-2 rounded"
              value={searchCommande}
              onChange={(e) => setSearchCommande(e.target.value)}
            />
          </div>

          {/* Filter Select */}
          <div className="w-full sm:w-auto">
            <select
              className="w-full sm:w-auto border p-2 rounded"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>Toute</option>
              <option>ANNULÉ</option>
              <option>EN TRAITEMENT</option>
              <option>TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON</option>
              <option>PAYÉ ET LIVRÉ</option>
              <option>PAYÉ MAIS NON LIVRÉ</option>
              <option>REMBOURSER</option>
            </select>
          </div>

          {/* Calendar Section */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full sm:w-auto border p-2 rounded"
            >
              {showCalendar ? "Hide Calendar" : "Show Calendar"}
            </button>
            {showCalendar && (
              <div className="absolute z-20 left-0 sm:left-auto right-0 sm:right-auto mt-2">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  className="rounded-md border bg-white"
                />
              </div>
            )}
            {dateRange && dateRange.from && dateRange.to && (
              <div className="mt-2 text-sm">
                Selected range:{" "}
                <div className="flex flex-col sm:flex-row sm:gap-1">
                  <span>{formatDate(dateRange.from.getTime().toString())}</span>
                  <span>-</span>
                  <span>{formatDate(dateRange.to.getTime().toString())}</span>
                </div>
              </div>
            )}
          </div>

          {/* Clear and Reload Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-none border px-4 py-2 rounded"
              onClick={() => {
                setSearchCommande("");
                setFilter("Toute");
                setDateRange(undefined);
                setShowCalendar(false);
              }}
            >
              Effacer
            </button>
            <ReloadButton />
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center">
            <SmallSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <OrderTable
              orders={currentOrders}
              formatDate={formatDate}
              translateStatus={translateStatus}
              generateInvoice={generateInvoice}
              deliveryPrice={deliveryPrice}
            />
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="pb-4 px-4 mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:space-x-4 fixed -bottom-0 lg:bottom-0 left-0 w-full p-4 bg-white border-t sm:relative sm:bg-transparent sm:border-t-0">
        <button
          className={`w-full sm:w-auto bg-mainColorAdminDash text-white px-4 py-2 rounded ${filteredOrders.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          onClick={handleExportPDF}
          disabled={filteredOrders.length === 0}
        >
          Exporter en PDF
        </button>
        <button
          className={`w-full sm:w-auto bg-mainColorAdminDash text-white px-4 py-2 rounded ${filteredOrders.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          onClick={handleExportEXCEL}
          disabled={filteredOrders.length === 0}
        >
          Exporter en Excel
        </button>
        <Link
          href={"Orders/CreateOrder"}
          className="w-full sm:w-auto bg-mainColorAdminDash text-white px-4 py-2 rounded text-center"
        >
          + Ajouter une commande
        </Link>
      </div>
    </div>
  );
};

export default OrdersPage;