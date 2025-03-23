"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { COUPONS_QUERY } from "@/app/graph/queries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchBarForTables from "../components/SearchBarForTables";
import SmallSpinner from "../components/SmallSpinner";
import Pagination from "../components/Paginations";
import CouponsTable from "./components/CouponsTable";
import { DELETE_COUPONS_MUTATIONS } from "../../graph/mutations";
import DeleteModal from "../components/DeleteModal";
import { useToast } from "@/components/ui/use-toast";

interface Coupon {
  id: string;
  code: string;
  available: boolean;
  checkout: { id: string; createdAt: string }[];
}
interface CouponsProps {
  searchParams: {
    q?: string;
    order?: "USED" | "UNUSED";
    page?: string;
  };
}

const Coupons: React.FC<CouponsProps> = ({ searchParams }) => {
  const { q, order, page: pageParam } = searchParams;
  const { toast } = useToast();
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponsToDelete, setCouponsToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const PAGE_SIZE = 10;

  const [searchCoupons, { loading, error }] = useLazyQuery(COUPONS_QUERY);
  const [deleteCouponsMutation] = useMutation(DELETE_COUPONS_MUTATIONS);

  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await searchCoupons({
        variables: {
          page,
          pageSize: PAGE_SIZE,
        },
      });

      let fetchedCoupons = [...(data?.fetchAllCoupons || [])];
      setCoupons(fetchedCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast({
        title: "Erreur de chargement",
        description:
          "Une erreur est survenue lors du chargement des coupons. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }, [page, searchCoupons, toast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    // Update URL with current page
    if (page !== 1) {
      const url = new URL(window.location.href);
      url.searchParams.set('page', page.toString());
      router.replace(url.pathname + url.search);
    }
  }, [page, router]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    let result = [...coupons];

    // Apply search filter
    if (q) {
      result = result.filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(q.toLowerCase()) ||
          (coupon.checkout[0]?.id &&
            coupon.checkout[0].id.toLowerCase().includes(q.toLowerCase()))
      );
    }

    // Apply order filter
    if (order) {
      //  filter based on the order parameter
      if (order === "UNUSED") {
        result = result.filter(coupon => coupon.available === true);
      } else if (order === "USED") {
        result = result.filter(coupon => coupon.available === false);
      }


    }

    setFilteredCoupons(result);
  }, [coupons, q, order]);

  const handleDeleteCoupons = async () => {
    if (!couponsToDelete) return;

    setIsDeleting(true);

    try {
      await deleteCouponsMutation({
        variables: {
          couponsId: couponsToDelete.id,
        },
      });

      // Update local state instead of reloading the page
      setCoupons(prevCoupons =>
        prevCoupons.filter(coupon => coupon.id !== couponsToDelete.id)
      );

      toast({
        title: "Coupon supprimé",
        description: `Le coupon ${couponsToDelete.code} a été supprimé avec succès.`,
        className: "text-white bg-mainColorAdminDash border-0",
      });

      setCouponsToDelete(null);
      setShowDeleteModal(false);
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

  const totalCount = filteredCoupons.length;
  const numberOfPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="container w-full pb-5">
        <div className="flex justify-between items-center py-5 px-4">
          <h1 className="font-bold text-2xl">
            Coupons{" "}
            <span className="text-gray-600 font-medium text-base">
              ({totalCount || 0})
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
              <CouponsTable
                coupons={filteredCoupons.slice(
                  (page - 1) * PAGE_SIZE,
                  page * PAGE_SIZE,
                )}
                onDeleteClick={(coupon: Coupon) => {
                  setCouponsToDelete(coupon);
                  setShowDeleteModal(true);
                }}
                loading={loading}
              />

              {filteredCoupons.length > 0 && numberOfPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={numberOfPages}
                    onPageChange={setPage}
                  />
                </div>
              )}

              {filteredCoupons.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Aucun coupon trouvé</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {q ? "Essayez de modifier votre recherche ou" : "Commencez par"} créer un nouveau coupon.
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

      {showDeleteModal && couponsToDelete && (
        <DeleteModal
          sectionName="Coupons"
          itemName={couponsToDelete.code}
          onConfirm={handleDeleteCoupons}
          onCancel={() => {
            setCouponsToDelete(null);
            setShowDeleteModal(false);
          }}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default Coupons;
