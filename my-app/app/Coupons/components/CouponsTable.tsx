import React from "react";
import SmallSpinner from "@/app/components/SmallSpinner";
import CouponsRow from "./CouponsRow";

interface Coupon {
  id: string;
  // Add other properties as needed
}

interface CouponsTableProps {
  coupons: Coupon[];
  onDeleteClick: any;
  loading: boolean;
}

const CouponsTable: React.FC<CouponsTableProps> = ({
  coupons,
  onDeleteClick,
  loading,
}) => (
  <section className="container mx-auto py-6 px-3 relative">
    <div className="w-full mb-8 overflow-hidden rounded-lg shadow-md">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Coupon Code</th>
              <th className="px-4 py-3 text-left">Available</th>
              <th className="px-4 py-3 text-left">Discount %</th>
              <th className="px-4 py-3 text-left">Utilisée</th>
              <th className="px-4 py-3 text-left">Checkout Id</th>
              <th className="px-4 py-3 text-left">Edits</th>
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
                  onDeleteClick={onDeleteClick}
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
