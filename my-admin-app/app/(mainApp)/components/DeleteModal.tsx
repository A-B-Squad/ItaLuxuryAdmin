import React, { useEffect } from "react";

interface DeleteModalProps {
  productName?: string;
  itemName?: string;
  sectionName: "Product" | "Coupons" | "Category" | "Order" | string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  sectionName,
  productName,
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onCancel, isLoading]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const getTitle = () => {
    switch (sectionName) {
      case "Product":
        return "Supprimer le produit";
      case "Coupons":
        return "Supprimer le coupon";
      case "Category":
        return "Supprimer la catégorie";
      case "Order":
        return "Supprimer la commande";
      default:
        return `Supprimer ${sectionName}`;
    }
  };

  const getMessage = () => {
    const displayName = productName || itemName || sectionName.toLowerCase();
    
    switch (sectionName) {
      case "Product":
        return `Voulez-vous vraiment supprimer ce produit "${displayName}" ? Cette action est irréversible.`;
      case "Coupons":
        return `Voulez-vous vraiment supprimer ce coupon ? Cette action est irréversible.`;
      case "Category":
        return `Voulez-vous vraiment supprimer cette catégorie "${displayName}" ? Cette action est irréversible et supprimera également toutes les sous-catégories associées.`;
      case "Order":
        return `Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible.`;
      default:
        return `Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible.`;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[900] overflow-y-auto h-full w-full flex items-center justify-center"
      id="delete-modal"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="relative mx-auto p-6 border w-full max-w-md shadow-xl rounded-lg bg-white animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <h3 
            className="text-lg leading-6 font-medium text-gray-900 mb-2"
            id="modal-title"
          >
            {getTitle()}
          </h3>
          
          <div className="mt-2 px-2 py-3">
            <p className="text-sm text-gray-500">
              {getMessage()}
            </p>
          </div>
          
          <div className="mt-4 flex gap-3 justify-center">
            <button
              className={`px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              className={`px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Suppression...
                </span>
              ) : (
                "Supprimer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
