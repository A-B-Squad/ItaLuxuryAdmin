import React from "react";
import Image from "next/image";

const CancelModal = ({
  order,
  productStatuses,
  setProductStatuses,
  handleCancelPackage,
  setShowCancelModal,
  isSubmitting,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Annuler la commande #{order?.customId}
          </h2>
          <button 
            onClick={() => setShowCancelModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 text-amber-700">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">Attention</p>
                <p className="text-sm">Veuillez indiquer l'état de chaque article. Les articles marqués comme cassés seront traités différemment.</p>
              </div>
            </div>
          </div>
          
          {order?.Checkout.productInCheckout.map((item: any, index: number) => (
            <div
              key={item.product.id}
              className="mb-6 pb-6 border-b last:border-b-0"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-16 h-16 mr-4 border rounded-md overflow-hidden bg-gray-50">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    priority={index === 0}
                    style={{ objectFit: "cover" }}
                    className="rounded-md"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Référence: {item.product.reference}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: item.productQuantity }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center bg-gray-50 p-4 rounded-md border"
                  >
                    <p className="mr-4 font-medium text-gray-700">
                      Article {i + 1}
                    </p>
                    <div className="space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={!productStatuses[item.product.id]?.items[i]}
                          onChange={() =>
                            handleStatusChange(item.product.id, i, false)
                          }
                          className="form-radio h-4 w-4 text-blue-600"
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        />
                        <span className="ml-2 text-sm text-gray-700">Cassé</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
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
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Tout marquer comme non cassé
          </button>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowCancelModal(false)}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              onClick={handleCancelPackage}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : (
                "Confirmer l'annulation"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
