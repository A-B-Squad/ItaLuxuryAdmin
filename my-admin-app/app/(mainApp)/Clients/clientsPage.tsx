"use client";

import { useMutation, useQuery } from "@apollo/client";
import Image from "next/image";
import React, { useState } from "react";
import { CiImageOn } from "react-icons/ci";
import {
  FaBox,
  FaEnvelope,
  FaGift,
  FaPlus,
  FaStar,
  FaTicketAlt,
  FaTrash
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


// TypeScript Interfaces
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

interface Checkout {
  id: string;
  GovernoTaux: {
    name: string;
  };
  package: Package[];
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
  const { data, loading, error, refetch } = useQuery<FetchAllUsersData>(FETCH_ALL_USERS);
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);
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
    .sort((a, b) => b.points - a.points);

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

  const handleModalSuccess = () => {
    refetch();
  };
  const getTransactionTypeStyle = (type: string) => {
    switch (type) {
      case 'EARNED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADMIN_ADDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <section className="container py-8">
      <h1 className="font-bold text-2xl py-5 px-4 border-b-2 mb-2 w-full">
        Client Management{" "}
        <span className="text-gray-600 font-medium text-base">
          ({filteredUsers.length || 0})
        </span>
      </h1>

      <div className="mb-4 px-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
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
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Average Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 max-h-96 h-full overflow-y-auto">
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
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>

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
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="mt-12 bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-[#202939] text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">{selectedUser.fullName}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsPointsModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
              >
                <FaPlus className="mr-2" />
                Ajouter des points
              </button>
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
              >
                <FaGift className="mr-2" />
                Créer un bon
              </button>
              <button
                onClick={() => setIsUseVoucherModalOpen(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
              >
                <FaTicketAlt className="mr-2" />
                Utiliser un bon
              </button>
            </div>

          </div>
          <div className="p-6">
            {/* Add this new section */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">ID: <span className="text-gray-900">{selectedUser.id}</span></p>
                    <p className="text-sm text-gray-600">Name: <span className="text-gray-900">{selectedUser.fullName}</span></p>
                    <p className="text-sm text-gray-600">Email: <span className="text-gray-900">{selectedUser.email}</span></p>
                    <p className="text-sm text-gray-600">Phone: <span className="text-gray-900">{selectedUser.number}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Total Orders: <span className="text-gray-900">{selectedUser.checkout.length}</span></p>
                    <p className="text-sm text-gray-600">Total Reviews: <span className="text-gray-900">{selectedUser.reviews.length}</span></p>
                    <p className="text-sm text-gray-600">Active Vouchers: <span className="text-gray-900">
                      {selectedUser.Voucher.filter(v => !v.isUsed).length}
                    </span></p>
                    <p className="text-sm text-gray-600">Messages: <span className="text-gray-900">{selectedUser.ContactUs.length}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Points & Rewards</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Current Points: <span className="font-semibold text-blue-600">{selectedUser.points}</span></p>
                    <p className="text-sm text-gray-600">Total Transactions: <span className="text-gray-900">{selectedUser.pointTransactions.length}</span></p>
                    <p className="text-sm text-gray-600">Points Earned: <span className="text-green-600">
                      {selectedUser.pointTransactions
                        .filter(t => t.type === 'EARNED' || t.type === 'ADMIN_ADDED')
                        .reduce((sum, t) => sum + t.amount, 0)}
                    </span></p>
                    <p className="text-sm text-gray-600">Points Lost: <span className="text-red-600">
                      {selectedUser.pointTransactions
                        .filter(t => t.type === 'EXPIRED' || (t.type === 'ADJUSTMENT' && t.amount < 0))
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0)}
                    </span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="mt-8 w-full">
                <UserInfoSection
                  title="Points and Vouchers"
                  icon={<FaStar color="white" />}
                  content={
                    <div className="grid grid-cols-1  gap-6">
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-lg mb-4">Points Balance: {selectedUser.points}</h3>
                        <div className="overflow-y-auto max-h-60">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedUser?.pointTransactions?.slice().reverse().map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {new Date(Number(transaction.createdAt)).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getTransactionTypeStyle(transaction.type)}`}>
                                      {transaction.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {transaction.amount}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {transaction.description}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    <button
                                      onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete this transaction?')) {
                                          try {
                                            await deleteTransaction({
                                              variables: {
                                                transactionId: transaction.id,
                                              }
                                            });

                                            toast({
                                              title: "Success",
                                              description: "Transaction deleted successfully",
                                              className: "bg-green-500 text-white",
                                            });

                                            // Refresh the data
                                            await refetch();
                                          } catch (error) {

                                            toast({
                                              title: "Error",
                                              description: "Failed to delete transaction",
                                              variant: "destructive",
                                            });
                                          }
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                      <FaTrash size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-lg mb-4">Vouchers</h3>
                        <div className="overflow-y-auto max-h-60">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedUser?.Voucher?.map((voucher) => (
                                <tr key={voucher.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                    {voucher.code}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {voucher.amount}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${voucher.isUsed
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-green-100 text-green-800'
                                      }`}>
                                      {voucher.isUsed ? 'Used' : 'Active'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {new Date(Number(voucher.expiresAt)).toLocaleString()}

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
            </div>

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


            <div className="mt-8 w-full">
              <UserInfoSection
                title="Orders"
                icon={<FaBox color="white" />}
                content={
                  selectedUser.checkout.length > 0 ? (
                    <div className="space-y-6">
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

      {/* Points Management Modal */}
      {selectedUser && (
        <PointsManagementModal
          user={selectedUser}
          pointSettingsData={pointSettingsData}
          isOpen={isPointsModalOpen}
          onClose={() => setIsPointsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Voucher Creation Modal */}
      {selectedUser && (
        <VoucherCreationModal
          user={selectedUser}
          pointSettingsData={pointSettingsData}
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
      {/* Use Voucher Modal */}

      {selectedUser && (
        <UseVoucherModal
          user={selectedUser}
          isOpen={isUseVoucherModalOpen}
          onClose={() => setIsUseVoucherModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
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
      )}
    </section>
  );
};

export default ClientsPage;