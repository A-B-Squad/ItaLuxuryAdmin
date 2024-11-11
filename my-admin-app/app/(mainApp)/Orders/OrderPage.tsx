"use client";
import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import { COMPANY_INFO_QUERY, PACKAGES_QUERY } from "../../graph/queries";

import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import Pagination from "../components/Paginations";
import ReloadButton from "../components/ReloadPage";
import SmallSpinner from "../components/SmallSpinner";
import { exportToEXCELAllPackage } from "../Helpers/_exportToEXCELAllPackage";
import { exportToPDFAllPackageList } from "../Helpers/_exportToPDFAllPackageList";
import { formatDate } from "../Helpers/_formatDate";
import { generateInvoice } from "../Helpers/_generateInvoice";
import {
  translateStatus
} from "../Helpers/_translateStatus";
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
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);



  const handleExportPDF = () => {
    exportToPDFAllPackageList(filteredOrders, dateRange, deliveryPrice);
  };


  const handleExportEXCEL = () => {
    exportToEXCELAllPackage(filteredOrders, dateRange, deliveryPrice);
  };




  return (
    <div className="p-6 w-full h-full relative pb-20">
      <h1 className="text-2xl font-bold mb-4">Commandes</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="flex p-4 space-x-4 mb-4">
          <input
            type="text"
            placeholder="Rechercher une commande"
            className="border p-2 rounded flex-grow"
            value={searchCommande}
            onChange={(e) => setSearchCommande(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Toute</option>
            <option>ANNULÉ</option>
            <option>EN TRAITEMENT </option>
            <option>TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON </option>
            <option>PAYÉ ET LIVRÉ</option>
            <option>PAYÉ MAIS NON LIVRÉ</option>
            <option>REMBOURSER</option>
          </select>

          <div className="flex flex-col relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="border p-2 rounded"
            >
              {showCalendar ? "Hide Calendar" : "Show Calendar"}
            </button>
            {showCalendar && (
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md border absolute bg-white top-10 left-0 z-10"
              />
            )}
            {dateRange && dateRange.from && dateRange.to && (
              <div className="mt-2">
                Selected range:{" "}
                {formatDate(dateRange.from.getTime().toString())} -{" "}
                {formatDate(dateRange.to.getTime().toString())}
              </div>
            )}
          </div>

          <button
            className="border px-4 py-2 rounded"
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

        {loading ? (
          <div className="flex justify-center ">
            <SmallSpinner />
          </div>
        ) : (
          <OrderTable
            orders={currentOrders}
            formatDate={formatDate}
            translateStatus={translateStatus}
            generateInvoice={generateInvoice}
            deliveryPrice={deliveryPrice}
          />
        )}

        {filteredOrders.length > 0 && (
          <div className="pb-4 pl-4 mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-4 absolute">
        <button
          className={`bg-mainColorAdminDash text-white px-4 py-2 rounded ${filteredOrders.length === 0
            ? "cursor-not-allowed"
            : "cursor-pointer"
            }`}
          onClick={handleExportPDF}
          disabled={filteredOrders.length === 0}
        >
          Exporter en PDF
        </button>
        <button
          className={`bg-mainColorAdminDash text-white px-4 py-2 rounded ${filteredOrders.length === 0
            ? "cursor-not-allowed"
            : "cursor-pointer"
            }`}
          onClick={handleExportEXCEL}
          disabled={filteredOrders.length === 0}
        >
          Exporter en Excel
        </button>
        <Link
          href={"Orders/CreateOrder"}
          className="bg-mainColorAdminDash text-white px-4 py-2 rounded"
        >
          + Ajouter une commande
        </Link>
      </div>
    </div>
  );
};

export default OrdersPage;
