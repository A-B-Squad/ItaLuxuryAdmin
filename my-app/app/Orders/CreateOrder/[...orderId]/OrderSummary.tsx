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
  discount: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = React.memo(
  ({ packageData, discount }) => {
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
            discountedPrice: number;
            price: number;
            productQuantity: number;
          },
        ) => {
          const itemPrice =
            item.discountedPrice !== 0 ? item.discountedPrice : item.price;
          return acc + itemPrice * item.productQuantity;
        },
        0,
      );

      const couponDiscount = packageData.Checkout.Coupons
        ? subtotal * (packageData.Checkout.Coupons.discount / 100)
        : 0;

      const manualDiscount = discount || packageData.Checkout.manualDiscount;
      const shippingCost = subtotal > 499 ? 0 : 8.0;
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
    }, [packageData, discount]);

    if (!packageData || !packageData.Checkout) {
      return <div>No order data available</div>;
    }

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
              <TableCell>DT {subtotal.toFixed(2)}</TableCell>
              <TableCell>
                {couponPercentage > 0 ? `- ${couponPercentage}%` : "0 %"}
              </TableCell>
              <TableCell>-DT {couponDiscount.toFixed(2)}</TableCell>
              <TableCell>-DT {manualDiscount.toFixed(2)}</TableCell>
              <TableCell>DT {shippingCost.toFixed(2)}</TableCell>
              <TableCell className="text-blue-600 font-bold">
                DT {total.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  },
);

export default OrderSummary;
