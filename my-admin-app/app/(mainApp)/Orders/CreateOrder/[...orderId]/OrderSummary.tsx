"use client";
import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderSummaryProps {
  packageData: any;
  inputManualDiscount: number;
  deliveryPrice: number;
  isFreeDelivery: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = React.memo(
  ({ packageData, inputManualDiscount, deliveryPrice, isFreeDelivery }) => {
    const {
      subtotal,
      couponDiscount,
      shippingCost,
      manualDiscount,
      total,
      couponPercentage,
    } = useMemo(() => {
      if (!packageData || !packageData.Checkout) {
        return {
          subtotal: 0,
          couponDiscount: 0,
          manualDiscount: 0,
          shippingCost: 0,
          total: 0,
          couponPercentage: 0,
        };
      }

      const subtotal = packageData.Checkout.productInCheckout.reduce(
        (
          acc: number,
          item: {
            discountedPrice: number | null;
            price: number;
            productQuantity: number;
          },
        ) => {
          // Use discounted price only if it exists and is less than the regular price
          const itemPrice = (item.discountedPrice && item.discountedPrice < item.price)
            ? item.discountedPrice
            : item.price;
          return acc + itemPrice * item.productQuantity;
        },
        0,
      );

      const couponDiscount = packageData.Checkout.Coupons
        ? subtotal * (packageData.Checkout.Coupons.discount / 100)
        : 0;

      const manualDiscount =
        inputManualDiscount || packageData.Checkout.manualDiscount || 0;
      const shippingCost = isFreeDelivery ? 0 : deliveryPrice;
      const total = subtotal - couponDiscount - manualDiscount + shippingCost;

      const couponPercentage = packageData.Checkout.Coupons
        ? packageData.Checkout.Coupons.discount
        : 0;

      return {
        subtotal,
        couponDiscount,
        manualDiscount,
        shippingCost,
        total,
        couponPercentage,
      };
    }, [packageData, inputManualDiscount, deliveryPrice, isFreeDelivery]);

    if (!packageData || !packageData.Checkout) {
      return <div>No order data available</div>;
    }

    // Format currency consistently
    const formatCurrency = (amount: number) => {
      return amount.toFixed(3);
    };

    return (
      <div className="orderTotalPrice bg-white shadow-md rounded-lg p-6 mb-6">
        <Table className="border">
          <TableHeader className="bg-gray-50 p-1">
            <TableRow>
              <TableHead>Sous-total</TableHead>
              <TableHead>Coupon%</TableHead>
              <TableHead>Coupon Remise</TableHead>
              <TableHead>Remise supplémentaire</TableHead>
              <TableHead>Frais d'expédition</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{formatCurrency(subtotal)} TND</TableCell>
              <TableCell>
                {couponPercentage > 0 ? `- ${couponPercentage}%` : "0 %"}
              </TableCell>
              <TableCell>-{formatCurrency(couponDiscount)} TND</TableCell>
              <TableCell>-{formatCurrency(manualDiscount)} TND</TableCell>
              <TableCell>{formatCurrency(shippingCost)} TND</TableCell>
              <TableCell className="text-blue-600 font-bold">
                {formatCurrency(total)} TND
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  },
);

// Add display name for React.memo component
OrderSummary.displayName = "OrderSummary";

export default OrderSummary;
