import React from "react";
import ProductRow from "./productRow";

interface ProductTableProps {
  products: any;
  onDeleteClick: (product: { id: string; name: string }) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onDeleteClick,
}) => {
  return (
    <section className="container mx-auto py-6 px-3  relative">
      <div className="w-full mb-8 overflow-hidden rounded-lg shadow-lg">
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-sm font-semibold tracking-wide text-center text-gray-900 bg-gray-100 uppercase border-b border-gray-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Promotion</th>
                <th className="px-4 py-3">Promo Fini</th>
                <th className="px-4 py-3">Visibilité</th>
                <th className="px-4 py-3">Date de création</th>
                <th className="px-4 py-3">Commandes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {products.map((product: any) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onDeleteClick={onDeleteClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ProductTable;
