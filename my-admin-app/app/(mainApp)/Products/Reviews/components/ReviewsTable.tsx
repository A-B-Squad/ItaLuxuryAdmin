import ReviewsRow from "./ReviewsRow";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  userName?: string;
}

interface Product {
  id: string;
  name: string;
  reference: string;
  solde: number;
  inventory: number;
  images: string[];
  categories: any[];
  reviews: Review[];

}
interface InventoryTableProps {
  products: Product[];
}

const ReviewsTable: React.FC<InventoryTableProps> = ({ products }) => (
  <section className="container mx-auto py-6 px-3  relative">
    <div className="w-full mb-8 overflow-hidden rounded-lg">
      <div className="w-full overflow-x-auto">
        <table className="w-full border shadow-md">
          <thead className="bg-mainColorAdminDash text-white">
            <tr>
              <th className="px-4 py-3 text-center">Nom</th>
              <th className="px-4 py-3 text-center">SKU</th>
              <th className="px-4 py-3 text-center">Commandes</th>
              <th className="px-4 py-3 text-center">Nb Personne</th>
              <th className="px-4 py-3 text-center">Notation</th>
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
