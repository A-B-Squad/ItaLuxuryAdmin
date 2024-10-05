import React from "react";

const CustomerInfo = ({ order, governmentInfo }: any) => {
  const governorateName =
    governmentInfo[order?.Checkout?.governorateId] || "N/A";

  return (
    <div className="client w-full md:w-1/2 lg:w-1/3 mx-2 my-4">
      <div className="rounded-lg border bg-white shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Client</h2>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2 border-b pb-1">
            Informations client
          </h3>
          <div className="p-4 rounded text-sm text-gray-700 bg-gray-50 border">
            <p className="mb-2">
              <span className="font-semibold">Nom complet:</span>{" "}
              {order?.Checkout?.User?.fullName || "N/A"}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Téléphone:</span>{" "}
              {order?.Checkout?.User?.number || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {order?.Checkout?.User?.email || "N/A"}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2 border-b pb-1">
            Adresse de livraison
          </h3>
          <div className="p-4 rounded text-sm text-gray-700 bg-gray-50 border">
            <p className="mb-2">
              <span className="font-semibold">Nom utilisateur:</span>{" "}
              {order?.Checkout?.userName || "N/A"}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Téléphone 1:</span>{" "}
              {order?.Checkout?.phone[0] || "N/A"}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Téléphone 2:</span>{" "}
              {order?.Checkout?.phone[1] || "N/A"}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Gouvernorat:</span>{" "}
              {governorateName || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Adresse:</span>{" "}
              {order?.Checkout?.address || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
