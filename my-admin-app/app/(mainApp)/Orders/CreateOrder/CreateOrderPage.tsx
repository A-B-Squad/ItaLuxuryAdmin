"use client";
import BackUp from "@/app/(mainApp)/components/BackUp";
import DeleteModal from "@/app/(mainApp)/components/DeleteModal";
import {
  CREATE_CHECKOUT_FROM_ADMIN_MUTATIONS,
  UPDATE_CHECKOUT_MUTATIONS,
} from "@/app/graph/mutations";
import { COMPANY_INFO_QUERY, PACKAGE_BY_ID_QUERY } from "@/app/graph/queries";
import { useToast } from "@/components/ui/use-toast";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CustomerSearch from "./[...orderId]/CustomerSearch";
import OrderSummary from "./[...orderId]/OrderSummary";
import ProductTable from "./[...orderId]/productTable";

interface Package {
  id: string;
  comments: string;
  createdAt: string;
  customId: string;
  status: string;
  Checkout: Checkout;
}
interface Product {
  [x: string]: any;
  id: string;
  name: string;
  reference: string;
  images: string[];
}

interface ProductInCheckout {
  productQuantity: number;
  price: number;
  discountedPrice: number;
  product: Product;
}

interface Checkout {
  id: string;
  total: number;
  Coupons: { discount: number };
  userId: string | null;
  userName: string;
  phone: string;
  guestEmail: string | null;
  address: string;
  governorateId: string;
  manualDiscount: number;
  productInCheckout: ProductInCheckout[];
  User?: User;
}
interface User {
  id: string;
  email: string;
}
interface CustomerInfo {
  userId: string | null;
  userName: string;
  familyName: string;
  phone1: string;
  phone2: string;
  governorate: string;
  address: string;
  email: string;
}

const CreateOrderPage = ({ searchParams }: any) => {
  const { toast } = useToast();

  const packageId = searchParams?.orderId;
  const [showBackUp, setShowBackUp] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [isFreeDelivery, setIsFreeDelivery] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [packageData, setPackageData] = useState<Package | null>(
    packageId
      ? null
      : {
        id: "",
        comments: "",
        createdAt: new Date().toISOString(),
        customId: "",
        status: "PROCESSING",
        Checkout: {
          id: "",
          total: 0,
          Coupons: { discount: 0 },
          userId: "",
          guestEmail: "",
          userName: "",
          phone: "",
          address: "",
          governorateId: "",
          manualDiscount: 0,
          productInCheckout: [],
        },
      },
  );
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    userId: "",
    userName: "",
    familyName: "",
    email: "",
    phone1: "",
    phone2: "",
    governorate: "",
    address: "",
  });
  const [inputManualDiscount, setInputManualDiscount] = useState(
    packageData?.Checkout.manualDiscount || 0,
  );
  const router = useRouter();

  const [packageById, { error, data }] = useLazyQuery(PACKAGE_BY_ID_QUERY);
  useQuery(COMPANY_INFO_QUERY, {
    onCompleted: (companyData) => {
      setDeliveryPrice(companyData.companyInfo.deliveringPrice);
    },
  });
  const [updateCheckout] = useMutation(UPDATE_CHECKOUT_MUTATIONS);
  const [createCheckoutFromAdmin] = useMutation(
    CREATE_CHECKOUT_FROM_ADMIN_MUTATIONS,
  );

  useEffect(() => {
    if (packageId) {
      packageById({
        variables: { packageId },
      });
      if (data && data.packageById) {
        setPackageData(data.packageById);
      }
    }
  }, [data]);

  const handleConfirmDelete = useCallback(() => {
    if (productToDelete) {
      setPackageData((prevPackage) => {
        if (!prevPackage) return null;
        return {
          ...prevPackage,
          Checkout: {
            ...prevPackage.Checkout,
            productInCheckout: prevPackage.Checkout.productInCheckout.filter(
              (item) => item.product.id !== productToDelete.id,
            ),
          },
        };
      });
      setProductToDelete(null);
    }
  }, [productToDelete]);

  const handleCancelDelete = useCallback(() => {
    setProductToDelete(null);
  }, []);

  const handleUpdateCheckout = async () => {
    if (!packageData || !packageData.Checkout) {
      console.error("No package data or checkout available");
      return;
    }

    const calculateTotal = () => {
      const subtotal = packageData.Checkout.productInCheckout.reduce(
        (acc, item) => {
          const itemPrice = item.discountedPrice || item.price;
          return acc + itemPrice * item.productQuantity;
        },
        0,
      );

      const couponDiscount = packageData.Checkout.Coupons?.discount
        ? subtotal * (packageData.Checkout.Coupons.discount / 100)
        : 0;

      const manualDiscount =
        inputManualDiscount || packageData.Checkout.manualDiscount;
      const shippingCost = isFreeDelivery ? 0 : deliveryPrice;

      return subtotal - couponDiscount - manualDiscount + shippingCost;
    };

    const total = calculateTotal();

    const input = {
      checkoutId: packageData.Checkout.id,
      total: total,
      productInCheckout: packageData.Checkout.productInCheckout.map((item) => ({
        productId: item.product.id,
        productQuantity: item.productQuantity,
        price: item.price,
        discountedPrice: item.discountedPrice,
      })),
      freeDelivery: isFreeDelivery,
      manualDiscount: inputManualDiscount,
    };

    try {
      await updateCheckout({ variables: { input } });

      toast({
        title: "Commande mise à jour",
        className: "text-white bg-mainColorAdminDash border-0",
        description: "La commande a été mise à jour avec succès.",
        duration: 3000,
      });
      console.log("Checkout updated successfully");
      setTimeout(() => {
        router.replace(`/Orders/UpdateOrder?orderId=${packageData.id}`);
      }, 1000);
    } catch (error) {
      console.log(error);

      toast({
        title: "Erreur de création",
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires.",
        duration: 5000,
      });
      console.error("Error updating checkout:", error);
    }
  };

  const createCheckoutFromAdminDash = async () => {
    const {
      userId,
      userName,
      familyName,
      phone1,
      phone2,
      governorate,
      address,
    } = customerInfo;

    if (!packageData || !packageData.Checkout) {
      console.error("No package data or checkout available");
      return;
    }

    const phone = [phone1, phone2];
    var fullName = `${userName} ${familyName}`;

    const calculateTotal = () => {
      const subtotal = packageData.Checkout.productInCheckout.reduce(
        (acc, item) => {
          const itemPrice = item.discountedPrice || item.price;
          return acc + itemPrice * item.productQuantity;
        },
        0,
      );

      const manualDiscount =
        inputManualDiscount || packageData.Checkout.manualDiscount;
      const shippingCost = isFreeDelivery ? 0 : deliveryPrice;

      return subtotal - manualDiscount + shippingCost;
    };

    const input = {
      userId: userId || null,
      userName: fullName,
      governorateId: governorate,
      address: address,
      total: calculateTotal(),
      phone: phone,
      manualDiscount: inputManualDiscount,
      freeDelivery: isFreeDelivery,
      products: packageData.Checkout.productInCheckout.map((item) => ({
        productId: item.product.id,
        productQuantity: item.productQuantity,
        price: item.price,
        discountedPrice: item.discountedPrice || item.price,
      })),
    };

    try {
      const { data } = await createCheckoutFromAdmin({ variables: { input } });

      toast({
        title: "Commande créée",
        className: "text-white bg-mainColorAdminDash border-0",
        description: "La commande a été créée avec succès.",
        duration: 3000,
      });

      setTimeout(() => {
        router.replace(
          `/Orders/UpdateOrder?orderId=${data.createCheckoutFromAdmin}`,
        );
      }, 1000);
    } catch (error) {
      toast({
        title: "Erreur de création",
        variant: "destructive",
        description:
          "Une erreur est survenue lors de la création de la commande.",
        duration: 5000,
      });
      console.error("Error creating checkout:", error);
    }
  };

  const handleQuantityChange = useCallback(
    (productId: string, newQuantity: number) => {
      setShowBackUp(true);
      setPackageData((prevPackage) => {
        if (!prevPackage) return null;
        return {
          ...prevPackage,
          Checkout: {
            ...prevPackage.Checkout,
            productInCheckout: prevPackage.Checkout.productInCheckout.map(
              (product) =>
                product.product.id === productId
                  ? { ...product, productQuantity: newQuantity }
                  : product,
            ),
          },
        };
      });
    },
    [],
  );

  const handleProductSelect = useCallback(
    (selectedProduct: any) => {
      setShowBackUp(true);
      setPackageData((prevPackage: any) => {
        if (!prevPackage) {
          return {
            id: "",
            comments: "",
            createdAt: new Date().toISOString(),
            customId: "",
            status: "PROCESSING",
            Checkout: {
              id: "",
              total: 0,
              Coupons: { discount: 0 },
              userId: customerInfo?.userId || null,
              guestEmail: customerInfo.email || null,
              userName: `${customerInfo.userName} ${customerInfo.familyName}`,
              phone: [customerInfo.phone1, customerInfo.phone2].filter(Boolean),
              address: customerInfo.address,
              governorateId: customerInfo.governorate,
              manualDiscount: inputManualDiscount || 0,
              productInCheckout: [
                {
                  productQuantity: 1,
                  price: selectedProduct.price,
                  discountedPrice: selectedProduct?.productDiscounts[0]?.newPrice || selectedProduct.price,
                  product: selectedProduct,
                },
              ],
            },
          };
        }

        const existingProductIndex =
          prevPackage.Checkout.productInCheckout.findIndex(
            (item: any) => item.product.id === selectedProduct.id,
          );

        let updatedProductInCheckout;
        if (existingProductIndex !== -1) {
          updatedProductInCheckout = [
            ...prevPackage.Checkout.productInCheckout,
          ];
          updatedProductInCheckout[existingProductIndex] = {
            ...updatedProductInCheckout[existingProductIndex],
            productQuantity:
              updatedProductInCheckout[existingProductIndex].productQuantity +
              1,
          };
        } else {
          const newProduct = {
            productQuantity: 1,
            price: selectedProduct.price,
            discountedPrice:
              selectedProduct?.productDiscounts[0]?.newPrice || selectedProduct.price,
            product: selectedProduct,
          };
          updatedProductInCheckout = [
            ...prevPackage.Checkout.productInCheckout,
            newProduct,
          ];
        }

        return {
          ...prevPackage,
          Checkout: {
            ...prevPackage.Checkout,
            userId: customerInfo.userId || prevPackage.Checkout.userId || null,
            guestEmail: customerInfo.email || prevPackage.Checkout.guestEmail || null,
            userName:
              customerInfo.userName && customerInfo.familyName
                ? `${customerInfo.userName} ${customerInfo.familyName}`
                : prevPackage.Checkout.userName,
            phone:
              customerInfo.phone1 || customerInfo.phone2
                ? [customerInfo.phone1, customerInfo.phone2].filter(Boolean)
                : prevPackage.Checkout.phone,
            address: customerInfo.address || prevPackage.Checkout.address,
            governorateId:
              customerInfo.governorate || prevPackage.Checkout.governorateId,
            manualDiscount:
              inputManualDiscount || prevPackage.Checkout.manualDiscount,
            productInCheckout: updatedProductInCheckout,
          },
        };
      });
    },
    [customerInfo, inputManualDiscount],
  );
  if (error) return <p>Error: {error.message}</p>;


  return (
    <div className="w-full pt-4 sm:pt-6 md:pt-10 pb-20">
      <div className="container px-4 w-full">
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
            {packageId ? "Modifier la commande" : "Créer une commande"}
          </h1>
        </div>

        {/* Main content wrapper with responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-8">
            <div className="bg-white w-full border rounded-lg py-4 sm:py-6 px-4 shadow-sm">
              <ProductTable
                onDeleteClick={setProductToDelete}
                packageData={packageData}
                packageId={packageId}
                handleQuantityChange={handleQuantityChange}
                handleProductSelect={handleProductSelect}
              />

              {productToDelete && (
                <DeleteModal
                  sectionName="Product"
                  productName={productToDelete.name}
                  onConfirm={handleConfirmDelete}
                  onCancel={handleCancelDelete}
                />
              )}

              {/* Delivery Price Section */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium mb-3">Options de livraison</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      className="sr-only"
                      checked={isFreeDelivery}
                      onChange={() => {
                        setIsFreeDelivery(true);
                        setShowBackUp(true);
                      }}
                    />
                    <div
                      className={`w-5 h-5 border rounded-full mr-2 flex items-center justify-center ${isFreeDelivery
                          ? "border-mainColorAdminDash"
                          : "border-gray-300"
                        }`}
                    >
                      {isFreeDelivery && (
                        <div className="w-3 h-3 rounded-full bg-mainColorAdminDash"></div>
                      )}
                    </div>
                    <span>Livraison gratuite</span>
                  </label>

                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      className="sr-only"
                      checked={!isFreeDelivery}
                      onChange={() => {
                        setIsFreeDelivery(false);
                        setShowBackUp(true);
                      }}
                    />
                    <div
                      className={`w-5 h-5 border rounded-full mr-2 flex items-center justify-center ${!isFreeDelivery
                          ? "border-mainColorAdminDash"
                          : "border-gray-300"
                        }`}
                    >
                      {!isFreeDelivery && (
                        <div className="w-3 h-3 rounded-full bg-mainColorAdminDash"></div>
                      )}
                    </div>
                    <span>Livraison payée <span className="font-medium">{deliveryPrice.toFixed(3)} DT</span></span>
                  </label>
                </div>
              </div>

              {/* Discount Section */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium mb-3">Remise manuelle</h3>
                <div className="relative w-full sm:w-1/2">
                  <input
                    min={0}
                    type="number"
                    className="py-2 px-3 w-full border border-gray-300 outline-none rounded-md focus:ring-2 focus:ring-mainColorAdminDash/30 focus:border-mainColorAdminDash"
                    value={inputManualDiscount}
                    onChange={(e) => {
                      setInputManualDiscount(Number(e.target.value));
                      setShowBackUp(true);
                    }}
                    placeholder="Montant de la remise"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">DT</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Cette remise sera appliquée en plus des remises produits
                </p>
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <OrderSummary
                  packageData={packageData}
                  inputManualDiscount={inputManualDiscount}
                  deliveryPrice={deliveryPrice}
                  isFreeDelivery={isFreeDelivery}
                />
              </div>
            </div>
          </div>

          {/* Customer Search Sidebar */}
          <div className="lg:col-span-4 w-full">
            <CustomerSearch
              customerInfo={customerInfo}
              setCustomerInfo={setCustomerInfo}
              order={packageData}
            />
          </div>
        </div>
      </div>

      {/* Floating action button for save */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="container mx-auto flex justify-end">
          <button
            onClick={packageId ? handleUpdateCheckout : createCheckoutFromAdminDash}
            className="bg-mainColorAdminDash hover:bg-mainColorAdminDash/90 text-white px-6 py-2 rounded-md transition-colors flex items-center gap-2"
            disabled={!packageData?.Checkout.productInCheckout.length}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {packageId ? "Mettre à jour la commande" : "Créer la commande"}
          </button>
        </div>
      </div>

      <BackUp
        onSave={packageId ? handleUpdateCheckout : createCheckoutFromAdminDash}
        showBackUp={showBackUp}
      />
    </div>
  );
};

export default CreateOrderPage;