import prepRoute from "@/app/Helpers/_prepRoute";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  reference: string;
  solde: number;
  inventory: number;
  images: string[];
  categories: any[];
}
interface InventoryRowProps {
  product: Product;
  inputRef: (el: HTMLInputElement | null) => void;
  onAddInventory: () => void;
}

const InventoryRow: React.FC<InventoryRowProps> = ({
  product,
  inputRef,
  onAddInventory,
}) => (
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
                  product.categories[0]?.subcategories[0]?.subcategories[1]?.id,
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
      {product.inventory}
    </td>
    <td className="text-center px-4 py-3 text-sm">
      <div className="flex items-center justify-center space-x-2">
        <input
          type="number"
          ref={inputRef}
          className="w-20 px-2 py-1 border border-gray-300 rounded-sm  focus:outline-none focus:ring-1 focus:ring-mainColorAdminDash"
          min="0"
        />
        <button
          type="button"
          onClick={onAddInventory}
          className="px-3 py-1 bg-mainColorAdminDash text-white rounded-md hover:bg-opacity-90 transition-colors duration-200"
        >
          Ajouter
        </button>
      </div>
    </td>
  </tr>
);
export default InventoryRow;
