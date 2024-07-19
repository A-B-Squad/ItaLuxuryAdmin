import React from "react";

interface DeleteModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  productName,
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      id="my-modal"
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Delete Product
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Voulez-vous vraiment supprimer ce produit "{productName}"? Cette
              action est irréversible.
            </p>
          </div>
          <div className="items-center flex gap-2 justify-center px-4 py-3">
            <button
              className="px-4 py-2 rounded-md bg-red-500 text-white"
              onClick={onConfirm}
            >
              Supprimer
            </button>
            <button
              id="cancel-btn"
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24"
              onClick={onCancel}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
