"use client";
import DateRangePicker from "@/components/ui/date-range-picker";
import { useQuery, useLazyQuery } from "@apollo/client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { DateRange } from "react-day-picker";
import { COMPANY_INFO_QUERY, PACKAGES_QUERY, PACKAGES_EXPORT_QUERY } from "../../graph/queries";
import Pagination from "../components/Paginations";
import SmallSpinner from "../components/SmallSpinner";
import { exportToEXCELAllPackage } from "../Helpers/_exportToEXCELAllPackage";
import { exportToPDFAllPackageList } from "../Helpers/_exportToPDFAllPackageList";
import { formatDate } from "../Helpers/_formatDate";
import { generateInvoice } from "../Helpers/_generateInvoice";
import { translateStatus } from "../Helpers/_translateStatus";
import OrderTable from "./components/OrderTable";
import Loading from "./loading";

const OrdersPage = () => {
  const [localSearchTerm, setLocalSearchTerm] = useState(""); // For input display
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // For actual queries
  const [filter, setFilter] = useState("Toute");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Debounce timer ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const ordersPerPage = 15;

  // Debounce the search term
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(localSearchTerm);
    }, 1000); 

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearchTerm]);

  // backend status filter
  const getStatusFilter = useCallback((filter: string) => {
    if (filter === "Toute") return undefined;
    
    const statusMap: Record<string, string> = {
      "ANNULÉ": "CANCELLED",
      "EN TRAITEMENT": "PROCESSING", 
      "COMMANDE CONFIRMÉ": "CONFIRMED",
      "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON": "TRANSFER_TO_DELIVERY_COMPANY",
      "PAYÉ ET LIVRÉ": "PAYED_AND_DELIVERED",
      "PAYÉ MAIS NON LIVRÉ": "PAYED_NOT_DELIVERED",
      "REMBOURSER": "REFUNDED"
    };
    
    return statusMap[filter] ? [statusMap[filter]] : undefined;
  }, []);

  // Company info query with error handling
  const { error: companyError } = useQuery(COMPANY_INFO_QUERY, {
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
    onError: (error) => {
      console.error("Error fetching company info:", error);
    }
  });

  // Add lazy query for export
  const [fetchAllOrdersForExport, { loading: exportLoading }] = useLazyQuery(
    PACKAGES_EXPORT_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  // Main query - now with proper server-side filtering using debounced search
  const { loading, error, data, refetch } = useQuery(PACKAGES_QUERY, {
    variables: {
      page: page,
      pageSize: ordersPerPage,
      searchTerm: debouncedSearchTerm || undefined, 
      dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
      dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined,
      statusFilter: getStatusFilter(filter)
    },
    onCompleted(data) {
      // Update page if server returns different pagination
      const serverCurrentPage = data.getAllPackages?.pagination?.currentPage;
      if (serverCurrentPage && serverCurrentPage !== page) {
        setPage(serverCurrentPage);
      }
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Get pagination info from server response
  const { totalPages, currentPage } = useMemo(() => ({
    totalPages: data?.getAllPackages?.pagination?.totalPages || 1,
    currentPage: data?.getAllPackages?.pagination?.currentPage || page
  }), [data, page]);

  // Get orders directly from server response (no client-side filtering needed)
  const orders = useMemo(() =>
    data?.getAllPackages?.packages || [],
    [data]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, filter, dateRange]);

  // Search input handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  }, []);

  // Optional: Add immediate search on Enter key
  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Clear timeout and search immediately
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      setDebouncedSearchTerm(localSearchTerm);
    }
  }, [localSearchTerm]);

  // Clear search function
  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm("");
    setDebouncedSearchTerm("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  // Export functions - use server-filtered data with debounced search
  const handleExportPDF = useCallback(async () => {
    try {
      const { data: exportData } = await fetchAllOrdersForExport({
        variables: {
          searchTerm: debouncedSearchTerm || undefined,
          dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
          dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined,
          statusFilter: getStatusFilter(filter),
        },
      });

      const allOrders = exportData?.getAllPackages?.packages || [];
      exportToPDFAllPackageList(allOrders, dateRange, deliveryPrice);
    } catch (error) {
      console.error("Error fetching orders for export:", error);
      // Fallback to current page orders
      exportToPDFAllPackageList(orders, dateRange, deliveryPrice);
    }
  }, [
    fetchAllOrdersForExport,
    debouncedSearchTerm, 
    dateRange,
    filter,
    getStatusFilter,
    deliveryPrice,
    orders, 
  ]);

  const handleExportEXCEL = useCallback(async () => {
    try {
      const { data: exportData } = await fetchAllOrdersForExport({
        variables: {
          searchTerm: debouncedSearchTerm || undefined, 
          dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
          dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined,
          statusFilter: getStatusFilter(filter),
        },
      });

      const allOrders = exportData?.getAllPackages?.packages || [];
      exportToEXCELAllPackage(allOrders, dateRange, deliveryPrice);
    } catch (error) {
      console.error("Error fetching orders for export:", error);
      // Fallback to current page orders
      exportToEXCELAllPackage(orders, dateRange, deliveryPrice);
    }
  }, [
    fetchAllOrdersForExport,
    debouncedSearchTerm, 
    dateRange,
    filter,
    getStatusFilter,
    deliveryPrice,
    orders, 
  ]);

 // Function to call the delivery status check API
 const checkDeliveryStatuses = useCallback(async () => {
  try {
    setIsCheckingStatus(true);
    console.log("Checking delivery statuses via API route...");

    // Call the API route with the secret if available and a cache-busting timestamp
    const response = await fetch(`/api/cron/check-delivery-status?secret=d8f3a7b5c2e9f1h6j4k8m0n3p5q7r9t2v4x6z8`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Delivery status check result:", result);

    // If statuses were updated, refresh the data with a complete network refetch
    if (result.success && result.results?.some((r: { newStatus: string }) => r.newStatus)) {
      await refetch({
        fetchPolicy: 'network-only'
      });
    }
  } catch (error) {
    console.error("Error checking delivery statuses:", error);
  } finally {
    setIsCheckingStatus(false);
  }
}, [refetch]);

  const handleRefresh = useCallback(() => {
    refetch();
    checkDeliveryStatuses();
  }, [refetch, checkDeliveryStatuses]);

  const handleClearFilters = useCallback(() => {
    setLocalSearchTerm(""); // Clear local search
    setDebouncedSearchTerm(""); // Clear debounced search immediately
    setFilter("Toute");
    setDateRange(undefined);
    setPage(1);
    
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  // Proper page change handler
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Call the API when the page loads
  useEffect(() => {
    checkDeliveryStatuses();
  }, [checkDeliveryStatuses]);

  // Display loading state
  if (loading && !data) return <Loading />;

  return (
    <div className="p-2 sm:p-4 lg:p-6 w-full h-full relative pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dashboard-neutral-800">Commandes</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-dashboard-neutral-500 hidden md:inline">
            {orders.length} commandes trouvées
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
          {/* Updated Search Input with debounce */}
          <div className="w-full sm:w-auto sm:flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par ID, client ou téléphone..."
                className="w-full border border-dashboard-neutral-300 p-2 pl-8 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-dashboard-primary/30 focus:border-dashboard-primary"
                value={localSearchTerm} // Use local search term
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-dashboard-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              {/* Loading indicator when search is happening */}
              {localSearchTerm !== debouncedSearchTerm && (
                <div className="absolute right-8 top-3">
                  <div className="animate-spin h-4 w-4 border-2 border-dashboard-primary border-t-transparent rounded-full"></div>
                </div>
              )}
              
              {/* Clear search button */}
              {localSearchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-3 text-dashboard-neutral-400 hover:text-dashboard-neutral-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Search hint */}
            <p className="text-xs text-dashboard-neutral-500 mt-1">
              {localSearchTerm !== debouncedSearchTerm 
                ? "Recherche en cours..." 
                : debouncedSearchTerm 
                ? `Résultats pour: "${debouncedSearchTerm}"`
                : "Tapez pour rechercher (Entrée pour recherche immédiate)"
              }
            </p>
          </div>

          {/* Filter Select */}
          <div className="w-full sm:w-auto">
            <select
              className="w-full sm:w-auto border border-dashboard-neutral-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-dashboard-primary/30 focus:border-dashboard-primary bg-white"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                // Page reset is handled by useEffect
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
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
          />

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
              disabled={loading || isCheckingStatus}
            >
              {loading || isCheckingStatus ? (
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
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-dashboard-neutral-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dashboard-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-dashboard-neutral-700">Aucune commande trouvée</h3>
            <p className="text-dashboard-neutral-500 mt-1">
              {debouncedSearchTerm || filter !== "Toute" || dateRange 
                ? "Essayez de modifier vos filtres pour voir plus de résultats."
                : "Commencez par ajouter une nouvelle commande."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <OrderTable
              orders={orders}
              formatDate={formatDate}
              translateStatus={translateStatus}
              generateInvoice={generateInvoice}
              deliveryPrice={deliveryPrice}
            />
          </div>
        )}

        {/* Pagination */}
        {orders.length > 0 && totalPages > 1 && (
          <div className="p-4 border-t border-dashboard-neutral-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="relative bottom-0 left-0 right-0 md:relative md:mt-4 bg-white md:bg-transparent border-t md:border-0 border-dashboard-neutral-200 p-4 md:p-0 shadow-lg md:shadow-none z-10">
        <div className="flex flex-col sm:flex-row gap-3 max-w-screen-xl mx-auto">
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center justify-center gap-2 ${orders.length === 0 || exportLoading
              ? "bg-dashboard-neutral-200 text-dashboard-neutral-500 cursor-not-allowed"
              : "bg-dashboard-secondary text-white hover:bg-dashboard-secondary/90 transition-colors"
              }`}
            onClick={handleExportPDF}
            disabled={orders.length === 0 || exportLoading}
          >
            {exportLoading ? (
              <SmallSpinner />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Exporter en PDF
          </button>
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center justify-center gap-2 ${orders.length === 0 || exportLoading
              ? "bg-dashboard-neutral-200 text-dashboard-neutral-500 cursor-not-allowed"
              : "bg-dashboard-accent text-white hover:bg-dashboard-accent/90 transition-colors"
              }`}
            onClick={handleExportEXCEL}
            disabled={orders.length === 0 || exportLoading}
          >
            {exportLoading ? (
              <SmallSpinner />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
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