import ReviewsRow from "./ReviewsRow";

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
interface InventoryTableProps {
  products: Product[];
}

const ReviewsTable: React.FC<InventoryTableProps> = ({ products }) => (
  <section className="container mx-auto py-6 px-3  relative">
    <div className="w-full mb-8 overflow-hidden rounded-lg">
      <div className="w-full overflow-x-auto">
        <table className="w-full border shadow-md">
          <thead>
            <tr className="text-sm font-semibold tracking-wide text-center text-gray-900 bg-gray-100 uppercase border-b border-gray-600">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Commandes</th>
              <th className="px-4 py-3">Nb Personne</th>
              <th className="px-4 py-3">Notation</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {products.map((product) => (
              <ReviewsRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
export default ReviewsTable;
