import React from "react";
import Image from "next/image";

const CancelModal = ({
  order,
  productStatuses,
  setProductStatuses,
  handleCancelSubmit,
  setShowCancelModal,
}: any) => {
  const handleStatusChange = (
    productId: string,
    index: number,
    isBroken: boolean,
  ) => {
    setProductStatuses((prev: any) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        items: prev[productId].items.map((item: boolean, i: number) =>
          i === index ? isBroken : item,
        ),
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Annuler la commande
          </h2>
        </div>
        <div className="p-6">
          {order?.Checkout.productInCheckout.map((item: any) => (
            <div
              key={item.product.id}
              className="mb-6 pb-6 border-b last:border-b-0"
            >
              <div className="flex items-center mb-4">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={50}
                  height={50}
                  className="rounded-md mr-4"
                />
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.product.name}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: item.productQuantity }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center bg-gray-50 p-3 rounded-md"
                  >
                    <p className="mr-4 text-sm text-gray-600">
                      Article {i + 1}
                    </p>
                    <label className="inline-flex items-center mr-4">
                      <input
                        type="radio"
                        checked={!productStatuses[item.product.id]?.items[i]}
                        onChange={() =>
                          handleStatusChange(item.product.id, i, false)
                        }
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Non cassé
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={productStatuses[item.product.id]?.items[i]}
                        onChange={() =>
                          handleStatusChange(item.product.id, i, true)
                        }
                        className="form-radio h-4 w-4 text-red-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Cassé</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <button
            onClick={() =>
              setProductStatuses((prev: any) =>
                Object.fromEntries(
                  Object.entries(prev).map(([id, status]: any) => [
                    id,
                    { ...status, items: status.items.map(() => false) },
                  ]),
                ),
              )
            }
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Tout marquer comme non cassé
          </button>
          <div>
            <button
              onClick={() => setShowCancelModal(false)}
              className="mr-3 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              onClick={handleCancelSubmit}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Confirmer l'annulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
