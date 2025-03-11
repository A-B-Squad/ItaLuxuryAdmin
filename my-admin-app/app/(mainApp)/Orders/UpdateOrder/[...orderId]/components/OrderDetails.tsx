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
import {
  translatePaymentMethodStatus,
  translateStatus,
} from "@/app/(mainApp)/Helpers/_translateStatus";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const OrderDetails = ({
  order,
  handleCancelOrder,
  handleTransferToDeliveryOrder,
  handleConfirmedOrder,
  handlePayedPackageOrder,
  handleRefundOrder,
  deliveryPrice,
  isSubmitting,
}: any) => {
  const { toast, dismiss } = useToast();
  
  const calculateReimbursementAmount = () => {
    if (!order || !order.Checkout) return 0;
    let total = order.Checkout.total;
    if (!order.Checkout.freeDelivery) {
      total -= deliveryPrice;
    }
    return total.toFixed(3);
  };

  const showConfirmation = (action: string, callback: () => void) => {
    toast({
      title: "Confirmation",
      className: "text-white bg-mainColorAdminDash border-0",
      description: (
        <div>
          <p>Êtes-vous sûr de vouloir {action} ?</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                callback();
                dismiss();
              }}
              className="bg-mainColorAdminDash hover:bg-mainColorAdminDash/90 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Confirmer
            </button>
            <button
              onClick={() => dismiss()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ),
      duration: 10000,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
      PAYMENT_REFUSED: { bg: "bg-red-100", text: "text-red-700" },
      REFUNDED: { bg: "bg-purple-100", text: "text-purple-700" },
      PAYED_AND_DELIVERED: { bg: "bg-green-100", text: "text-green-700" },
      PROCESSING: { bg: "bg-yellow-100", text: "text-yellow-700" },
      CONFIRMED: { bg: "bg-blue-100", text: "text-blue-700" },
      PAYED_NOT_DELIVERED: { bg: "bg-indigo-100", text: "text-indigo-700" },
      TRANSFER_TO_DELIVERY_COMPANY: { bg: "bg-teal-100", text: "text-teal-700" },
    };

    const style = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700" };
    
    return (
      <span className={`${style.bg} ${style.text} px-2.5 py-1 rounded-full text-xs font-medium`}>
        {translateStatus(status)}
      </span>
    );
  };

  return (
    <div className="orderDetails bg-white shadow-sm border rounded-lg overflow-hidden">
      <div className="p-5 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold">Détails de la commande</h2>
          <div className="flex flex-wrap gap-2">
            {/* Closed order statuses */}
            {order?.status === "CANCELLED" && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                COMMANDE FERMÉE
              </Badge>
            )}
            {order?.status === "PAYMENT_REFUSED" && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase">
                  LE PAIEMENT A ÉTÉ REJETÉ
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  COMMANDE FERMÉE
                </Badge>
              </div>
            )}
            {order?.status === "REFUNDED" && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                COMMANDE REMBOURSÉE
              </Badge>
            )}
            {order?.status === "PAYED_AND_DELIVERED" && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                COMMANDE PAYÉE ET LIVRÉE
              </Badge>
            )}

            {/* Processing status - needs confirmation */}
            {order?.status === "PROCESSING" && (
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  onClick={() =>
                    showConfirmation("confirmer la commande", handleConfirmedOrder)
                  }
                  label="Confirmer la commande"
                  disabled={isSubmitting}
                  variant="success"
                />
                <ActionButton
                  onClick={() =>
                    showConfirmation("annuler la commande", handleCancelOrder)
                  }
                  label="Annuler la commande"
                  disabled={isSubmitting}
                  variant="danger"
                />
              </div>
            )}

            {/* Confirmed status - can transfer to delivery */}
            {order?.status === "CONFIRMED" && (
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  onClick={() =>
                    showConfirmation(
                      "transférer à la société de livraison",
                      handleTransferToDeliveryOrder
                    )
                  }
                  label="Transférer à la livraison"
                  disabled={isSubmitting}
                  variant="primary"
                />
                <ActionButton
                  onClick={() =>
                    showConfirmation("annuler la commande", handleCancelOrder)
                  }
                  label="Annuler la commande"
                  disabled={isSubmitting}
                  variant="danger"
                />
              </div>
            )}

            {/* Payed not delivered status */}
            {order?.status === "PAYED_NOT_DELIVERED" && (
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  onClick={() =>
                    showConfirmation(
                      "transférer à la société de livraison",
                      handleTransferToDeliveryOrder
                    )
                  }
                  label="Transférer à la livraison"
                  disabled={isSubmitting}
                  variant="primary"
                />
                <ActionButton
                  onClick={() =>
                    showConfirmation("annuler la commande", handleCancelOrder)
                  }
                  label="Annuler la commande"
                  disabled={isSubmitting}
                  variant="danger"
                />
              </div>
            )}

            {/* Transfer to delivery company status */}
            {order?.status === "TRANSFER_TO_DELIVERY_COMPANY" && (
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  onClick={() =>
                    showConfirmation(
                      "marquer comme payée",
                      handlePayedPackageOrder
                    )
                  }
                  label={`Marquer comme payée (${order?.Checkout?.total.toFixed(3)} DT)`}
                  disabled={isSubmitting}
                  variant="success"
                />
                <ActionButton
                  onClick={() =>
                    showConfirmation("annuler la commande", handleCancelOrder)
                  }
                  label="Annuler la commande"
                  disabled={isSubmitting}
                  variant="danger"
                />
              </div>
            )}

            {/* Payed and delivered - can refund */}
            {order?.status === "PAYED_AND_DELIVERED" && (
              <ActionButton
                onClick={() =>
                  showConfirmation("rembourser la commande", handleRefundOrder)
                }
                label={`Rembourser (${calculateReimbursementAmount()} DT)`}
                disabled={isSubmitting}
                variant="warning"
              />
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-medium">Numéro de commande</TableHead>
              <TableHead className="font-medium">Date de commande</TableHead>
              <TableHead className="font-medium">Statut</TableHead>
              <TableHead className="font-medium">Méthode de paiement</TableHead>
              <TableHead className="font-medium">Statut d'envoi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-blue-600 font-semibold">
                #{order?.customId}
              </TableCell>
              <TableCell>
                {new Date(parseInt(order?.createdAt)).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TableCell>
              <TableCell>
                {getStatusBadge(order?.status)}
              </TableCell>
              <TableCell>
                {translatePaymentMethodStatus(order?.Checkout.paymentMethod)}
              </TableCell>
              <TableCell>
                <span
                  className={`${
                    order?.status === "TRANSFER_TO_DELIVERY_COMPANY" ||
                    order?.status === "PAYED_AND_DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  } px-2.5 py-1 rounded-full text-xs font-medium`}
                >
                  {order?.status === "TRANSFER_TO_DELIVERY_COMPANY" ||
                  order?.status === "PAYED_AND_DELIVERED"
                    ? "Rempli"
                    : "Non Rempli"}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="p-5 border-t">
        <h3 className="font-medium mb-2 text-gray-700">Message de livraison</h3>
        {order?.Checkout?.deliveryComment ? (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
            <p>{order?.Checkout?.deliveryComment}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm">
            Aucun message de livraison fourni
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;