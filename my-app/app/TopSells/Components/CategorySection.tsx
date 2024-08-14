import { ProductCard } from "./ProductCard";
import { SearchBar } from "./SearchBar";

export const CategorySection = ({
  categoryId,
  categoryName,
  products,
  searchResults,
  searchInput,
  onSearch,
  onAddToBestSells,
  onRemoveFromBestSells,
}: any) => {
  const displayProducts = searchInput ? searchResults : products;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">{categoryName}</h2>
      <SearchBar value={searchInput} onChange={onSearch} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {displayProducts.length > 0 ? (
          displayProducts.map(
            (product: { id: any; categories: { name: any }[] }) => (
              <ProductCard
                key={product.id}
                product={product}
                isBestSell={products.some(
                  (p: { id: any }) => p.id === product.id,
                )}
                onAddToBestSells={() =>
                  onAddToBestSells(
                    product.id,
                    product.categories[0].id,
                    product.categories[0].name,
                  )
                }
                onRemoveFromBestSells={() => onRemoveFromBestSells(product.id)}
              />
            ),
          )
        ) : (
          <p>
            {categoryId
              ? "No products found for this category."
              : "Select a product to set this category."}
          </p>
        )}
      </div>
    </div>
  );
};
