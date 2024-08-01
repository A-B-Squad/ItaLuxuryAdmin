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
          <thead className="bg-mainColorAdminDash text-white">
              <tr>
                <th className="px-4 py-3 text-center">Nom</th>
                <th className="px-4 py-3 text-center">Prix</th>
                <th className="px-4 py-3 text-center">Promotion</th>
                <th className="px-4 py-3 text-center">Promo Fini</th>
                <th className="px-4 py-3 text-center">Visibilité</th>
                <th className="px-4 py-3 text-center">Date de création</th>
                <th className="px-4 py-3 text-center">Commandes</th>
                <th className="px-4 py-3 text-center">Actions</th>
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
