import React from "react";
import OrderRow from "./OrderRow";

interface Order {
  id: string;
  customId: string;
  createdAt: string;
  Checkout: {
    userId: string;
    userName: string;
    total: number;
  };
  status: string;
}

interface OrderTableProps {
  orders: any;
  formatDate: (timestamp: string) => string;
  translateStatus: (status: string) => string;
  generateInvoice: (order: Order) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  formatDate,
  translateStatus,
  generateInvoice,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white">
      <thead className="bg-gray-800 text-white">
        <tr>
          <th className="py-3 px-4 text-left">Réf</th>
          <th className="py-3 px-4 text-left">Date de création</th>
          <th className="py-3 px-4 text-left">Client id</th>
          <th className="py-3 px-4 text-left">Statut</th>
          <th className="py-3 px-4 text-left">Total</th>
          <th className="py-3 px-4 text-left">Actions</th>
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
            />
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default OrderTable;
