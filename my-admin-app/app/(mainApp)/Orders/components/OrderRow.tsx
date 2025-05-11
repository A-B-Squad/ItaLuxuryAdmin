import { Order } from "@/app/types";
import Link from "next/link";
import React from "react";
import { AiOutlinePrinter } from "react-icons/ai";
import { FiEdit2, FiCopy, FiCheck } from "react-icons/fi";
import { translatePaymentMethodStatus } from "../../Helpers/_translateStatus";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";

interface OrderRowProps {
  order: Order;
  formatDate: (timestamp: string) => string;
  translateStatus: (status: string) => string;
  generateInvoice: (order: Order, deliveryPrice: number) => void;
  deliveryPrice: number;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "PAYED_AND_DELIVERED":
      return "bg-dashboard-success/10 text-dashboard-success border border-dashboard-success/20";
    case "PROCESSING":
    case "PAYED_NOT_DELIVERED":
      return "bg-dashboard-warning/10 text-dashboard-warning border border-dashboard-warning/20";
    case "CANCELLED":
    case "PAYMENT_REFUSED":
      return "bg-dashboard-danger/10 text-dashboard-danger border border-dashboard-danger/20";
    case "CONFIRMED":
      return "bg-dashboard-info/10 text-dashboard-info border border-dashboard-info/20";
    case "TRANSFER_TO_DELIVERY_COMPANY":
      return "bg-dashboard-primary/10 text-dashboard-primary border border-dashboard-primary/20";
    case "REFUNDED":
      return "bg-dashboard-secondary/10 text-dashboard-secondary border border-dashboard-secondary/20";
    default:
      return "bg-dashboard-neutral-100 text-dashboard-neutral-600 border border-dashboard-neutral-200";
  }
};

const OrderRow: React.FC<OrderRowProps> = ({
  order,
  formatDate,
  translateStatus,
  generateInvoice,
  deliveryPrice,
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <tr
      className={`hover:bg-dashboard-neutral-50 transition-colors ${order.status === "CANCELLED"
          ? "bg-[repeating-linear-gradient(45deg,#fff,#fff_10px,#f9fafb_0,#f9fafb_20px)]"
          : ""
        }`}
    >
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dashboard-primary">
        {order.customId}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">
        {formatDate(order.createdAt)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">
        {order.Checkout.userId ? order.Checkout.userId : "Client(e) Invite"}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">
        <button
          onClick={() => copyToClipboard(order.Checkout.userName)}
          className="flex items-center gap-1 hover:text-dashboard-primary transition-colors cursor-pointer group"
          title="Cliquer pour copier"
        >
          {order.Checkout.userName}
          {copied ? (
            <FiCheck className="text-dashboard-success" size={14} />
          ) : (
            <FiCopy className="opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
          )}
        </button>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm">
        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusStyle(order?.status)}`}>
          {translateStatus(order.status)}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">
        {translatePaymentMethodStatus(order.Checkout.paymentMethod)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">
        {order.Checkout.freeDelivery ? (
          <span className="text-dashboard-success font-medium">Gratuit</span>
        ) : (
          `${deliveryPrice.toFixed(3)} DT`
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dashboard-neutral-900">
        {order.Checkout.total.toFixed(3)} DT
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={{
              pathname: "Orders/UpdateOrder",
              query: {
                orderId: order.id,
              },
            }}
            className="p-1.5 flex items-center justify-center hover:bg-dashboard-neutral-100 transition-colors rounded-md text-dashboard-neutral-700 hover:text-dashboard-primary"
            title="Modifier la commande"
          >
            <FiEdit2 size={18} />
          </Link>

          <button
            type="button"
            onClick={() => generateInvoice(order, deliveryPrice)}
            title="Imprimer Facture"
            className="p-1.5 flex items-center justify-center hover:bg-dashboard-neutral-100 transition-colors rounded-md text-dashboard-neutral-700 hover:text-dashboard-primary"
          >
            <AiOutlinePrinter size={18} />
          </button>
        </div>
      </td>
    </tr>
  )
};

export default OrderRow;
