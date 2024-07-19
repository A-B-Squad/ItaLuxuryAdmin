import SmallSpinner from "@/app/components/SmallSpinner";
import CouponsRow from "./CouponsRow";

const CouponsTable = ({ coupons, onDeleteClick, loading }: any) => (
  <section className="container mx-auto py-6 px-3  relative">
    <div className="w-full mb-8 overflow-hidden rounded-lg">
      <div className="w-full overflow-x-auto">
        <table className="w-full border shadow-md">
          <thead>
            <tr className="text-sm font-semibold tracking-wide text-center text-gray-900 bg-gray-100 uppercase border-b border-gray-600">
              <th className="px-4 py-3">Coupon Code</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Discount %</th>
              <th className="px-4 py-3">Utilisée</th>
              <th className="px-4 py-3">checkout Id</th>
              <th className="px-4 py-3">Edits</th>
            </tr>
          </thead>
          <tbody className="bg-white border p-2 ">
            {loading ? (
              <tr>
                <td colSpan={6} className="h-64">
                  <SmallSpinner />
                </td>
              </tr>
            ) : (
              coupons.map((coupon: any) => (
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
