"use client";
import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import { ALL_CONTACTS } from "../../graph/queries";
import { FaEnvelope } from "react-icons/fa";
import Pagination from "../components/Paginations";
import SmallSpinner from "../components/SmallSpinner";
import Image from "next/image";

interface ContactUs {
  id: string;
  userId: string;
  subject: string;
  document: string;
  email: string;
  message: string;
}

const InboxPage = () => {
  const { data: messages, loading } = useQuery(ALL_CONTACTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

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

  const totalMessages = messages?.allContactUs || [];
  const totalPages = Math.ceil(totalMessages.length / PAGE_SIZE);
  const paginatedMessages = totalMessages.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="container pb-10">
      <h1 className="font-bold text-2xl py-5 px-4 border-b-2 w-full">
        Boite Messagerie{" "}
        <span className="text-gray-600 font-medium text-base">
          ({totalMessages.length})
        </span>
      </h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#202939] text-white px-4 py-2 flex items-center">
          <FaEnvelope color="white" />
          <h3 className="text-lg font-semibold ml-2">Messages</h3>
        </div>
        <div className="mt-8">
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center">
                <SmallSpinner />
              </div>
            ) : totalMessages.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
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
                    {paginatedMessages.map((contactUs: ContactUs) => (
                      <tr key={contactUs.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {contactUs.subject}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {contactUs.email}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Image
                            src={
                              contactUs.document ||
                              "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                            }
                            alt={contactUs.id}
                            width={100}
                            height={100}
                            className="w-16 h-16 object-cover rounded cursor-pointer"
                            onClick={() =>
                              openModal(
                                contactUs.document ||
                                "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png",
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 max-w-96 ">
                          {contactUs.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No messages available.</p>
            )}
          </div>
        </div>
      </div>
      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeModal}
        >
          <div className="relative bg-white p-2 rounded-lg max-w-3xl max-h-3xl">
            <Image
              src={selectedImage}
              alt="Enlarged view"
              className={`max-w-[600px] max-h-[600px] object-contain transition-transform duration-300 ${isImageZoomed ? "scale-150" : "scale-100"
                }`}
              fill={true}
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
            />
            <button
              className="absolute top-2 right-2 text-white bg-[#202939] rounded-full w-8 h-8 flex items-center justify-center"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="pagination mt-4 flex justify-between items-center">
        {totalMessages.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default InboxPage;
