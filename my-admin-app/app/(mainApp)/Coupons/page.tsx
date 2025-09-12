"use client";

import { COUPONS_QUERY } from "@/app/graph/queries";
import { useToast } from "@/components/ui/use-toast";
import { useLazyQuery, useMutation } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { DELETE_COUPONS_MUTATIONS } from "../../graph/mutations";
import DeleteModal from "../components/DeleteModal";
import Pagination from "../components/Paginations";
import SearchBarForTables from "../components/SearchBarForTables";
import SmallSpinner from "../components/SmallSpinner";
import CouponsTable from "./components/CouponsTable";

interface Coupon {
  id: string;
  code: string;
  available: boolean;
  discount: number;
  checkout: {
    id: string;
    createdAt: string;
  }[];
}

interface FetchAllCouponsData {
  fetchAllCoupons: {
    coupons: Coupon[];
    totalCount: number;
  };
}

interface CouponsProps {
  searchParams: {
    q?: string;
    sortBy?: "USED" | "UNUSED";
    page?: string;
  };
}

const Coupons: React.FC<CouponsProps> = ({ searchParams }) => {
  const { q, sortBy, page: pageParam } = searchParams;
  const { toast } = useToast();
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const PAGE_SIZE = 10;

  const [searchCoupons, { loading, error }] = useLazyQuery<FetchAllCouponsData>(COUPONS_QUERY);
  const [deleteCouponsMutation] = useMutation(DELETE_COUPONS_MUTATIONS);

  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await searchCoupons({
        variables: {
          page,
          pageSize: PAGE_SIZE,
        },
      });

      if (data?.fetchAllCoupons) {
        let fetchedCoupons = [...(data.fetchAllCoupons.coupons || [])];

        // Apply client-side filtering for search and sortBy
        if (q) {
          fetchedCoupons = fetchedCoupons.filter(
            (coupon) =>
              coupon.code.toLowerCase().includes(q.toLowerCase()) ||
              (coupon.checkout[0]?.id &&
                coupon.checkout[0].id.toLowerCase().includes(q.toLowerCase()))
          );
        }

        if (sortBy) {
          if (sortBy === "UNUSED") {
            fetchedCoupons = fetchedCoupons.filter(coupon => coupon.available === true);
          } else if (sortBy === "USED") {
            fetchedCoupons = fetchedCoupons.filter(coupon => coupon.available === false);
          }
        }

        setCoupons(fetchedCoupons);
        setTotalCount(data.fetchAllCoupons.totalCount);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast({
        title: "Erreur de chargement",
        description:
          "Une erreur est survenue lors du chargement des coupons. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }, [page, q, sortBy, searchCoupons, toast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    // Update URL with current page, search, and sortBy
    const url = new URL(window.location.href);

    if (page !== 1) {
      url.searchParams.set('page', page.toString());
    } else {
      url.searchParams.delete('page');
    }

    if (q) {
      url.searchParams.set('q', q);
    } else {
      url.searchParams.delete('q');
    }

    if (sortBy) {
      url.searchParams.set('sortBy', sortBy);
    } else {
      url.searchParams.delete('sortBy');
    }

    router.replace(url.pathname + url.search, { scroll: false });
  }, [page, q, sortBy, router]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    if (page !== 1 && (q || sortBy)) {
      setPage(1);
    }
  }, [q, sortBy, page]);

  const handleDeleteCoupons = async () => {
    if (selectedIds.length <= 0) return;

    setIsDeleting(true);

    try {
      await deleteCouponsMutation({
        variables: {
          couponsIds: selectedIds,
        },
      });

      toast({
        title: "Coupon supprimé",
        description: `Les coupons a été supprimé avec succès.`,
        className: "text-white bg-mainColorAdminDash border-0",
      });

      setShowDeleteModal(false);

      // Refetch data to update the list and count
      await fetchCoupons();
    } catch (error: any) {
      console.error("Error deleting coupons:", error);
      toast({
        title: "Erreur de suppression",
        description: error.message || "Une erreur est survenue lors de la suppression du coupon.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Calculate total pages based on filtered results
  const filteredTotalCount = q || sortBy ? coupons.length : totalCount;
  const numberOfPages = Math.ceil(filteredTotalCount / PAGE_SIZE);

  // For display purposes, show the current page of coupons
  const displayedCoupons = q || sortBy
    ? coupons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : coupons;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="container w-full pb-5">
        <div className="flex justify-between items-center py-5 px-4">
          <h1 className="font-bold text-2xl">
            Coupons{" "}
            <span className="text-gray-600 font-medium text-base">
              ({filteredTotalCount || 0})
            </span>
          </h1>

          <Link
            href="/Coupons/CreateCoupons"
            className="px-4 py-2 bg-mainColorAdminDash text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Créer un coupon
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
          <SearchBarForTables page="Coupons" />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <SmallSpinner />
                <p className="mt-4 text-gray-500">Chargement des coupons...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(true)
                  }}
                  disabled={selectedIds.length === 0}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  <MdDeleteOutline size={18} />
                  Supprimer la sélection ({selectedIds.length})
                </button>
              </div>

              <CouponsTable
                coupons={displayedCoupons}
                setSelectedIds={setSelectedIds}
                selectedIds={selectedIds}

                loading={loading}
              />

              {displayedCoupons.length > 0 && numberOfPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={numberOfPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {displayedCoupons.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Aucun coupon trouvé</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {q || sortBy ? "Essayez de modifier votre recherche ou filtres, ou" : "Commencez par"} créer un nouveau coupon.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/Coupons/CreateCoupons"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-mainColorAdminDash hover:bg-opacity-90"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Créer un coupon
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showDeleteModal && selectedIds.length && (
        <DeleteModal
          sectionName="Coupons"
          itemName={"Coupons"}
          onConfirm={handleDeleteCoupons}
          onCancel={() => {
            setShowDeleteModal(false);
          }}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default Coupons;