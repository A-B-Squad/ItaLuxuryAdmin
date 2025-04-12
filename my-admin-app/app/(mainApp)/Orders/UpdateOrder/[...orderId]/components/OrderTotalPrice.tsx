import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderTotalPriceProps {
  order: any;
  deliveryPrice: number;
  freeDelivery: boolean;
}

const OrderTotalPrice: React.FC<OrderTotalPriceProps> = ({
  order,
  deliveryPrice,
  freeDelivery,
}) => {
  if (!order?.Checkout) {
    return <div>No order data available</div>;
  }

  const calculateTotals = () => {
    const subtotal = order.Checkout.productInCheckout.reduce(
      (acc: number, item: any) => {
        const itemPrice =
          item.discountedPrice !== 0 ? item.discountedPrice : item.price;
        return acc + itemPrice * item.productQuantity;
      },
      0,
    );

    const couponPercentage = order.Checkout.Coupons?.discount || 0;
    const couponDiscount = (subtotal * couponPercentage) / 100;
    const manualDiscount = order.Checkout.manualDiscount || 0;
    const shippingCost = freeDelivery ? 0.0 : deliveryPrice;
    // Removed console.log statement

    const totalWithDiscount =
      subtotal - couponDiscount - manualDiscount + shippingCost;

    return {
      subtotal,
      couponPercentage,
      couponDiscount,
      manualDiscount,
      shippingCost,
      totalWithDiscount,
    };
  };

  const {
    subtotal,
    couponPercentage,
    couponDiscount,
    manualDiscount,
    shippingCost,
    totalWithDiscount,
  } = calculateTotals();

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
              DT {totalWithDiscount.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTotalPrice;
