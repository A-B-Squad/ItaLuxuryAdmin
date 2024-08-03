import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ActionButton from "./ActionButton";
import { translateStatus } from "@/app/Helpers/_translateStatus";
import { useToast } from "@/components/ui/use-toast";

const OrderDetails = ({
  order,
  handleCancelOrder,
  handleTransferToDeliveryOrder,
  handlePayedPackageOrder,
  handleRefundOrder,
}: any) => {
  const { toast, dismiss } = useToast();
  const calculateReimbursementAmount = () => {
    if (!order || !order.Checkout) return 0;

    let total = order.Checkout.total;

    // // Subtract delivery fee if total is less than 499
    total -= 8;

    return total.toFixed(2); // Ensure the reimbursement is not negative
  };

  const showConfirmation = (action: string, callback: () => void) => {
    toast({
      title: "Confirmation",
      className: "text-white bg-mainColorAdminDash border-0",

      description: (
        <div>
          <p>Êtes-vous sûr de vouloir {action} ?</p>
          <div className="mt-2">
            <button
              onClick={() => {
                callback();
                dismiss();
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
            >
              Confirmer
            </button>
            <button
              onClick={() => {
                dismiss();
              }}
              className="bg-gray-500 text-white px-2 py-1 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      ),
    });
  };
  return (
    <div className="orderDetails bg-white shadow-md border rounded-lg p-6 mb-6">
      <div className="w-full flex justify-between items-center mb-4 pb-2 border-b">
        <h2 className="text-base font-medium w-36">Détails de la commande</h2>
        <div className="space-x-2 flex items-center">
          {order?.status === "CANCELLED" && (
            <p className="py-1 px-2 bg-blue-200 text-blue-600">
              COMMANDE FERMÉE
            </p>
          )}
          {order?.status === "REFUNDED" && (
            <p className="py-1 px-2 bg-blue-200 text-blue-600">
              COMMANDE REMBOURSÉE
            </p>
          )}
          {order?.status === "PAYED" && (
            <p className="py-1 px-2 bg-blue-200 text-blue-600">
              COMMANDE PAYÉE
            </p>
          )}
          {order?.status === "PROCESSING" && (
            <>
              <ActionButton
                onClick={() =>
                  showConfirmation("annuler la commande", handleCancelOrder)
                }
                label="Annuler la commande"
              />
              <ActionButton
                onClick={() =>
                  showConfirmation(
                    "transférer à la société de livraison",
                    handleTransferToDeliveryOrder,
                  )
                }
                label="Transférer à la société de livraison"
              />
            </>
          )}
          {order?.status === "TRANSFER_TO_DELIVERY_COMPANY" && (
            <>
              <ActionButton
                onClick={() =>
                  showConfirmation("annuler la commande", handleCancelOrder)
                }
                label="Annuler la commande"
              />
              <ActionButton
                onClick={() =>
                  showConfirmation(
                    "marquer comme payée",
                    handlePayedPackageOrder,
                  )
                }
                label={`Marquer comme payée (${order?.Checkout?.total.toFixed(
                  3,
                )} DT)`}
              />
            </>
          )}
          {order?.status === "PAYED" && (
            <ActionButton
              onClick={() =>
                showConfirmation("rembourser la commande", handleRefundOrder)
              }
              label={`Rembourser la commande (${calculateReimbursementAmount()} DT)`}
            />
          )}
        </div>
      </div>
      <Table className="border">
        <TableHeader className="bg-gray-50 p-1">
          <TableRow>
            <TableHead>Affichage de la commande</TableHead>
            <TableHead>Commandé à</TableHead>
            <TableHead>Statut de paiement</TableHead>
            <TableHead>Statut d'envoi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="text-blue-600 font-semibold">
              {order?.customId}
            </TableCell>
            <TableCell>
              {new Date(parseInt(order?.createdAt)).toLocaleString()}
            </TableCell>
            <TableCell>
              <span
                className={`bg-${
                  order?.status === "PAYED" ? "green" : "yellow"
                }-200 text-${
                  order?.status === "PAYED" ? "green" : "yellow"
                }-800 px-2 py-1 rounded`}
              >
                {translateStatus(order?.status)}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`bg-${
                  order?.status === "TRANSFER_TO_DELIVERY_COMPANY"
                    ? "green"
                    : "yellow"
                }-200 text-${
                  order?.status === "TRANSFER_TO_DELIVERY_COMPANY"
                    ? "green"
                    : "yellow"
                }-800 px-2 py-1 rounded`}
              >
                {order?.status === "TRANSFER_TO_DELIVERY_COMPANY" ||
                order?.status === "PAYED"
                  ? "Rempli"
                  : "Non Rempli"}
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderDetails;
