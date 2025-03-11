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
  <table className="min-w-full divide-y divide-dashboard-neutral-200">
    <thead>
      <tr className="bg-dashboard-neutral-50">
        <th className="py-3 px-4 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Réf</th>
        <th className="py-3 px-4 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Date de création</th>
        <th className="py-3 px-4 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Client ID</th>
        <th className="py-3 px-4 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Client Nom</th>
        <th className="py-3 px-4 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Statut</th>
        <th className="py-3 px-4 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Méthode de Paiement</th>
        <th className="py-3 px-4 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Livraison</th>
        <th className="py-3 px-4 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Total</th>
        <th className="py-3 px-4 text-right text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-dashboard-neutral-200">
      {orders.length === 0 ? (
        <tr>
          <td colSpan={9} className="text-center py-8 text-dashboard-neutral-500">
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
);

export default OrderTable;
