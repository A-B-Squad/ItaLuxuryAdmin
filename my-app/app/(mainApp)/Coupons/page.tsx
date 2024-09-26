"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { COUPONS_QUERY } from "@/app/graph/queries";

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

interface InventoryProps {
  searchParams: {
    q?: string;
    order?: "USED" | "UNUSED";
  };
}

const Coupons: React.FC<InventoryProps> = ({ searchParams }) => {
  const { q, order } = searchParams;
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponsToDelete, setCouponsToDelete] = useState<string>("");
  const PAGE_SIZE = 10;

  const [searchCoupons, { loading }] = useLazyQuery(COUPONS_QUERY);
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
        title: "Erreur de coupons",
        description:
          "Une erreur est survenue lors de la recherche des coupons. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }, [page, searchCoupons]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    let result = [...coupons];

    // Apply search filter
    if (q) {
      result = result.filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(q.toLowerCase()) ||
          coupon.checkout[0]?.id.toLowerCase().includes(q.toLowerCase()),
      );
    }

    // Apply order filter
    if (order) {
      result.sort((a, b) =>
        order === "UNUSED"
          ? Number(a.available) - Number(b.available)
          : Number(b.available) - Number(a.available),
      );
    }

    setFilteredCoupons(result);
  }, [coupons, q, order]);

  const handleDeleteCoupons = async () => {
    if (!couponsToDelete) return;
    try {
      await deleteCouponsMutation({
        variables: {
          couponsId: couponsToDelete,
        },
      });
      await fetchCoupons();
      window.location.reload();

      setCouponsToDelete("");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting coupons:", error);
      toast({
        title: "Erreur de suppression",
        description:
          "Une erreur est survenue lors de la suppression des coupons. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const totalCount = filteredCoupons.length;
  const numberOfPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="w-full">
      <div className="container w-full pb-5">
        <h1 className="font-bold text-2xl py-5 px-4 w-full">
          Coupons{" "}
          <span className="text-gray-600 font-medium text-base">
            ({totalCount || 0})
          </span>
        </h1>
        <div className="mt-5 ">
          <SearchBarForTables page="Coupons" />
          {loading ? (
            <div className="flex justify-center ">
              <SmallSpinner />
            </div>
          ) : (
            <CouponsTable
              coupons={filteredCoupons.slice(
                (page - 1) * PAGE_SIZE,
                page * PAGE_SIZE,
              )}
              onDeleteClick={(coupon: Coupon) => {
                setCouponsToDelete(coupon.id);
                setShowDeleteModal(true);
              }}
              loading={loading}
            />
          )}
          {filteredCoupons.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={numberOfPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
      {showDeleteModal && couponsToDelete && (
        <DeleteModal
          sectionName="Coupons"
          onConfirm={handleDeleteCoupons}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default Coupons;
