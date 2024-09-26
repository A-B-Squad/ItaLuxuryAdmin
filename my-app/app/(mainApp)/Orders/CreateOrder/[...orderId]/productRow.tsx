import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MdDeleteOutline } from "react-icons/md";
import { TableCell, TableRow } from "@/components/ui/table";

interface ProductRowProps {
  item: any;
  onDeleteClick: (product: { id: string; name: string }) => void;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  existingProductInCheckout: any;
}

const ProductRow: React.FC<ProductRowProps> = ({
  item,
  onDeleteClick,
  onQuantityChange,
  existingProductInCheckout,
}) => {
  const [quantity, setQuantity] = useState(
    existingProductInCheckout.productQuantity,
  );
  const [total, setTotal] = useState(0);

  const price = existingProductInCheckout.price;
  const discountedPrice = existingProductInCheckout.discountedPrice;

  useEffect(() => {
    const currentPrice = discountedPrice || price;
    setTotal(parseFloat((currentPrice * quantity).toFixed(3)));
  }, [quantity, price, discountedPrice]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    if (
      !isNaN(newQuantity) &&
      newQuantity >= 1 &&
      newQuantity <= item.product.inventory
    ) {
      setQuantity(newQuantity);
      onQuantityChange(item.product.id, newQuantity);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center text-sm">
          <div className="relative w-12 h-12 mr-3 rounded-full md:block">
            <Image
              className="w-full h-full rounded-full"
              src={
                item.product.images[0] ||
                "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
              }
              layout="fill"
              objectFit="contain"
              alt=""
              loading="lazy"
            />
            <div
              className="absolute inset-0 rounded-full shadow-inner"
              aria-hidden="true"
            ></div>
          </div>
          <div>
            <p className="font-semibold text-black">{item.product.name}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {discountedPrice && discountedPrice < price ? (
          <>
            <p className="line-through text-gray-500">{price.toFixed(3)} TND</p>
            <p className="text-red-500">{discountedPrice.toFixed(3)} TND</p>
          </>
        ) : (
          <p>{price.toFixed(3)} TND</p>
        )}
      </TableCell>
      <TableCell className="text-center">{item.product.inventory}</TableCell>
      <TableCell className="text-center">
        <input
          type="number"
          onChange={handleQuantityChange}
          value={quantity}
          min={1}
          max={item.product.inventory}
          className="w-16 text-center border rounded"
        />
      </TableCell>
      <TableCell className="text-center">{total.toFixed(3)} TND</TableCell>
      <TableCell>
        <div className="flex justify-center items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onDeleteClick({ id: item.product.id, name: item.product.name })
            }
            className="p-2 w-10 h-10 hover:opacity-40 transition-opacity shadow-md rounded-full border-2"
          >
            <MdDeleteOutline size={20} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProductRow;
