"use client";
import React, { useCallback, useEffect, useState } from "react";
import CustomerSearch from "./[...orderId]/CustomerSearch";
import ProductTable from "./[...orderId]/productTable";
import OrderSummary from "./[...orderId]/OrderSummary";
import { useMutation, useQuery } from "@apollo/client";
import { PACKAGE_BY_ID_QUERY } from "@/app/graph/queries";
import DeleteModal from "./[...orderId]/DeleteModal";
import { UPDATE_CHECKOUT_MUTATIONS } from "@/app/graph/mutations";
import BackUp from "@/app/components/BackUp";
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
  address: string;
  governorateId: string;
  manualDiscount: number;
  productInCheckout: ProductInCheckout[];
}

const CreateProductPage = ({ searchParams }: any) => {
  const { toast } = useToast();

  const packageId = searchParams.orderId;
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [discount, setDiscount] = useState(
    packageData?.Checkout.manualDiscount || 0
  );
  const router = useRouter();
  const { error, data } = useQuery(PACKAGE_BY_ID_QUERY, {
    variables: { packageId },
  });

  const [updateCheckout] = useMutation(UPDATE_CHECKOUT_MUTATIONS);

  useEffect(() => {
    if (data && data.packageById) {
      setPackageData(data.packageById);
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
              (item) => item.product.id !== productToDelete.id
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
        0
      );

      const couponDiscount = packageData.Checkout.Coupons?.discount
        ? subtotal * (packageData.Checkout.Coupons.discount / 100)
        : 0;

      const manualDiscount = discount || packageData.Checkout.manualDiscount;
      const shippingCost = subtotal > 499 ? 0 : 8.0;

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
      manualDiscount: discount,
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
        router.replace(`/Orders/Edit-order?orderId=${packageData.id}`);
      }, 1000);
    } catch (error) {
      toast({
        title: "Erreur de création",
        className: "text-white bg-red-600 border-0",
        description: "Veuillez remplir tous les champs obligatoires.",
        duration: 5000,
      });
      console.error("Error updating checkout:", error);
    }
  };

  const handleQuantityChange = useCallback(
    (productId: string, newQuantity: number) => {
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
                  : product
            ),
          },
        };
      });
    },
    []
  );

  const handleProductSelect = useCallback((selectedProduct: any) => {
    setPackageData((prevPackage) => {
      if (!prevPackage) return null;
      const existingProductIndex =
        prevPackage.Checkout.productInCheckout.findIndex(
          (item) => item.product.id === selectedProduct.id
        );

      if (existingProductIndex !== -1) {
        const updatedProducts = [...prevPackage.Checkout.productInCheckout];
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          productQuantity:
            updatedProducts[existingProductIndex].productQuantity + 1,
        };
        return {
          ...prevPackage,
          Checkout: {
            ...prevPackage.Checkout,
            productInCheckout: updatedProducts,
          },
        };
      } else {
        const newProduct = {
          productQuantity: 1,
          price: selectedProduct.price,
          discountedPrice:
            selectedProduct.discountedPrice || selectedProduct.price,
          product: selectedProduct,
        };
        return {
          ...prevPackage,
          Checkout: {
            ...prevPackage.Checkout,
            productInCheckout: [
              ...prevPackage.Checkout.productInCheckout,
              newProduct,
            ],
          },
        };
      }
    });
  }, []);

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
                productName={productToDelete.name}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
              />
            )}
            <div className="Discount mt-4">
              <h3 className="mb-2">Remise</h3>
              <input
                min={0}
                type="number"
                className="py-2 px-3 w-4/5 border outline-none rounded-md"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <OrderSummary packageData={packageData} discount={discount} />
          </div>
        </div>

        <CustomerSearch order={packageData} />
      </div>
      <BackUp onSave={packageId ? handleUpdateCheckout : undefined} />
    </div>
  );
};

export default CreateProductPage;
