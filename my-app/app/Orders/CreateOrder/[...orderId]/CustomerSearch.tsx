import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { MdOutlineEdit } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectGroup } from "@radix-ui/react-select";
import { useToast } from "@/components/ui/use-toast";
import { GET_ALL_USERS, GET_GOVERMENT_INFO } from "@/app/graph/queries";
import { UPDATE_CUSTOMER_MUTATIONS } from "@/app/graph/mutations";
import { User, GovernmentInfo, CustomerInfo, Order } from "@/app/types/index"; // Define these types

interface CustomerSearchProps {
  order: any;
  customerInfo: CustomerInfo;
  setCustomerInfo: any;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({
  order,
  customerInfo,
  setCustomerInfo,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [governmentInfo, setGovernmentInfo] = useState<GovernmentInfo[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const filteredUsers = useMemo(() => {
    let users = allUsers;
    if (searchTerm) {
      users = allUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return showAllUsers ? users : users.slice(0, 5);
  }, [allUsers, searchTerm, showAllUsers]);
  const { loading: usersLoading, data: userData } = useQuery(GET_ALL_USERS);
  const { loading: govLoading, data: governmentData } =
    useQuery(GET_GOVERMENT_INFO);
  const [updateCustomerCheckout] = useMutation(UPDATE_CUSTOMER_MUTATIONS);

  useEffect(() => {
    if (userData) setAllUsers(userData.fetchAllUsers);
    if (governmentData) setGovernmentInfo(governmentData.allGovernorate);
  }, [userData, governmentData]);

  useEffect(() => {
    if (order?.Checkout) {
      const { userName, User, phone, governorateId, address } = order.Checkout;
      setCustomerInfo({
        userName: userName.split(" ")[0] || "",
        familyName: userName.split(" ")[1] || "",
        email: User?.email || "",
        phone1: phone[0] || "",
        phone2: phone[1] || "",
        governorate: governorateId || "",
        address: address.split(",")[0] || "",
      });
      if (User) setSelectedUser(User);
    }
  }, [order, setCustomerInfo]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCustomerInfo((prev: any) => ({ ...prev, [name]: value }));
    },
    [setCustomerInfo]
  );

  const handleRegionChange = useCallback(
    (value: string) => {
      setCustomerInfo((prev: any) => ({ ...prev, governorate: value }));
    },
    [setCustomerInfo]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.id) {
      setIsEditing(false);
      return;
    }

    try {
      const { userName, familyName, phone1, phone2, governorate, address } =
        customerInfo;

      const phone = [phone1, phone2].map(Number).filter(Boolean);
      const fullName = `${userName} ${familyName}`.trim();

      await updateCustomerCheckout({
        variables: {
          input: {
            userName: fullName,
            phone,
            governorateId: governorate,
            address,
            userId: order.Checkout.userId || selectedUser?.id,
            checkoutId: order.Checkout.id,
          },
        },
      });

      toast({
        title: "Sauvegarde réussie",
        description:
          "Les informations du client ont été sauvegardées avec succès.",
        className: "bg-green-500",
        duration: 3000,
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Erreur lors de la sauvegarde des informations du client.",
        className: "bg-red-500",
        duration: 5000,
      });
    }
  };

  const handleUserSelect = useCallback(
    (userId: string) => {
      const user = allUsers.find((u) => u.id === userId);
      setSelectedUser(user || null);
      setCustomerInfo((prev: any) => ({ ...prev, userId }));
    },
    [allUsers, setCustomerInfo]
  );

  // const filteredUsers = allUsers.filter(
  //   (user) =>
  //     user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     user.email.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  if (usersLoading || govLoading) {
    return <div>Chargement des informations...</div>;
  }

  return (
    <div className="client w-1/3 ml-6 bg-white shadow-md h-fit p-2">
      <h2 className="text-xl font-semibold bg-white px-2 border-b w-full py-2 flex justify-between items-center">
        Informations client
        <button
          className="border rounded-full shadow  p-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          <MdOutlineEdit />
        </button>
      </h2>
      <div className="space-y-2 mt-3">
        <div className="UserAcompte bg-gray-50 border">
          {!selectedUser && (
            <div className="p-4">
              <h3 className="font-semibold mb-2">
                Sélectionner un utilisateur :
              </h3>
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowAllUsers(true);
                }}
                className="w-full p-2 border rounded mb-2"
              />
              <div className="w-full border rounded p-2 bg-white divide-y max-h-60 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="cursor-pointer p-2 text-sm hover:bg-gray-100"
                    onClick={() => handleUserSelect(user.id)}
                  >
                    {user.fullName} - {user.email}
                  </div>
                ))}
                {!showAllUsers && allUsers.length > 5 && (
                  <div
                    className="cursor-pointer p-2 text-sm hover:bg-gray-100 text-center text-blue-500"
                    onClick={() => setShowAllUsers(true)}
                  >
                    Voir plus...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg mb-6 bg-gray-50 border">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="userName"
                    id="userName"
                    value={customerInfo.userName}
                    onChange={handleChange}
                    className="mt-1 block w-full text-sm px-2 py-1 rounded-sm border-gray-300 outline-none border-b shadow-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="familyName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom de famille
                  </label>
                  <input
                    type="text"
                    name="familyName"
                    id="familyName"
                    value={customerInfo.familyName}
                    onChange={handleChange}
                    className="mt-1 block w-full py-1 text-sm px-2 rounded-sm border-gray-300 outline-none border-b shadow-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    readOnly
                    value={customerInfo.email || selectedUser?.email}
                    className="mt-1 block w-full py-1 text-sm px-2  bg-neutral-200 rounded-sm cursor-not-allowed border-gray-300 outline-none border-b shadow-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Téléphone 1
                  </label>
                  <input
                    type="tel"
                    name="phone1"
                    id="phone 1"
                    value={customerInfo.phone1}
                    onChange={handleChange}
                    className="mt-1 block w-full py-1 text-sm rounded-sm px-2 border-gray-300 outline-none border-b shadow-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Téléphone 2
                  </label>
                  <input
                    type="tel"
                    name="phone2"
                    id="phone 2"
                    value={customerInfo.phone2}
                    onChange={handleChange}
                    className="mt-1 block w-full py-1 rounded-sm text-sm px-2 border-gray-300 outline-none border-b shadow-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label
                    htmlFor="governorate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Région
                  </label>
                  <Select
                    onValueChange={handleRegionChange}
                    value={customerInfo.governorate}
                  >
                    <SelectTrigger className="w-full mt-1 bg-white">
                      <SelectValue placeholder="Sélectionnez une région" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        {govLoading ? (
                          <SelectItem value="" disabled>
                            Chargement...
                          </SelectItem>
                        ) : (
                          governmentInfo.map((gov: any) => (
                            <SelectItem key={gov.id} value={gov.id}>
                              {gov.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ville
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={customerInfo.address}
                    onChange={handleChange}
                    className="mt-1 block w-full py-1 border-gray-300 outline-none border-b shadow-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mainColorAdminDash hover:opacity-80"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded text-sm text-gray-600 divide-y">
              <div className="py-3">
                <span className="font-semibold">Prénom : </span>
                {customerInfo.userName || "N/A"}
              </div>
              <div className="py-3">
                <span className="font-semibold">Nom de famille : </span>
                {customerInfo.familyName || "N/A"}
              </div>
              <div className="py-3">
                <span className="font-semibold">Email : </span>
                {customerInfo.email || selectedUser?.email || "N/A"}
              </div>
              <div className="py-3">
                <span className="font-semibold">Téléphone 1 : </span>
                {customerInfo.phone1 || "N/A"}
              </div>
              <div className="py-3">
                <span className="font-semibold">Téléphone 2 : </span>
                {customerInfo.phone2 || "N/A"}
              </div>
              <div className="py-3">
                <span className="font-semibold">Région : </span>
                {governmentInfo.find(
                  (gov): any => gov.id === customerInfo.governorate
                )?.name || "N/A"}
              </div>
              <div className="py-3">
                <span className="font-semibold">Ville : </span>
                {customerInfo.address || "N/A"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSearch;
