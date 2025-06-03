"use client";
import { Packages } from "@/app/types";
import DateRangePicker from "@/components/ui/date-range-picker";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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



const OrdersPage = () => {
  // Basic state
  const [searchCommande, setSearchCommande] = useState("");
  const [filter, setFilter] = useState("Toute");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Using a single set to track checked references with their status
  const checkedReferencesRef = useRef(new Map<string, string>());

  const ordersPerPage = 15;

  // Company info query with error handling
  const { error: companyError } = useQuery(COMPANY_INFO_QUERY, {
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
    onError: (error) => {
      console.error("Error fetching company info:", error);
    }
  });

  // Main query with better error handling and pagination
  const { loading, error, data, refetch } = useQuery(PACKAGES_QUERY, {
    variables: {
      page: (searchCommande || (dateRange?.from && dateRange?.to)) ? undefined : page,
      pageSize: (searchCommande || (dateRange?.from && dateRange?.to)) ? undefined : ordersPerPage,
      searchTerm: searchCommande || undefined,
      dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
      dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined
    },
    onCompleted(data) {
      if (!searchCommande && !dateRange?.from && !dateRange?.to) {
        setPage(data.getAllPackages.pagination.currentPage);
      }
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Update pagination to use server response
  const { totalPages, currentPage } = useMemo(() => ({
    totalPages: (searchCommande || (dateRange?.from && dateRange?.to)) ? 1 : (data?.getAllPackages?.pagination.totalPages || 0),
    currentPage: (searchCommande || (dateRange?.from && dateRange?.to)) ? 1 : (data?.getAllPackages?.pagination.currentPage || page)
  }), [data, page, searchCommande, dateRange]);

  // Get orders from paginated response
  const orders = useMemo(() =>
    data?.getAllPackages?.packages || [],
    [data]);

  // Memoized search term for better performance
  const searchLower = useMemo(() =>
    (searchCommande || "").toLowerCase(),
    [searchCommande]);

  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];

    return orders.filter((order: Packages) => {
      const userId = (order.Checkout?.userId || "").toLowerCase();
      const userName = (order.Checkout?.userName || "").toLowerCase();
      const deliveryRef = (order.deliveryReference || "").toLowerCase();
      const customId = order.customId.toLowerCase();
      const orderDate = new Date(parseInt(order.createdAt));

      // Check search criteria first - most likely to filter out items
      const matchesSearch =
        deliveryRef.includes(searchLower) ||
        customId.includes(searchLower) ||
        userId.includes(searchLower) ||
        userName.includes(searchLower) ||
        (order.Checkout?.phone || []).some((phone: string) =>
          phone.toLowerCase().includes(searchLower)
        );

      if (!matchesSearch) return false;

      const matchesFilter =
        filter === "Toute" || translateStatus(order.status) === filter;

      if (!matchesFilter) return false;

      // Finally check date range - most expensive operation
      if (!dateRange || !dateRange.from || !dateRange.to) return true;

      return orderDate >= dateRange.from && orderDate <= dateRange.to;
    });
  }, [orders, searchLower, filter, dateRange]);

  // Export functions with stable dependencies
  const handleExportPDF = useCallback(() => {
    exportToPDFAllPackageList(filteredOrders, dateRange, deliveryPrice);
  }, [filteredOrders, dateRange, deliveryPrice]);

  const handleExportEXCEL = useCallback(() => {
    exportToEXCELAllPackage(filteredOrders, dateRange, deliveryPrice);
  }, [filteredOrders, dateRange, deliveryPrice]);

  const handleRefresh = useCallback(() => {
    refetch();
    checkDeliveryStatuses();
  }, [refetch]);

  const handleClearFilters = useCallback(() => {
    setSearchCommande("");
    setFilter("Toute");
    setDateRange(undefined);
    setPage(1);
  }, []);

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

  // Call the API when the page loads
  useEffect(() => {
    checkDeliveryStatuses();
  }, [checkDeliveryStatuses]);


  // // Mutation for updating package status
  // const [updatePackageStatus] = useMutation(PAYED_OR_TO_DELIVERY_PACKAGE_MUTATIONS);

  // // Consolidated function to check delivery status with the agency API
  // const checkDeliveryStatusWithAgency = useCallback(async (deliveryReference: string) => {
  //   // Step 1: Make API request to check status
  //   try {
  //     console.log(`[Step 1] Checking delivery status for reference: ${deliveryReference}`);
  //     const response = await fetch(`/api/jax-delivery/check-status?referenceId=${deliveryReference}`, {
  //       cache: 'no-store',
  //       headers: {
  //         'Cache-Control': 'no-cache',
  //         'Pragma': 'no-cache'
  //       }
  //     });

  //     // Step 2: Handle API response
  //     if (!response.ok) {
  //       console.error(`[Step 2] Error checking delivery status: ${response.status}`);
  //       return null;
  //     }

  //     const result = await response.json();
  //     console.log(`[Step 2] Status for ${deliveryReference}:`, result);
  //     return result.status;
  //   } catch (error) {
  //     console.error('[Step 2] Error checking with delivery agency:', error);
  //     return null;
  //   }
  // }, []);

  // // Update package status based on delivery status
  // const updatePackageBasedOnStatus = useCallback(async (order: Packages, currentStatus: string) => {
  //   const { id, deliveryReference, customId, Checkout, status: orderStatus } = order;

  //   // Step 3: Validate order data
  //   if (!deliveryReference) {
  //     console.log(`[Step 3] Order ${customId} has no delivery reference, skipping`);
  //     return null;
  //   }

  //   // Step 4: Check if status has changed
  //   const prevStatus = checkedReferencesRef.current.get(deliveryReference);
  //   console.log(`[Step 4] Order ${customId} - Previous status: ${prevStatus || 'none'}, Current status: ${currentStatus}, Order status: ${orderStatus}`);

  //   if (prevStatus === currentStatus) {
  //     console.log(`[Step 4] Status unchanged for ${customId}, skipping update`);
  //     return null;
  //   }

  //   // Step 5: Determine if status update is needed
  //   let newStatus = null;

  //   if ((currentStatus === DELIVERY_STATUS.RECEIVED ||
  //     currentStatus === DELIVERY_STATUS.PREPARING_TRANSFER || currentStatus === DELIVERY_STATUS.IN_THE_PROCESS_OF_DELIVERY) &&
  //     orderStatus === STATUS.CONFIRMED) {
  //     newStatus = STATUS.TRANSFER_TO_DELIVERY_COMPANY;
  //     console.log(`[Step 5] Order ${customId} qualifies for TRANSFER_TO_DELIVERY_COMPANY update`);
  //   } else if (currentStatus === DELIVERY_STATUS.DELIVERED &&
  //     orderStatus === STATUS.TRANSFER_TO_DELIVERY_COMPANY) {
  //     newStatus = STATUS.PAYED_AND_DELIVERED;
  //     console.log(`[Step 5] Order ${customId} qualifies for PAYED_AND_DELIVERED update`);
  //   } else {
  //     console.log(`[Step 5] Order ${customId} does not qualify for status update. Current order status: ${orderStatus}, Delivery status: ${currentStatus}`);
  //   }

  //   // Step 6: Update the package status if needed
  //   if (newStatus) {
  //     try {
  //       console.log(`[Step 6] Attempting to update order ${customId} to ${newStatus}`);
  //       const result = await updatePackageStatus({
  //         variables: {
  //           packageId: id,
  //           paymentMethod: Checkout?.paymentMethod,
  //           status: newStatus,
  //         }
  //       });

  //       // Step 7: Record the updated status
  //       checkedReferencesRef.current.set(deliveryReference, currentStatus);
  //       console.log(`[Step 7] Successfully updated order ${customId} to ${newStatus}`);
  //       return result;
  //     } catch (err) {
  //       console.error(`[Step 6] Error updating status for order ${customId}:`, err);
  //     }
  //   }

  //   // Step 7: Record the checked status even if we didn't update
  //   checkedReferencesRef.current.set(deliveryReference, currentStatus || prevStatus || '');
  //   return null;
  // }, [updatePackageStatus]);


  // // Effect to check delivery statuses when data changes
  // useEffect(() => {
  //   // Only run the check when data is loaded for the first time or explicitly refreshed
  //   if (data?.getAllPackages && !isCheckingStatus) {
  //     // Use a debounce to prevent multiple rapid checks
  //     const timer = setTimeout(() => {
  //       checkAllDeliveryStatuses();
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [data?.getAllPackages?.packages?.length, isCheckingStatus]);

  // // Modify the checkAllDeliveryStatuses function to add a check for recent executions
  // const lastCheckRef = useRef<number>(0);

  // const checkAllDeliveryStatuses = useCallback(async (forceCheck = false) => {
  //   // Step 0: Initial validation
  //   if (!data?.getAllPackages?.packages) {
  //     console.log("[Step 0] No package data available to check statuses");
  //     return;
  //   }

  //   if (isCheckingStatus) {
  //     console.log("[Step 0] Status check already in progress, skipping");
  //     return;
  //   }

  //   // Prevent frequent checks unless forced
  //   const now = Date.now();
  //   if (!forceCheck && now - lastCheckRef.current < 30000) { // 30 seconds cooldown
  //     console.log("[Step 0] Status check performed recently, skipping");
  //     return;
  //   }

  //   lastCheckRef.current = now;
  //   console.log(`[Step 0] Starting status check for all orders (force check: ${forceCheck})`);
  //   setIsCheckingStatus(true);

  //   // Rest of the function remains the same
  //   try {
  //     // Step 1: Filter orders that need checking
  //     const relevantOrders = data.getAllPackages.packages.filter(
  //       (order: Packages) => {
  //         const shouldCheck = (order.status === STATUS.CONFIRMED || order.status === STATUS.TRANSFER_TO_DELIVERY_COMPANY) &&
  //           order.deliveryReference &&
  //           (forceCheck || !checkedReferencesRef.current.has(order.deliveryReference));

  //         if (shouldCheck) {
  //           console.log(`[Step 1] Will check order: ${order.customId}, status: ${order.status}, ref: ${order.deliveryReference}`);
  //         }
  //         return shouldCheck;
  //       }
  //     );

  //     console.log(`[Step 1] Found ${relevantOrders.length} orders to check`);

  //     if (relevantOrders.length === 0) {
  //       console.log("[Step 1] No relevant orders to check, exiting");
  //       return;
  //     }

  //     // Step 2: Process orders in parallel
  //     console.log("[Step 2] Starting parallel processing of orders");
  //     const updatePromises = relevantOrders.map(async (order: Packages) => {
  //       if (!order.deliveryReference) return null;

  //       // Steps 3-4: Check delivery status and update if needed
  //       const currentStatus = await checkDeliveryStatusWithAgency(order.deliveryReference);
  //       if (currentStatus) {
  //         return updatePackageBasedOnStatus(order, currentStatus);
  //       }
  //       console.log(`[Step 4] Could not get status for ${order.customId}`);
  //       return null;
  //     });

  //     // Step 5: Collect results and refresh if needed
  //     const results = await Promise.all(updatePromises);
  //     const updatedCount = results.filter(Boolean).length;

  //     console.log(`[Step 5] Status check complete. Updated ${updatedCount} out of ${relevantOrders.length} orders`);

  //     if (updatedCount > 0) {
  //       console.log("[Step 6] Refreshing data after updates");
  //       await refetch();
  //     }
  //   } catch (error) {
  //     console.error("[Error] Error in checkAllDeliveryStatuses:", error);
  //   } finally {
  //     setIsCheckingStatus(false);
  //     console.log("[Complete] Status check process finished");
  //   }
  // }, [data, updatePackageBasedOnStatus, checkDeliveryStatusWithAgency, refetch, isCheckingStatus]);

  // Display loading state
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
                  setPage(1);
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
                setPage(1);
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
            <DateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
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
              orders={filteredOrders}
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
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="relative bottom-0 left-0 right-0 md:relative md:mt-4 bg-white md:bg-transparent border-t md:border-0 border-dashboard-neutral-200 p-4 md:p-0 shadow-lg md:shadow-none z-10">
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