import React from "react";
import OrderRow from "./OrderRow";
import { Order } from "@/app/types";

interface OrderTableProps {
  orders: any;
  formatDate: (timestamp: string) => string;
  translateStatus: (status: string) => string;
  generateInvoice: (order: Order, deliveryPrice: number) => void;
  deliveryPrice: number;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  formatDate,
  translateStatus,
  generateInvoice,
  deliveryPrice,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white">
      <thead className="bg-gray-800 text-white">
        <tr>
          <th className="py-3 px-4 text-center">Réf</th>
          <th className="py-3 px-4 text-center">Date de création</th>
          <th className="py-3 px-4 text-center">Client id</th>
          <th className="py-3 px-4 text-center">Statut</th>
          <th className="py-3 px-4 text-center">Livraison</th>
          <th className="py-3 px-4 text-center">Total</th>
          <th className="py-3 px-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-4">
              Aucune commande disponible
            </td>
          </tr>
        ) : (
          orders.map((order: Order) => (
            <OrderRow
              key={order.id}
              order={order}
              formatDate={formatDate}
              translateStatus={translateStatus}
              generateInvoice={generateInvoice}
              deliveryPrice={deliveryPrice}
            />
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default OrderTable;
