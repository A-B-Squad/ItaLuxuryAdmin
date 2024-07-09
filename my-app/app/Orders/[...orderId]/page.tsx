"use client";
import React, { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { PACKAGE_BY_ID_QUERY } from "@/app/graph/queries";
import {
  CANCEL_PACKAGE_MUTATIONS,
  PAYED_OR_TO_DELIVERY_PACKAGE_MUTATIONS,
  REFUND_PACKAGE_MUTATIONS,
} from "@/app/graph/mutations";
import OrderDetails from "./components/OrderDetails";
import OrderReference from "./components/OrderReference";
import OrderTotalPrice from "./components/OrderTotalPrice";
import Comments from "./components/Comments";
import ClientInfo from "./components/ClientInfo";
import CancelModal from "./components/CancelModal";
import RefundModal from "./components/RefundModal";
import { generateInvoice } from "@/app/Helpers/_generateInvoice";
import { CiSaveDown2 } from "react-icons/ci";

const EditOrderPage = ({ searchParams }: any) => {
  const { orderId } = searchParams;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [productStatuses, setProductStatuses] = useState<{
    [key: string]: { broken: boolean; quantity: number };
  }>({});
  const [getPackage, { data, loading, error, refetch }] =
    useLazyQuery(PACKAGE_BY_ID_QUERY);
  const [payedOrToDeliveryPackage] = useMutation(
    PAYED_OR_TO_DELIVERY_PACKAGE_MUTATIONS
  );
  const [cancelPackage] = useMutation(CANCEL_PACKAGE_MUTATIONS);
  const [refundPackage] = useMutation(REFUND_PACKAGE_MUTATIONS);

  useEffect(() => {
    if (orderId) {
      getPackage({ variables: { packageId: orderId } });
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
    console.log(data?.packageById?.Checkout,"tetetet");
    
    const initialStatuses = data?.packageById?.Checkout.productInCheckout.reduce(
      (acc: any, product: any) => {
        acc[product.product.id] = {
          items: Array(product.productQuantity).fill(false),
          quantity: product.productQuantity,
        };
        return acc;
      },
      {}
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

  const handleCancelSubmit = async () => {

    const brokenProducts = Object.entries(productStatuses).flatMap(
      ([productId, status]: any) => {
        const brokenCount = status.items.filter(Boolean).length;
        return brokenCount > 0 ? [{ productId, quantity: brokenCount }] : [];
      }
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
    } catch (error) {
      console.error("Error cancelling package:", error);
    }

  };

  const handleRefundSubmit = async () => {
    const brokenProducts = Object.entries(productStatuses).flatMap(
      ([productId, status]: any) => {
        const brokenCount = status.items.filter(Boolean).length;
        return brokenCount > 0 ? [{ productId, quantity: brokenCount }] : [];
      }
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
    } catch (error) {
      console.error("Error refunding package:", error);
    }
  };

  const handleModifyOrder = () => {
    // Logique pour modifier la commande
  };

  const handleTransferToDeliveryOrder = async () => {
    try {
      await payedOrToDeliveryPackage({
        variables: {
          packageId: orderId,
          status: "TRANSFER_TO_DELIVERY_COMPANY",
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error updating package status:", error);
    }
  };

  const handlePayedPackageOrder = async () => {
    try {
      await payedOrToDeliveryPackage({
        variables: { packageId: orderId, status: "PAYED" },
      });
      await refetch();
    } catch (error) {
      console.error("Error updating package status:", error);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  const order = data?.packageById;

  return (
    <div className="order w-full py-10">
      <div className="container w-full">
        <h1 className="text-2xl font-bold mb-4">
          Modifier la commande #{order?.customId}
        </h1>
        <div className="flex">
          <div className="main w-full">
            <OrderDetails
              order={order}
              handleCancelOrder={handleCancelOrder}
              handleTransferToDeliveryOrder={handleTransferToDeliveryOrder}
              handlePayedPackageOrder={handlePayedPackageOrder}
              handleRefundOrder={handleRefundOrder}
            />
            <OrderReference
              order={order}
              OrderStatus={order?.status}
              handleModifyOrder={handleModifyOrder}
            />
            <OrderTotalPrice order={order} />
            <Comments />
          </div>
          <ClientInfo order={order} />
        </div>
      </div>
      <div className="bg-white shadow-md fixed left-0 bottom-0 w-full py-4 flex items-center gap-2 px-2 border justify-end">
        <button
          onClick={() => generateInvoice(order)}
          className="text-white flex items-center gap-1 bg-mainColorAdminDash hover:opacity-85 transition-all px-3 py-2 rounded-md tracking-wider"
        >
          Imprimer la commande
          <CiSaveDown2 size={25} />
        </button>
      </div>
      {showCancelModal && (
        <CancelModal
          order={order}
          productStatuses={productStatuses}
          setProductStatuses={setProductStatuses}
          handleStatusChange={handleStatusChange}
          handleCancelSubmit={handleCancelSubmit}
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
