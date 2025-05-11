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
import SmallSpinner from "../../components/SmallSpinner";
import CancelModal from "./[...orderId]/components/CancelModal";
import Comments from "./[...orderId]/components/Comments";
import CustomerInfo from "./[...orderId]/components/CustomerInfo";
import OrderDetails from "./[...orderId]/components/OrderDetails";
import OrderReference from "./[...orderId]/components/OrderReference";
import OrderTotalPrice from "./[...orderId]/components/OrderTotalPrice";
import RefundModal from "./[...orderId]/components/RefundModal";
import { useRouter } from "next/navigation";

const EditOrderPage = ({ searchParams }: any) => {
  const { toast } = useToast();
  const router = useRouter();
  const orderId = searchParams ? searchParams.orderId : "";
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [productStatuses, setProductStatuses] = useState<{
    [key: string]: { broken: boolean; quantity: number };
  }>({});

  const [getPackage, { data, loading, error, refetch }] = useLazyQuery(
    PACKAGE_BY_ID_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const [payedOrConfirmedOrInTransitPackage] = useMutation(
    PAYED_OR_TO_DELIVERY_PACKAGE_MUTATIONS,
  );
  const [cancelPackage] = useMutation(CANCEL_PACKAGE_MUTATIONS);
  const [refundPackage] = useMutation(REFUND_PACKAGE_MUTATIONS);
  const [governmentInfo, setGovernmentInfo] = useState<{
    [key: string]: string;
  }>({});
  const order = data?.packageById;

  useQuery(COMPANY_INFO_QUERY, {
    fetchPolicy: "cache-first",
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
  });

  useQuery(GET_GOVERMENT_INFO, {
    fetchPolicy: "cache-first",
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
    setIsSubmitting(true);
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
      await refetch();
      toast({
        title: "Commande annulée",
        description: "La commande a été annulée avec succès.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error cancelling package:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de l'annulation de la commande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefundSubmit = async () => {
    setIsSubmitting(true);
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
      await refetch();
      toast({
        title: "Commande remboursée",
        description: "La commande a été remboursée avec succès.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error refunding package:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors du remboursement de la commande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Add this at the top of your component
  const [jaxGovernorates, setJaxGovernorates] = useState<{ [key: string]: number }>({});

  // Add this useEffect to fetch JAX governorates when component mounts
  useEffect(() => {
    const fetchJaxGovernorates = async () => {
      try {
        const response = await fetch('/api/jax-delivery/governorates');
        if (response.ok) {
          const data = await response.json();
          // Create a mapping from governorate name to JAX ID
          const govMapping: { [key: string]: number } = {};
          data.forEach((gov: { id: number, nom: string }) => {
            govMapping[gov.nom.toLowerCase()] = gov.id;
          });
          setJaxGovernorates(govMapping);
        } else {
          console.error('Failed to fetch JAX governorates');
        }
      } catch (error) {
        console.error('Error fetching JAX governorates:', error);
      }
    };

    fetchJaxGovernorates();
  }, []);

  const handleConfirmedOrder = async () => {
    setIsSubmitting(true);
    try {
      // First create the delivery in JAX system to get the reference
      let deliveryReference = null;

      if (order?.Checkout?.address) {
        try {
          // Handle both registered users and guest users
          const userName = order.Checkout.userName || "Client";
          const phone = order.Checkout.phone || [];
          const address = order.Checkout.address;

          // Get governorate name from your system
          const govName = order.Checkout.Governorate?.name || '';

          // Find matching JAX governorate ID with better error handling
          let jaxGovId = '';
          if (govName) {
            // Try to find by name (case insensitive)
            const matchedId = jaxGovernorates[govName.toLowerCase().trim()];
            if (matchedId) {
              jaxGovId = matchedId.toString();
            } else {
              // If no match found, use a default (Tunis = 4)
              console.warn(`No JAX governorate match found for: ${govName}, using default`);
              jaxGovId = '4';
            }
          } else {
            // If no governorate name, use a default
            jaxGovId = '4';
          }

          const jaxResponse = await fetch('/api/jax-delivery/create-colis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // Use product references instead of order ID
              referenceExterne: order.Checkout.productInCheckout.map((item: any) =>
                item.product.reference
              ).join(', ').substring(0, 100),
              // Use userName for guest users since User might be null
              nomContact: userName,
              // Handle phone numbers as array - use first number for primary contact
              tel: Array.isArray(phone) && phone.length > 0 ? phone[0] : (phone || ''),
              // Use second phone number if available, otherwise use the first one
              tel2: Array.isArray(phone) && phone.length > 1 ? phone[1] : "",
              adresseLivraison: address || '',
              governorat: jaxGovId,
              delegation: order.Checkout.city || 'Non spécifié',
              description: `Commande #${order.customId} - ${order.Checkout.productInCheckout.length} produits: ${order.Checkout.productInCheckout.map((item: any) =>
                item.product.name
              ).join(', ').substring(0, 150)}`,
              cod: order.Checkout.paymentMethod === 'CASH_ON_DELIVERY' ?
                (order.Checkout.total).toString() : '0',
              echange: 0
            })
          });

          // Get the delivery reference from JAX response
          if (jaxResponse.ok) {
            const jaxData = await jaxResponse.json();

            if (jaxData && jaxData.code) {
              deliveryReference = jaxData.code;
            }
          } else {
            let errorMessage = 'Unknown error';
            try {
              const errorData = await jaxResponse.json();
              errorMessage = errorData.error || errorData.message || `Status ${jaxResponse.status}`;
            } catch (e) {
              errorMessage = `Status ${jaxResponse.status}`;
            }
            console.error('JAX API error:', errorMessage);
          }
        } catch (jaxError) {
          console.error("Error creating JAX delivery:", jaxError);
        }
      }

      // Then update the order status in your system with the delivery reference

      await payedOrConfirmedOrInTransitPackage({
        variables: {
          packageId: orderId,
          paymentMethod: order?.Checkout.paymentMethod,
          status: "CONFIRMED",
          deliveryReference: deliveryReference
        },
      });

      await refetch();

      if (deliveryReference) {
        toast({
          title: "Commande confirmée",
          description: `La commande a été confirmée et envoyée à JAX Delivery (Référence: ${deliveryReference}).`,
          className: "bg-green-50 border-green-200",
        });
      } else {
        toast({
          title: "Commande confirmée",
          description: "La commande a été confirmée pour livraison avec succès.",
          className: "bg-green-50 border-green-200",
        });
      }
    } catch (error) {
      console.error("Error updating package status:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la confirmation de la commande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferToDeliveryOrder = async () => {
    setIsSubmitting(true);
    try {
      await payedOrConfirmedOrInTransitPackage({
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
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error updating package status:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors du transfert de la commande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayedPackageOrder = async () => {
    setIsSubmitting(true);
    try {
      await payedOrConfirmedOrInTransitPackage({
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
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error updating package status:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour du statut de paiement.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <SmallSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          <h2 className="text-lg font-medium mb-2">Erreur de chargement</h2>
          <p>{error.message}</p>
          <button
            onClick={() => router.back()}
            className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order w-full py-4 sm:py-6 md:py-10">
      <div className="container w-full px-4">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Retour"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">
            Commande #{order?.customId}
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <OrderDetails
              deliveryPrice={deliveryPrice}
              order={order}
              handleConfirmedOrder={handleConfirmedOrder}
              handleCancelOrder={handleCancelOrder}
              handleTransferToDeliveryOrder={handleTransferToDeliveryOrder}
              handlePayedPackageOrder={handlePayedPackageOrder}
              handleRefundOrder={handleRefundOrder}
              isSubmitting={isSubmitting}
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
      <div className="bg-white shadow-md fixed left-0 bottom-0 w-full py-4 flex items-center gap-2 px-4 border justify-end z-10">
        <button
          onClick={() => generateInvoice(order, deliveryPrice)}
          disabled={isSubmitting}
          className="w-full sm:w-auto text-white flex items-center justify-center gap-2 bg-mainColorAdminDash hover:opacity-85 transition-all px-4 py-2.5 rounded-md tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="text-sm sm:text-base">Traitement...</span>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </>
          ) : (
            <>
              <span className="text-sm sm:text-base">Imprimer la commande</span>
              <CiSaveDown2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </>
          )}
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
          isSubmitting={isSubmitting}
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
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default EditOrderPage;