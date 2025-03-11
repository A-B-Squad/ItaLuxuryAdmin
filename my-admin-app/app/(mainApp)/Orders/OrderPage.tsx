"use client";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import React, { useState, useCallback, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { COMPANY_INFO_QUERY, PACKAGES_QUERY } from "../../graph/queries";
import Pagination from "../components/Paginations";
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

  // Company info query with error handling
  const { error: companyError } = useQuery(COMPANY_INFO_QUERY, {
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
    onError: (error) => {
      console.error("Error fetching company info:", error);
      // Continue with default delivery price
    }
  });

  // Main query with better error handling
  const { loading, error, data, refetch } = useQuery(PACKAGES_QUERY, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Memoized filter function for better performance
  const filteredOrders = useMemo(() => {
    if (!data?.getAllPackages) return [];

    return data.getAllPackages.filter((order: any) => {
      const userId = order.Checkout?.userId || "";
      const userName = order.Checkout?.userName || "";
      const orderDate = new Date(parseInt(order.createdAt));
      const searchLower = (searchCommande || "").toLowerCase();

      const matchesSearch =
        order.customId.toLowerCase().includes(searchLower) ||
        userId.toLowerCase().includes(searchLower) ||
        userName.toLowerCase().includes(searchLower) ||
        (order.Checkout?.phone || []).some((phone: string) =>
          phone.toLowerCase().includes(searchLower)
        );

      const matchesFilter =
        filter === "Toute" || translateStatus(order.status) === filter;

      const matchesDateRange =
        !dateRange ||
        !dateRange.from ||
        !dateRange.to ||
        (orderDate >= dateRange.from && orderDate <= dateRange.to);

      return matchesSearch && matchesFilter && matchesDateRange;
    });
  }, [data, searchCommande, filter, dateRange]);

  // Memoized pagination calculations
  const { currentOrders, totalPages } = useMemo(() => {
    const indexOfLastOrder = page * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    return { currentOrders, totalPages };
  }, [filteredOrders, page]);

  // Callbacks for actions to prevent unnecessary re-renders
  const handleExportPDF = useCallback(() => {
    exportToPDFAllPackageList(filteredOrders, dateRange, deliveryPrice);
  }, [filteredOrders, dateRange, deliveryPrice]);

  const handleExportEXCEL = useCallback(() => {
    exportToEXCELAllPackage(filteredOrders, dateRange, deliveryPrice);
  }, [filteredOrders, dateRange, deliveryPrice]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleClearFilters = useCallback(() => {
    setSearchCommande("");
    setFilter("Toute");
    setDateRange(undefined);
    setShowCalendar(false);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleDateSelect = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.to) setShowCalendar(false);
    setPage(1); // Reset to first page when date changes
  }, []);

  // Handle loading and error states with better UX
  if (loading && !data) return <Loading />;

  return (
    <div className="p-2 sm:p-4 lg:p-6 w-full h-full relative pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dashboard-neutral-800">Commandes</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-dashboard-neutral-500 hidden md:inline">
            {filteredOrders.length} commandes trouvées
          </span>
          <Link
            href="/Orders/CreateOrder"
            className="bg-dashboard-primary hover:bg-dashboard-primary/90 transition-colors text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <span className="mr-1">+</span> Nouvelle commande
          </Link>
        </div>
      </div>

      {/* Error message display */}
      {(error || companyError) && (
        <div className="mb-4 p-4 bg-dashboard-danger/10 border border-dashboard-danger/30 rounded-lg text-dashboard-danger">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">Erreur de chargement des données</p>
              <p className="text-sm mt-1">{error?.message || companyError?.message || "Veuillez réessayer ou contacter l'administrateur."}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-3 text-sm font-medium bg-dashboard-danger/20 hover:bg-dashboard-danger/30 text-dashboard-danger px-3 py-1 rounded-md transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-dashboard-neutral-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-dashboard-neutral-200">
          {/* Search Input */}
          <div className="w-full sm:w-auto sm:flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par ID, client ou téléphone..."
                className="w-full border border-dashboard-neutral-300 p-2 pl-8 rounded-md focus:outline-none focus:ring-2 focus:ring-dashboard-primary/30 focus:border-dashboard-primary"
                value={searchCommande}
                onChange={(e) => {
                  setSearchCommande(e.target.value);
                  setPage(1); // Reset to first page when search changes
                }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-dashboard-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter Select */}
          <div className="w-full sm:w-auto">
            <select
              className="w-full sm:w-auto border border-dashboard-neutral-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-dashboard-primary/30 focus:border-dashboard-primary bg-white"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1); // Reset to first page when filter changes
              }}
            >
              <option>Toute</option>
              <option>ANNULÉ</option>
              <option>EN TRAITEMENT</option>
              <option>COMMANDE CONFIRMÉ</option>
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
              className="w-full sm:w-auto border border-dashboard-neutral-300 p-2 rounded-md flex items-center justify-center gap-2 hover:bg-dashboard-neutral-100 transition-colors"
              aria-label="Sélectionner dates"
              aria-expanded={showCalendar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dateRange && dateRange.from && dateRange.to
                ? `${formatDate(dateRange.from.getTime().toString())} - ${formatDate(dateRange.to.getTime().toString())}`
                : "Sélectionner dates"}
            </button>
            {showCalendar && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCalendar(false)}
                  aria-hidden="true"
                ></div>
                <div className="absolute z-20 left-0 sm:left-auto right-0 sm:right-auto mt-2 shadow-lg">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    className="rounded-md border bg-white"
                  />
                </div>
              </>
            )}
          </div>

          {/* Clear and Reload Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-none border border-dashboard-neutral-300 px-4 py-2 rounded-md hover:bg-dashboard-neutral-100 transition-colors"
              onClick={handleClearFilters}
              aria-label="Effacer les filtres"
            >
              Effacer
            </button>
            <button
              onClick={handleRefresh}
              className="flex-1 sm:flex-none border border-dashboard-neutral-300 px-4 py-2 rounded-md hover:bg-dashboard-neutral-100 transition-colors"
              aria-label="Rafraîchir les données"
              disabled={loading}
            >
              {loading ? (
                <SmallSpinner />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        {loading && !data ? (
          <div className="flex justify-center p-8">
            <SmallSpinner />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-dashboard-neutral-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dashboard-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-dashboard-neutral-700">Aucune commande trouvée</h3>
            <p className="text-dashboard-neutral-500 mt-1">Essayez de modifier vos filtres ou d'ajouter une nouvelle commande.</p>
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
          <div className="p-4 border-t border-dashboard-neutral-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:mt-4 bg-white md:bg-transparent border-t md:border-0 border-dashboard-neutral-200 p-4 md:p-0 shadow-lg md:shadow-none z-10">
        <div className="flex flex-col sm:flex-row gap-3 max-w-screen-xl mx-auto">
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center justify-center gap-2 ${filteredOrders.length === 0
                ? "bg-dashboard-neutral-200 text-dashboard-neutral-500 cursor-not-allowed"
                : "bg-dashboard-secondary text-white hover:bg-dashboard-secondary/90 transition-colors"
              }`}
            onClick={handleExportPDF}
            disabled={filteredOrders.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter en PDF
          </button>
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center justify-center gap-2 ${filteredOrders.length === 0
                ? "bg-dashboard-neutral-200 text-dashboard-neutral-500 cursor-not-allowed"
                : "bg-dashboard-accent text-white hover:bg-dashboard-accent/90 transition-colors"
              }`}
            onClick={handleExportEXCEL}
            disabled={filteredOrders.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter en Excel
          </button>
          <Link
            href="/Orders/CreateOrder"
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-dashboard-primary text-white hover:bg-dashboard-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter une commande
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;