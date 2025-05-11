import React from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import { FiCopy, FiCheck } from "react-icons/fi";

const OrderReference = ({ order, OrderStatus }: any) => {
  const { copied, copyToClipboard } = useCopyToClipboard();
  console.log(OrderStatus)
  return (
    <div className="orderRef bg-white shadow-sm border rounded-lg mb-6">
      <h2 className="text-lg border-b font-semibold mb-4 p-6 py-3">
        Réf de commande {order?.customId}
        {order?.deliveryReference && (
          <button
            onClick={() => copyToClipboard(order.deliveryReference)}
            className="ml-2 text-sm text-gray-600 flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer group"
            title="Cliquer pour copier"
          >
            (Réf livraison: {order.deliveryReference})
            {copied ? (
              <FiCheck className="text-green-500" size={14} />
            ) : (
              <FiCopy className="opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
            )}
          </button>
        )}
      </h2>
      <div className="p-6">
        <Table className="border">
          <TableHeader className="bg-gray-50 p-1">
            <TableRow>
              <TableHead>Impression</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order?.Checkout.productInCheckout.map((item: any, index: any) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center">
                    <Image
                      width={200}
                      height={200}
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 border mr-2"
                    />
                    <p className="text-blue-800 w-56 font-medium">
                      {item.product.reference}
                    </p>
                    <p className="text-blue-800 w-56 font-medium">
                      {item.product.name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  DT{" "}
                  {item.discountedPrice
                    ? item.discountedPrice.toFixed(2)
                    : item.price.toFixed(2)}
                </TableCell>
                <TableCell>{item.productQuantity}</TableCell>
                <TableCell>
                  DT{" "}
                  {(
                    (item.discountedPrice || item.price) * item.productQuantity
                  ).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(OrderStatus === "CONFIRMED" ||
          OrderStatus === "PROCESSING") && (
            <div className="w-full flex justify-end">
              <Link
                href={{
                  pathname: "CreateOrder",
                  query: {
                    orderId: order?.id,
                  },
                }}
                className="px-4 py-2 self-end bg-mainColorAdminDash hover:opacity-70 transition-opacity text-white rounded mt-4"
              >
                Modifier la commande
              </Link>
            </div>
          )}
      </div>
    </div>
  );
};

export default OrderReference;
