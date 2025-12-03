"use client";

import { useMutation, useQuery } from "@apollo/client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { CiImageOn } from "react-icons/ci";
import {
  FaBox,
  FaEnvelope,
  FaGift,
  FaPlus,
  FaStar,
  FaTicketAlt,
  FaUndo
} from "react-icons/fa";
import { FETCH_ALL_USERS, GET_POINT_SETTINGS } from "../../graph/queries";
import { translateStatus } from "../Helpers/_translateStatus";
import { PointsManagementModal } from "./components/PointsManagementModal";
import Loading from "./loading";
import { UserRow } from "./components/UserRow";
import { UserInfoSection } from "./components/UserInfoSection";
import { StarRating } from "./components/StarRating";
import { VoucherCreationModal } from "./components/VoucherCreationModal";
import { UseVoucherModal } from "./components/UseVoucherModal";
import { DELETE_TRANSACTION } from "@/app/graph/mutations";
import { useToast } from "@/components/ui/use-toast";
import Pagination from "../components/Paginations";
import moment from "moment-timezone";

interface Review {
  productId: string;
  rating: number;
  product: {
    name: string;
    reference: string;
  };
}

interface ContactUs {
  id: string;
  subject: string;
  document: string;
  message: string;
}

interface Package {
  id: string;
  customId: string;
  status: string;
}

interface Voucher {
  id: string;
  code: string;
  amount: number;
  isUsed: boolean;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  userId: string;
  checkoutId: string | null;
}

interface ProductInCheckout {
  product: {
    name: string;
  };
  productQuantity: number;
  price: number;
}

interface Checkout {
  id: string;
  productInCheckout: ProductInCheckout[];
  total: number;
  Governorate: {
    name: string;
  };
  package: Package[];
}

interface PointTransaction {
  id: string;
  amount: number;
  type: 'EARNED' | 'EXPIRED' | 'ADJUSTMENT' | 'ADMIN_ADDED';
  description: string;
  createdAt: string;
  userId: string;
  checkoutId: string | null;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  number: string;
  createdAt: string;
  points: number;
  reviews: Review[];
  ContactUs: ContactUs[];
  checkout: Checkout[];
  Voucher: Voucher[];
  pointTransactions: PointTransaction[];
}

interface FetchAllUsersData {
  fetchAllUsers: User[];
}

const ClientsPage: React.FC = () => {
  const { data, loading, error, refetch } = useQuery<FetchAllUsersData>(FETCH_ALL_USERS, {
    // ADDED: Disable cache to always get fresh data
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
  });

  const [deletePointTransaction] = useMutation(DELETE_TRANSACTION, {
    // ADDED: Refetch queries after deletion
    refetchQueries: [{ query: FETCH_ALL_USERS }],
    awaitRefetchQueries: true,
  });

  const { data: pointSettingsData } = useQuery(GET_POINT_SETTINGS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isUseVoucherModalOpen, setIsUseVoucherModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const { toast } = useToast();

  // ADDED: Auto-update selectedUser when data changes
  useEffect(() => {
    if (selectedUser && data?.fetchAllUsers) {
      const updatedUser = data.fetchAllUsers.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  }, [data, selectedUser?.id]); // Only depend on user id to avoid infinite loops

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="text-center mt-8 text-red-500">
        Error: {error.message}
      </div>
    );

  const users = data?.fetchAllUsers || [];

  const filteredUsers = users
    .filter((user) => {
      const searchResult =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
      return searchResult;
    })
    

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const openModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
    setIsImageZoomed(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const toggleZoom = () => {
    setIsImageZoomed(!isImageZoomed);
  };

  // IMPROVED: Better refetch handling
  const handleModalSuccess = async () => {
    try {
      // Refetch the data
      const { data: newData } = await refetch();

      // Update selected user immediately
      if (selectedUser && newData?.fetchAllUsers) {
        const updatedUser = newData.fetchAllUsers.find(u => u.id === selectedUser.id);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
    } catch (error) {
      console.error("Error refetching data:", error);
    }
  };

  const getTransactionTypeStyle = (type: string) => {
    switch (type) {
      case 'EARNED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADMIN_ADDED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleReverseTransaction = async (transaction: PointTransaction) => {
    const confirmMessage = `Êtes-vous sûr de vouloir annuler cette transaction?\n\n` +
      `Type: ${transaction.type}\n` +
      `Montant: ${transaction.amount} points\n` +
      `Description: ${transaction.description}\n\n` +
      `Cela retirera ${transaction.amount} points du solde de l'utilisateur.`;

    if (window.confirm(confirmMessage)) {
      try {
        await deletePointTransaction({
          variables: {
            transactionId: transaction.id,
          }
        });

        toast({
          title: "Transaction annulée",
          description: `${transaction.amount} points ont été retirés du compte.`,
          className: "bg-green-50 border-green-200 text-green-800",
        });

        // IMPROVED: Use the same refetch handler
        await handleModalSuccess();
      } catch (error: any) {
        console.error("Error reversing transaction:", error);
        toast({
          title: "Erreur",
          description: error?.message || "Impossible d'annuler la transaction",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <section className="container py-8">
      <h1 className="font-bold text-2xl py-5 px-4 border-b-2 mb-2 w-full">
        Gestion des Clients{" "}
        <span className="text-gray-600 font-medium text-base">
          ({filteredUsers.length || 0})
        </span>
      </h1>

      <div className="mb-4 px-4">
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#202939]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Commandes
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Avis
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Creation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onClick={() => setSelectedUser(user)}
                  />
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-center text-gray-500" colSpan={7}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 px-4 py-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                setSelectedUser(null);
              }}
            />
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="mt-12 bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#202939] to-[#2d3748] text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">{selectedUser.fullName}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsPointsModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-all shadow-md hover:shadow-lg"
              >
                <FaPlus className="mr-2" />
                Ajouter Points
              </button>
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-all shadow-md hover:shadow-lg"
              >
                <FaGift className="mr-2" />
                Créer Bon
              </button>
              <button
                onClick={() => setIsUseVoucherModalOpen(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-all shadow-md hover:shadow-lg"
              >
                <FaTicketAlt className="mr-2" />
                Utiliser Bon
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Summary Cards */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md mb-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                <div className="space-y-3 p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Informations Contact
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">ID: <span className="text-gray-900 font-mono">{selectedUser.id}</span></p>
                    <p className="text-gray-600">Nom: <span className="text-gray-900 font-semibold">{selectedUser.fullName}</span></p>
                    <p className="text-gray-600">Email: <span className="text-gray-900">{selectedUser.email}</span></p>
                    <p className="text-gray-600">Téléphone: <span className="text-gray-900">{selectedUser.number}</span></p>
                    <p className="text-gray-600">Creation de compte: <span className="text-gray-900">{moment(Number(selectedUser.createdAt)).format("DD/MM/YYYY HH:mm")}</span></p>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-white rounded-lg shadow-sm border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Résumé d'Activité
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">Total Commandes: <span className="text-gray-900 font-bold">{selectedUser.checkout.length}</span></p>
                    <p className="text-gray-600">Total Avis: <span className="text-gray-900 font-bold">{selectedUser.reviews.length}</span></p>
                    <p className="text-gray-600">Bons Actifs: <span className="text-green-600 font-bold">
                      {selectedUser.Voucher.filter(v => !v.isUsed).length}
                    </span></p>
                    <p className="text-gray-600">Messages: <span className="text-gray-900 font-bold">{selectedUser.ContactUs.length}</span></p>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Points & Récompenses
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">Points Actuels: <span className="font-bold text-2xl text-blue-600">{selectedUser.points.toLocaleString()}</span></p>
                    <p className="text-gray-600">Total Transactions: <span className="text-gray-900 font-bold">{selectedUser.pointTransactions.length}</span></p>
                    <p className="text-gray-600">Points Gagnés: <span className="text-green-600 font-bold">
                      +{selectedUser.pointTransactions
                        .filter(t => t.type === 'EARNED' || t.type === 'ADMIN_ADDED')
                        .reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                    </span></p>
                    <p className="text-gray-600">Points Perdus: <span className="text-red-600 font-bold">
                      -{selectedUser.pointTransactions
                        .filter(t => t.type === 'EXPIRED' || t.type === 'ADJUSTMENT')
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0).toLocaleString()}
                    </span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Points and Vouchers Section */}
            <div className="mt-8 w-full">
              <UserInfoSection
                title="Points et Bons"
                icon={<FaStar color="white" />}
                content={
                  <div className="grid grid-cols-1 gap-6">
                    {/* Points Transactions Table */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-lg">
                        <h3 className="font-semibold text-lg text-white flex items-center">
                          <FaStar className="mr-2" />
                          Solde: {selectedUser.points.toLocaleString()} points
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Points</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {selectedUser?.pointTransactions?.slice().reverse().map((transaction) => (
                              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                  {new Date(Number(transaction.createdAt)).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTransactionTypeStyle(transaction.type)}`}>
                                    {transaction.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`font-bold text-sm ${transaction.type === 'EARNED' || transaction.type === 'ADMIN_ADDED'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>
                                    {transaction.type === 'EARNED' || transaction.type === 'ADMIN_ADDED' ? '+' : '-'}
                                    {transaction.amount.toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {transaction.description}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleReverseTransaction(transaction)}
                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-all border border-red-200 hover:border-red-300 shadow-sm"
                                    title="Annuler cette transaction"
                                  >
                                    <FaUndo className="mr-1.5" size={12} />
                                    <span className="text-xs font-medium">Annuler</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Vouchers Table */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-t-lg">
                        <h3 className="font-semibold text-lg text-white flex items-center">
                          <FaGift className="mr-2" />
                          Bons d'Achat
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Montant</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Utilisé le</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expire le</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {selectedUser?.Voucher?.map((voucher) => (
                              <tr key={voucher.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-mono font-bold text-gray-900">
                                  {voucher.code}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="font-bold text-green-600">
                                    {voucher.amount.toFixed(2)} DT
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${voucher.isUsed
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-green-100 text-green-800 border border-green-200'
                                    }`}>
                                    {voucher.isUsed ? 'Utilisé' : 'Actif'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                  {voucher.usedAt ? new Date(Number(voucher.usedAt)).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  }) : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {new Date(Number(voucher.expiresAt)).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>


            <UserInfoSection
              title="Reviews"
              icon={<FaStar color="white" />}
              content={
                selectedUser.reviews.length > 0 ? (
                  <div className="overflow-y-auto max-h-60">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedUser.reviews.map((review: Review) => (
                          <tr
                            key={review.productId}
                          >
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {review.product.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              <StarRating rating={review.rating} />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {review.product.reference}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No reviews available.</p>
                )
              }
            />

            <div className="mt-8 w-full">
              <UserInfoSection
                title="Messages"
                icon={<FaEnvelope color="white" />}
                content={
                  selectedUser.ContactUs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Message
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Document
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedUser.ContactUs.map((contact: ContactUs) => (
                            <tr key={contact.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {contact.subject}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">
                                {contact.message}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {contact.document ? (
                                  <button
                                    onClick={() => openModal(contact.document)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                  >
                                    <CiImageOn className="mr-1" />
                                    View
                                  </button>
                                ) : (
                                  "No document"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No messages available.</p>
                  )
                }
              />
            </div>


            <div className="mt-8 w-full ">
              <UserInfoSection
                title="Orders"
                icon={<FaBox color="white" />}
                content={
                  selectedUser.checkout.length > 0 ? (
                    <div className="space-y-6 overflow-y-auto max-h-96">
                      {selectedUser.checkout.map((checkout: Checkout) => (
                        <div key={checkout.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-sm">Order #{checkout.id}</h4>
                              <p className="text-sm text-gray-600">Governorate: {checkout.Governorate.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">Total: {checkout.total?.toFixed(2) || 'N/A'} DT</p>
                            </div>
                          </div>

                          {/* Products in Checkout */}
                          <div className="mb-4">
                            <h5 className="font-medium mb-2">Products:</h5>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {checkout.productInCheckout?.map((item, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-2 text-sm text-gray-900">{item.product.name}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{item.productQuantity}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{item.price?.toFixed(2) || 'N/A'} DT</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        {((item.productQuantity * item.price) || 0).toFixed(2)} DT
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Package Information */}
                          <div>
                            <h5 className="font-medium mb-2">Package Status:</h5>
                            <div className="flex flex-wrap gap-2">
                              {checkout.package.map((pkg: Package) => (
                                <div key={pkg.id} className="flex items-center space-x-2">
                                  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                    {translateStatus(pkg.status)}
                                  </span>
                                  <span className="text-sm text-gray-600">ID: {pkg.customId}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No orders available.</p>
                  )
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <>
          <PointsManagementModal
            user={selectedUser}
            pointSettingsData={pointSettingsData}
            isOpen={isPointsModalOpen}
            onClose={() => setIsPointsModalOpen(false)}
            onSuccess={handleModalSuccess}
          />
          <VoucherCreationModal
            user={selectedUser}
            pointSettingsData={pointSettingsData}
            isOpen={isVoucherModalOpen}
            onClose={() => setIsVoucherModalOpen(false)}
            onSuccess={handleModalSuccess}
          />
          <UseVoucherModal
            user={selectedUser}
            isOpen={isUseVoucherModalOpen}
            onClose={() => setIsUseVoucherModalOpen(false)}
            onSuccess={handleModalSuccess}
          />
        </>
      )}

      {/* Image Modal */}
      {isModalOpen && selectedImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-4xl">
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
            <div
              className={`transition-transform duration-300 ${isImageZoomed ? "scale-150" : "scale-100"
                }`}
            >
              <Image
                src={selectedImage}
                alt="Contact Document"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain cursor-pointer"
                onClick={toggleZoom}
                unoptimized
              />
            </div>
            <button
              onClick={toggleZoom}
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded hover:bg-opacity-70"
            >
              {isImageZoomed ? "Zoom Out" : "Zoom In"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ClientsPage;