import prepRoute from "@/app/Helpers/_prepRoute";
import Image from "next/image";
import Link from "next/link";
import StarRating from "./StarRating";

interface Product {
  id: string;
  name: string;
  reference: string;
  solde: number;
  inventory: number;
  images: string[];
  categories: any[];
  reviews: { rating: number }[];
}
interface InventoryRowProps {
  product: Product;
}

const calculateAverageRating = (reviews: { rating: number }[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.length;
};

const ReviewsRow: React.FC<InventoryRowProps> = ({ product }) => {
  const averageRating = calculateAverageRating(product.reviews);
  return (
    <tr className="text-gray-700">
      <td className="px-4 py-3">
        <div className="flex items-center text-sm">
          <div className="relative w-12 h-12 mr-3 rounded-full md:block">
            <Image
              className=" w-full h-full rounded-full"
              objectFit="contain"
              src={
                product.images[0] ||
                "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
              }
              layout="fill"
              alt=""
              loading="lazy"
            />
            <div
              className="absolute inset-0 rounded-full shadow-inner"
              aria-hidden="true"
            ></div>
          </div>
          <div>
            <Link
              target="_blank"
              href={{
                pathname: `http://localhost:3000/products/tunisie/${prepRoute(
                  product.name,
                )}`,
                query: {
                  productId: product.id,
                  collection: [
                    product.categories[0]?.name,
                    product.categories[0]?.id,
                    product.categories[0]?.subcategories[0]?.name,
                    product.categories[1]?.subcategories[0]?.id,
                    product.categories[0]?.subcategories[0]?.subcategories[1]
                      ?.name,
                    product.categories[0]?.subcategories[0]?.subcategories[1]
                      ?.id,
                    product.name,
                  ],
                },
              }}
              className="font-semibold hover:opacity-85 transition-opacity text-black"
            >
              {product.name}
            </Link>
          </div>
        </div>
      </td>
      <td className="text-center px-4 py-3 text-ms font-semibold">
        {product.reference}
      </td>
      <td className="text-center px-4 py-3 text-ms font-semibold">
        {product.solde}
      </td>
      <td className="text-center px-4 py-3 text-sm font-semibold">
        {product.reviews.length}
      </td>
      <td className="text-center px-4 py-3 text-sm">
        <div className="Reviews flex items-center justify-center space-x-2">
          <StarRating rating={averageRating} />
        </div>
      </td>
    </tr>
  );
};
export default ReviewsRow;
