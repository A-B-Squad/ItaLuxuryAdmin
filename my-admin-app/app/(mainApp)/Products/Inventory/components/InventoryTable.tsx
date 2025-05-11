import InventoryRow from "./InventoryRow";

interface Product {
  id: string;
  name: string;
  reference: string;
  solde: number;
  inventory: number;
  purchasePrice: number;
  broken: number;
  images: string[];
  categories: any[];
}
interface InventoryTableProps {
  products: Product[];
  inputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  handleAddToInventory: (productId: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  inputRefs,
  handleAddToInventory,
}) => (
  <section className="container mx-auto py-6 px-3  relative">
    <div className="w-full mb-8 overflow-hidden rounded-lg">
      <div className="w-full overflow-x-auto">
        <table className="w-full border shadow-md">
          <thead className="bg-mainColorAdminDash text-white">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-center">SKU</th>
              <th className="px-4 py-3 text-center">Prix d'achat</th>
              <th className="px-4 py-3 text-center">Casse</th>
              <th className="px-4 py-3 text-center">Combien de vente</th>
              <th className="px-4 py-3 text-center">Inventaire</th>
              <th className="px-4 py-3 text-center">
                Ajouter à la quantité disponible
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {products.length > 0 ? (
              products.map((product) => (
                <InventoryRow
                  key={product.id}
                  product={product}
                  inputRef={(el) => (inputRefs.current[product.id] = el)}
                  onAddInventory={() => handleAddToInventory(product.id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-5 text-center">Aucun produit disponible</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
export default InventoryTable;
