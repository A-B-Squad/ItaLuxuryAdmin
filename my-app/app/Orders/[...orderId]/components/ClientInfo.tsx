import React from "react";
import { MdOutlineEdit } from "react-icons/md";

const ClientInfo = ({ order }: any) => {
  return (
    <div className="client w-1/3 ml-6 h-fit">
      <div className="rounded-lg border bg-gray-50 mb-6">
        <div className="bg-white flex justify-between px-4 items-center mb-4">
          <h2 className="text-xl font-semibold px-2 border-b w-full py-2">
            Client
          </h2>
          {order?.status !== "CANCELLED" &&
            order?.status !== "BACK" &&
            order?.status !== "TRANSFER_TO_DELIVERY_COMPANY" && (
              <button
                title="update info"
                className="text-blue-500 border hover:opacity-50 transition-all rounded-full shadow-lg p-1"
              >
                <MdOutlineEdit size={24} />
              </button>
            )}
        </div>

        <div className="mb-4 w-full bg-gray-50 px-4">
          <h3 className="font-medium mb-2 border-b px-2">
            Informations client
          </h3>
          <div className="p-4 rounded text-sm text-gray-600 bg-white border">
            <p>{order?.Checkout.userName}</p>
            <p>{order?.Checkout.phone[0]}</p>
            <p>{order?.Checkout.address}</p>
          </div>
        </div>

        <div className="mb-4 px-4">
          <h3 className="font-medium mb-2 border-b">Adresse de livraison</h3>
          <div className="p-4 rounded text-sm text-gray-600 bg-white border">
            <p>{order?.Checkout.userName}</p>
            <p>{order?.Checkout.phone[0]}</p>
            <p>{order?.Checkout.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;
