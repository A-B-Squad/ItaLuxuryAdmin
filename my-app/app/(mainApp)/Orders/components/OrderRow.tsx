import { Order } from "@/app/types";
import Link from "next/link";
import React from "react";
import { AiOutlinePrinter } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { translatePaymentMethodStatus } from "../../Helpers/_translateStatus";

interface OrderRowProps {
  order: Order;
  formatDate: (timestamp: string) => string;
  translateStatus: (status: string) => string;
  generateInvoice: (order: Order, deliveryPrice: number) => void;
  deliveryPrice: number;
}

const OrderRow: React.FC<OrderRowProps> = ({
  order,
  formatDate,
  translateStatus,
  generateInvoice,
  deliveryPrice,
}) => (
  <tr
    key={order.id}
    className={`border-b h-10 text-sm text-center ${
      order.status === "CANCELLED" ? "cancelled-order" : ""
    }`}
    style={
      order.status === "CANCELLED"
        ? {
            background:
              "repeating-linear-gradient(45deg,#fff,#fff 10px,#f6f6f6 0,#f6f6f6 20px)",
          }
        : {}
    }
  >
    <td className="text-blue-600">{order.customId}</td>
    <td>{formatDate(order.createdAt)}</td>
    <td>
      {order.Checkout.userId ? order.Checkout.userId : "Client(e) Invite"}
    </td>
    <td>
      <span
        className={`px-2 py-1 rounded ${
          order.status === "PAYED_AND_DELIVERED"
            ? "bg-green-100 text-green-600"
            : order.status === "PROCESSING" ||
              order.status === "PAYED_NOT_DELIVERED"
            ? "bg-yellow-100 text-yellow-800"
            : order.status === "CANCELLED" || order.status === "PAYMENT_REFUSED"
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800"
        }`}
      >
        {translateStatus(order.status)}
      </span>
    </td>
    <td>{translatePaymentMethodStatus(order.Checkout.paymentMethod)} </td>
    <td>{order.Checkout.freeDelivery ? 0 : deliveryPrice.toFixed(3)} DT</td>
    <td>{order.Checkout.total.toFixed(3)} DT</td>

    <td className="Edits py-3 text-sm">
      <div className="flex items-center justify-center gap-2">
        <Link
          href={{
            pathname: "Orders/UpdateOrder",
            query: {
              orderId: order.id,
            },
          }}
          className="p-2 w-9 flex items-center justify-center hover:opacity-40 transition-opacity shadow-md h-9 rounded-full border-2"
        >
          <FiEdit2 size={18} />
        </Link>

        <button
          type="button"
          onClick={() => generateInvoice(order, deliveryPrice)}
          title="Imprimer Bonne"
          className="p-2 w-9 h-9 flex items-center justify-center hover:opacity-40 transition-opacity shadow-md rounded-full border-2"
        >
          <AiOutlinePrinter size={20} />
        </button>
      </div>
    </td>
  </tr>
);

export default OrderRow;
