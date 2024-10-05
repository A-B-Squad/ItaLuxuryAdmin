"use client";

import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import { FETCH_ALL_USERS } from "../../graph/queries";
import { translateStatus } from "../Helpers/_translateStatus";
import {
  FaBox,
  FaStar,
  FaEnvelope,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";
import { CiImageOn } from "react-icons/ci";
import Image from "next/image";
import Loading from "./loading";

interface Review {
  productId: string;
  rating: number;
  product: {
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
  Governorate: {
    name: string;
  };
  package: Package[];
}

interface User {
  id: string;
  fullName: string;
  reviews: Review[];
  ContactUs: ContactUs[];
  checkout: Checkout[];
}

interface FetchAllUsersData {
  fetchAllUsers: User[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (i - 0.5 === roundedRating) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" />);
    }
  }

  return <div className="flex">{stars}</div>;
};

const UserRow: React.FC<{ user: User; onClick: () => void }> = ({
  user,
  onClick,
}) => {
  const averageRating =
    user.reviews.length > 0
      ? user.reviews.reduce((sum, review) => sum + review.rating, 0) /
        user.reviews.length
      : 0;

  return (
    <tr
      className="hover:bg-gray-100 cursor-pointer transition-colors  duration-150"
      onClick={onClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
      <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {user.checkout.length}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {user.reviews.length}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {user.reviews.length > 0 ? (
          <div className="flex justify-center">
            <StarRating rating={averageRating} />
            <span className="ml-2 text-sm text-gray-600">
              ({averageRating.toFixed(1)})
            </span>
          </div>
        ) : (
          "N/A"
        )}
      </td>
    </tr>
  );
};

const ClientsPage: React.FC = () => {
  const { data, loading, error } = useQuery<FetchAllUsersData>(FETCH_ALL_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="text-center mt-8 text-red-500">
        Error: {error.message}
      </div>
    );

  const users = data?.fetchAllUsers || [];

  // Filter users based on the search term
  const filteredUsers = users.filter((user) => {
    const searchResult =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    return searchResult;
  });

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

  return (
    <section className="container py-8 ">
      <h1 className="font-bold text-2xl py-5 px-4 border-b-2 mb-2 w-full">
        Client Management{" "}
        <span className="text-gray-600  font-medium text-base">
          ({filteredUsers.length || 0})
        </span>
      </h1>

      {/* Search Input */}
      <div className="mb-4 px-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full"
        />
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#202939]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  User.Id
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Orders
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Reviews
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Avg. Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 max-h-96 h-full overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onClick={() => setSelectedUser(user)}
                  />
                ))
              ) : (
                <tr>
                  <td
                    className="px-6 py-4 text-center text-gray-500"
                    colSpan={5}
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="mt-12 bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-[#202939] text-white px-6 py-4">
            <h2 className="text-2xl font-bold">{selectedUser.fullName}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <UserInfoSection
                title="Orders"
                icon={<FaBox color="white" />}
                content={
                  selectedUser.checkout.length > 0 ? (
                    <div className="overflow-y-auto max-h-60">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Custom ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Governorate
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedUser.checkout.map((checkout: Checkout) => (
                            <tr key={checkout.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {checkout.package[0].customId}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {checkout.Governorate.name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {translateStatus(checkout.package[0].status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No orders available.</p>
                  )
                }
              />

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
                              Product ID
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
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {review.productId}
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
                    <div className="overflow-x-auto ">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Document
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedUser.ContactUs.map(
                            (contactUs: ContactUs) => (
                              <tr
                                key={contactUs.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {contactUs.subject}
                                </td>
                                <td className="px-4 w-32 relative  h-16  py-2 whitespace-nowrap">
                                  <Image
                                    src={
                                      contactUs.document ||
                                      "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                                    }
                                    layout="fill"
                                    alt={contactUs.id}
                                    className="object-contain rounded cursor-pointer"
                                    onClick={() =>
                                      openModal(contactUs.document)
                                    }
                                  />
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {contactUs.message}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No messages available.</p>
                  )
                }
              />
            </div>
          </div>
        </div>
      )}
      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0   z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeModal}
        >
          <div className="relative bg-white p-2 rounded-lg max-w-3xl max-h-3xl">
            {selectedImage === null ? (
              <CiImageOn />
            ) : (
              <img
                src={selectedImage}
                alt="Enlarged view"
                className={`max-w-[600px] max-h-[600px] object-contain transition-transform duration-300 ${
                  isImageZoomed ? "scale-150" : "scale-100"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleZoom();
                }}
              />
            )}
            <button
              className="absolute top-2 right-2 text-white bg-[#202939] rounded-full w-8 h-8 flex items-center justify-center"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClientsPage;

interface UserInfoSectionProps {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const UserInfoSection: React.FC<UserInfoSectionProps> = ({
  title,
  icon,
  content,
}) => {
  return (
    <div className="border rounded-lg shadow-md p-4">
      <div className="flex items-center bg-[#202939] text-white px-4 py-2 rounded-md">
        {icon}
        <h3 className="ml-2 font-bold text-lg">{title}</h3>
      </div>
      <div className="mt-4">{content}</div>
    </div>
  );
};
