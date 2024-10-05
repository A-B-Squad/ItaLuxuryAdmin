"use client";
import React, { useCallback, useEffect, useState } from "react";
import CustomerSearch from "./[...orderId]/CustomerSearch";
import ProductTable from "./[...orderId]/productTable";
import OrderSummary from "./[...orderId]/OrderSummary";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { COMPANY_INFO_QUERY, PACKAGE_BY_ID_QUERY } from "@/app/graph/queries";
import DeleteModal from "@/app/(mainApp)/components/DeleteModal";
import {
  CREATE_CHECKOUT_FROM_ADMIN_MUTATIONS,
  UPDATE_CHECKOUT_MUTATIONS,
} from "@/app/graph/mutations";
import BackUp from "@/app/(mainApp)/components/BackUp";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

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
  userId: string;
  userName: string;
  phone: string;
  email: string;
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
  userId: string;
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
            email: "",
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
      userId: userId,
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
      console.log(input);

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
          // If there's no existing package, create a new one
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
              userId: customerInfo.userId,
              email: customerInfo.email,
              userName: `${customerInfo.userName} ${customerInfo.familyName}`,
              phone: [customerInfo.phone1, customerInfo.phone2].filter(Boolean),
              address: customerInfo.address,
              governorateId: customerInfo.governorate,
              manualDiscount: inputManualDiscount || 0,
              productInCheckout: [
                {
                  productQuantity: 1,
                  price: selectedProduct.price,
                  discountedPrice:
                    selectedProduct.discountedPrice || selectedProduct.price,
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
              selectedProduct.discountedPrice || selectedProduct.price,
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
            userId: customerInfo.userId || prevPackage.Checkout.userId,
            email: customerInfo.email || prevPackage.Checkout.email,
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
    <div className="w-full pt-10 pb-20">
      <div className="container  w-full flex pr-4">
        <div className="w-full h-full">
          <h1 className="text-2xl font-bold mb-4">Créer un Commandes</h1>
          <div className="bg-white w-full border rounded-md py-6 px-3 shadow-md">
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
            <div className="DeliveryPrice mt-4">
              <h3 className="mb-2">Frais de livraison</h3>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer mr-4">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isFreeDelivery}
                    onChange={() => {
                      setIsFreeDelivery(true);
                      setShowBackUp(true);
                    }}
                  />
                  <div
                    className={`w-6 h-6 border-2 rounded-md mr-2 flex items-center justify-center ${
                      isFreeDelivery
                        ? "bg-mainColorAdminDash border-mainColorAdminDash"
                        : "border-gray-300"
                    }`}
                  >
                    {isFreeDelivery && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <span>Livraison gratuite</span>
                </label>

                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={!isFreeDelivery}
                    onChange={() => {
                      setIsFreeDelivery(false);
                      setShowBackUp(true);
                    }}
                  />
                  <div
                    className={`w-6 h-6 border-2 rounded-md mr-2 flex items-center justify-center ${
                      !isFreeDelivery
                        ? "bg-mainColorAdminDash border-mainColorAdminDash"
                        : "border-gray-300"
                    }`}
                  >
                    {!isFreeDelivery && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <span>Livraison payée {deliveryPrice.toFixed(3)} DT</span>
                </label>
              </div>
            </div>

            <div className="Discount mt-4">
              <h3 className="mb-2">Remise</h3>
              <input
                min={0}
                type="number"
                className="py-2 px-3 w-4/5 border outline-none rounded-md"
                value={inputManualDiscount}
                onChange={(e) => {
                  setInputManualDiscount(Number(e.target.value));
                  setShowBackUp(true);
                }}
              />
            </div>
            <OrderSummary
              packageData={packageData}
              inputManualDiscount={inputManualDiscount}
              deliveryPrice={deliveryPrice}
              isFreeDelivery={isFreeDelivery}
            />
          </div>
        </div>

        <CustomerSearch
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          order={packageData}
        />
      </div>

      <BackUp
        onSave={packageId ? handleUpdateCheckout : createCheckoutFromAdminDash}
        showBackUp={showBackUp}
      />
    </div>
  );
};

export default CreateOrderPage;
