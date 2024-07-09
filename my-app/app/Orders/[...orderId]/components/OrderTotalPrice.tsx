import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrderTotalPrice = ({ order }: any) => {
  const total = order?.Checkout.total || 0;
  const discountPercentage = order?.Checkout?.Coupons?.discount || 0;

  // Calculate subtotal
  const subtotal = order?.Checkout.productInCheckout.reduce((acc: number, item: any) => {
    const itemPrice = item.discountedPrice || item.price;
    return acc + itemPrice * item.productQuantity;
  }, 0);

  // Calculate shipping cost
  const shippingCost = subtotal >= 499 ? 0 : 8;

  // Calculate discount amount
  const discountAmount = (subtotal * discountPercentage) / 100;

  // Calculate total after applying discount and adding shipping cost
  const totalWithDiscount = (subtotal - discountAmount )+ shippingCost;

  return (
    <div className="orderTotalPrice bg-white shadow-md rounded-lg p-6 mb-6">
      <Table className="border">
        <TableHeader className="bg-gray-50 p-1">
          <TableRow>
            <TableHead>Sous-total</TableHead>
            <TableHead>Coupon</TableHead>
            <TableHead>Remise</TableHead>
            <TableHead>Frais d'expédition</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>DT {subtotal?.toFixed(2)}</TableCell>
            <TableCell>{discountPercentage > 0 ? `- ${discountPercentage}%` : '0 %'}</TableCell>
            <TableCell>-DT {discountAmount.toFixed(2)}</TableCell>
            <TableCell>DT {shippingCost.toFixed(2)}</TableCell>
            <TableCell className="text-blue-600 font-bold">
              DT {totalWithDiscount.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTotalPrice;