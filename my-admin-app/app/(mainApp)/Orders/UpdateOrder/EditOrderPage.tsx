"use client";
import { generateInvoice } from "@/app/(mainApp)/Helpers/_generateInvoice";
import {
  CANCEL_PACKAGE_MUTATIONS,
  PAYED_OR_TO_DELIVERY_PACKAGE_MUTATIONS,
  REFUND_PACKAGE_MUTATIONS,
} from "@/app/graph/mutations";
import {
  COMPANY_INFO_QUERY,
  GET_GOVERMENT_INFO,
  PACKAGE_BY_ID_QUERY,
} from "@/app/graph/queries";
import { useToast } from "@/components/ui/use-toast";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { CiSaveDown2 } from "react-icons/ci";
import CancelModal from "./[...orderId]/components/CancelModal";
import Comments from "./[...orderId]/components/Comments";
import CustomerInfo from "./[...orderId]/components/CustomerInfo";
import OrderDetails from "./[...orderId]/components/OrderDetails";
import OrderReference from "./[...orderId]/components/OrderReference";
import OrderTotalPrice from "./[...orderId]/components/OrderTotalPrice";
import RefundModal from "./[...orderId]/components/RefundModal";

const EditOrderPage = ({ searchParams }: any) => {
  const { toast } = useToast();
  const orderId = searchParams ? searchParams.orderId : "";
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [productStatuses, setProductStatuses] = useState<{
    [key: string]: { broken: boolean; quantity: number };
  }>({});
  const [getPackage, { data, loading, error, refetch }] = useLazyQuery(
    PACKAGE_BY_ID_QUERY,
    {
      onCompleted: (data) => {
        console.log(data?.packageById.Checkout.paymentMethod);
      },
    },
  );
  const [payedOrToDeliveryPackage] = useMutation(
    PAYED_OR_TO_DELIVERY_PACKAGE_MUTATIONS,
  );
  const [cancelPackage] = useMutation(CANCEL_PACKAGE_MUTATIONS);
  const [refundPackage] = useMutation(REFUND_PACKAGE_MUTATIONS);
  const [governmentInfo, setGovernmentInfo] = useState<{
    [key: string]: string;
  }>({});
  const order = data?.packageById;

  useQuery(COMPANY_INFO_QUERY, {
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
  });

  useQuery(GET_GOVERMENT_INFO, {
    onCompleted: (data) => {
      const govMap = data.allGovernorate.reduce((map: any, gov: any) => {
        map[gov.id] = gov.name;
        return map;
      }, {});
      setGovernmentInfo(govMap);
    },
  });

  useEffect(() => {
    if (orderId) {
      getPackage({
        variables: { packageId: orderId },
        fetchPolicy: "network-only",
      });
    }
  }, [orderId, getPackage]);

  const handleStatusChange = (productId: string, isBroken: boolean) => {
    setProductStatuses((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        broken: isBroken,
      },
    }));
  };

  const initializeProductStatuses = () => {
    const initialStatuses =
      data?.packageById?.Checkout.productInCheckout.reduce(
        (acc: any, product: any) => {
          acc[product.product.id] = {
            items: Array(product.productQuantity).fill(false),
            quantity: product.productQuantity,
          };
          return acc;
        },
        {},
      );
    setProductStatuses(initialStatuses);
  };

  const handleCancelOrder = () => {
    initializeProductStatuses();
    setShowCancelModal(true);
  };

  const handleRefundOrder = () => {
    initializeProductStatuses();
    setShowRefundModal(true);
  };

  const handleCancelPackage = async () => {
    const brokenProducts = Object.entries(productStatuses).flatMap(
      ([productId, status]: any) => {
        const brokenCount = status.items.filter(Boolean).length;
        return brokenCount > 0 ? [{ productId, quantity: brokenCount }] : [];
      },
    );

    try {
      await cancelPackage({
        variables: {
          input: {
            packageId: orderId,
            cause: brokenProducts.length > 0 ? "BROKEN" : "CANCEL",
            brokenProducts,
          },
        },
      });
      setShowCancelModal(false);
      refetch();
      toast({
        title: "Commande annulée",
        description: "La commande a été annulée avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error cancelling package:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de l'annulation de la commande.",
        variant: "destructive",
      });
    }
  };

  const handleRefundSubmit = async () => {
    const brokenProducts = Object.entries(productStatuses).flatMap(
      ([productId, status]: any) => {
        const brokenCount = status.items.filter(Boolean).length;
        return brokenCount > 0 ? [{ productId, quantity: brokenCount }] : [];
      },
    );

    try {
      await refundPackage({
        variables: {
          input: {
            packageId: orderId,
            cause: brokenProducts.length > 0 ? "BROKEN" : "REFUND",
            brokenProducts,
          },
        },
      });
      setShowRefundModal(false);
      refetch();
      toast({
        title: "Commande remboursée",
        description: "La commande a été remboursée avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error refunding package:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors du remboursement de la commande.",
        variant: "destructive",
      });
    }
  };

  const handleTransferToDeliveryOrder = async () => {
    try {
      await payedOrToDeliveryPackage({
        variables: {
          packageId: orderId,
          paymentMethod: order?.Checkout.paymentMethod,
          status: "TRANSFER_TO_DELIVERY_COMPANY",
        },
      });
      await refetch();
      toast({
        title: "Commande transférée",
        description:
          "La commande a été transférée à la société de livraison avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating package status:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors du transfert de la commande.",
        variant: "destructive",
      });
    }
  };

  const handlePayedPackageOrder = async () => {
    try {
      await payedOrToDeliveryPackage({
        variables: {
          packageId: orderId,
          paymentMethod: order?.Checkout.paymentMethod,
          status: "PAYED_AND_DELIVERED",
        },
      });
      await refetch();
      toast({
        title: "Commande payée",
        description: "La commande a été marquée comme payée avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating package status:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour du statut de paiement.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <div className="order w-full py-4 sm:py-6 md:py-10">
      <div className="container w-full px-4">
        {/* Header */}
        <h1 className="text-xl sm:text-2xl font-bold mb-4 md:mb-6">
          Modifier la commande #{order?.customId}
        </h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <OrderDetails
              deliveryPrice={deliveryPrice}
              order={order}
              handleCancelOrder={handleCancelOrder}
              handleTransferToDeliveryOrder={handleTransferToDeliveryOrder}
              handlePayedPackageOrder={handlePayedPackageOrder}
              handleRefundOrder={handleRefundOrder}
            />

            <OrderReference
              order={order}
              OrderStatus={order?.status}
            />

            <OrderTotalPrice
              order={order}
              deliveryPrice={deliveryPrice}
              freeDelivery={order?.Checkout.freeDelivery}
            />

            <Comments
              comments={order?.comments}
              packageId={orderId}
              refetch={refetch}
            />
          </div>

          {/* Customer Info Sidebar */}
          <div className="lg:col-span-4">
            <CustomerInfo
              governmentInfo={governmentInfo}
              order={order}
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="bg-white shadow-md fixed left-0 bottom-0 w-full py-4 flex items-center gap-2 px-2 border justify-end">
        <button
          onClick={() => generateInvoice(order, deliveryPrice)}
          className="w-full sm:w-auto text-white flex items-center justify-center gap-2 bg-mainColorAdminDash hover:opacity-85 transition-all px-4 py-2.5 rounded-md tracking-wider"
        >
          <span className="text-sm sm:text-base">Imprimer la commande</span>
          <CiSaveDown2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Modals */}
      {showCancelModal && (
        <CancelModal
          order={order}
          productStatuses={productStatuses}
          setProductStatuses={setProductStatuses}
          handleStatusChange={handleStatusChange}
          handleCancelPackage={handleCancelPackage}
          setShowCancelModal={setShowCancelModal}
        />
      )}

      {showRefundModal && (
        <RefundModal
          order={order}
          productStatuses={productStatuses}
          setProductStatuses={setProductStatuses}
          handleStatusChange={handleStatusChange}
          handleRefundSubmit={handleRefundSubmit}
          setShowRefundModal={setShowRefundModal}
        />
      )}
    </div>
  );
};

export default EditOrderPage;