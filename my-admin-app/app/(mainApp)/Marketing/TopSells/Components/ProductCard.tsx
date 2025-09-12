import React from "react";
import Image from "next/image";
import { FiPlus, FiX, FiLoader } from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  categories: {
    id: string;
    name: string;
  }[];
  productDiscounts?: {
    newPrice: number;
  }[];
}

interface ProductCardProps {
  product: Product;
  isBestSell: boolean;
  onAddToBestSells: () => void;
  onRemoveFromBestSells: () => void;
  isAddLoading?: boolean;
  isDeleteLoading?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isBestSell,
  onAddToBestSells,
  onRemoveFromBestSells,
  isAddLoading = false,
  isDeleteLoading = false,
}) => {
  const hasDiscount = product.productDiscounts && product.productDiscounts.length > 0;
  // Change this line to ensure discountPrice is always a number or undefined
  const discountPrice = hasDiscount ? product.productDiscounts?.[0]?.newPrice : undefined;

  return (
    <div className={`flex items-center overflow-hidden rounded-lg border ${isBestSell ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200 bg-white'
      } transition-all hover:shadow-md`}>
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden bg-gray-100 sm:h-24 sm:w-24">
        <Image
          src={product.images[0] || "/placeholder-product.png"}
          alt={product.name}
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

          style={{ objectFit: "cover" }}

          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex flex-1 items-center justify-between p-4">
        <div className="mr-4">
          <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>

          <div className="mt-1 flex items-center">
            {hasDiscount && discountPrice ? (
              <>
                <span className="text-sm font-medium text-gray-900">{discountPrice.toFixed(3)} DT</span>
                <span className="ml-2 text-xs text-gray-500 line-through">{product.price.toFixed(3)} DT</span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-900">{product.price.toFixed(3)} DT</span>
            )}
          </div>

          {product.categories[0]?.name && (
            <div className="mt-1">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                {product.categories[0].name}
              </span>
            </div>
          )}
        </div>

        <div>
          {isBestSell ? (
            <button
              onClick={onRemoveFromBestSells}
              disabled={isDeleteLoading}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isDeleteLoading ? (
                <FiLoader className="animate-spin mr-1" size={16} />
              ) : (
                <FiX className="mr-1" size={16} />
              )}
              <span className="hidden sm:inline">Retirer</span>
            </button>
          ) : (
            <button
              onClick={onAddToBestSells}
              disabled={isAddLoading}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isAddLoading ? (
                <FiLoader className="animate-spin mr-1" size={16} />
              ) : (
                <FiPlus className="mr-1" size={16} />
              )}
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
