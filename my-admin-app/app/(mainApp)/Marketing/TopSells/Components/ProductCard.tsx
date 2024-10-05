export const ProductCard = ({
  product,
  isBestSell,
  onAddToBestSells,
  onRemoveFromBestSells,
}: any) => {
  return (
    <div className="border rounded-lg flex items-center overflow-hidden shadow-lg">
      <img
        src={product.images[0]}
        alt={product.name}
        className="w-24 h-24 object-contain"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mb-4">
          {product.categories[0]?.name}
        </p>
        {isBestSell ? (
          <button
            onClick={() => onRemoveFromBestSells(product.id)}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Remove from Best Sells
          </button>
        ) : (
          <button
            onClick={() =>
              onAddToBestSells(product.id, product.categories[0].id)
            }
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add to Best Sells
          </button>
        )}
      </div>
    </div>
  );
};
