import React from "react";
import ProductRow from "./productRow";
import SearchProduct from "./searchProduct";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductTableProps {
  packageId: any;
  onDeleteClick: (product: { id: string; name: string }) => void;
  packageData: any;
  handleQuantityChange: any;
  handleProductSelect: any;
}

const ProductTable: React.FC<ProductTableProps> = ({
  onDeleteClick,
  packageData,
  handleQuantityChange,
  handleProductSelect,
}) => {
  return (
    <section className="mx-auto relative">
      <div className="w-full mb-8 overflow-hidden rounded-lg shadow-lg">
        <SearchProduct onProductSelect={handleProductSelect} />
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-center">Impression...</TableHead>
                <TableHead className="text-center">Prix</TableHead>
                <TableHead className="text-center">Inventaire</TableHead>
                <TableHead className="text-center">Quantité</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packageData?.Checkout.productInCheckout.map((item: any) => {
                const existingProductInCheckout = packageData.Checkout.productInCheckout.find(
                  (checkoutItem: any) => checkoutItem.product.id === item.product.id
                );

                return (
                  <ProductRow
                    key={item.product.id}
                    item={item}
                    onDeleteClick={onDeleteClick}
                    onQuantityChange={handleQuantityChange}
                    existingProductInCheckout={existingProductInCheckout}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default ProductTable;