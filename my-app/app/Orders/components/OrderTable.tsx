import React from "react";
import OrderRow from "./OrderRow";

interface Order {
  id: string;
  createdAt: string;
  Checkout: {
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
  <section className=" mx-auto py-6   relative">
    <div className="w-full mb-8 overflow-hidden rounded-lg">
      <div className="w-full ">
        <table className="w-full">
          <thead>
            <tr className="text-center">
              <th>Réf</th>
              <th>Date de création</th>
              <th>Client</th>
              <th>Statut</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <OrderRow
                key={order.id}
                order={order}
                formatDate={formatDate}
                translateStatus={translateStatus}
                generateInvoice={generateInvoice}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default OrderTable;
