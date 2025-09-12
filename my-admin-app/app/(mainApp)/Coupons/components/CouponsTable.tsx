import React from "react";
import SmallSpinner from "../../components/SmallSpinner";
import CouponsRow from "./CouponsRow";
import { Dispatch, SetStateAction } from 'react';

interface Coupon {
  id: string;
}


interface CouponsTableProps {
  coupons: Coupon[];
  loading: boolean;
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  selectedIds: String[];
}

const CouponsTable: React.FC<CouponsTableProps> = ({
  coupons,
  loading, setSelectedIds, selectedIds
}) => (
  <section className="container mx-auto py-6 px-3 relative">
    <div className="w-full mb-8 overflow-hidden rounded-lg shadow-md">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Coupon</th>
              <th className="px-4 py-3 text-left">Coupon Code</th>
              <th className="px-4 py-3 text-left">Available</th>
              <th className="px-4 py-3 text-left">Discount %</th>
              <th className="px-4 py-3 text-left">Utilisée</th>
              <th className="px-4 py-3 text-left">Checkout Id</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="h-64">
                  <SmallSpinner />
                </td>
              </tr>
            ) : (
              coupons.map((coupon: Coupon) => (
                <CouponsRow
                  key={coupon.id}
                  coupons={coupon}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                />

              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default CouponsTable;