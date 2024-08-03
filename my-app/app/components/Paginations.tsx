import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const maxPagesToShow = 5;

  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pageNumbers.push(i);
        }
        if (totalPages > 5) {
          pageNumbers.push("...");
          pageNumbers.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        if (totalPages > 5) {
          pageNumbers.push("...");
        }
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handlePageClick = (number: number | string) => {
    if (typeof number === "number") {
      onPageChange(number);
    } else if (number === "..." && currentPage > 3) {
      // When clicking on the first ellipsis, go to the page after it
      onPageChange(currentPage - 2);
    } else if (number === "..." && currentPage <= totalPages - 3) {
      // When clicking on the last ellipsis, go to the page before it
      onPageChange(currentPage + 2);
    }
  };

  return (
    <nav className="flex justify-start">
      <ul className="inline-flex -space-x-px">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg 
              ${
                currentPage !== 1
                  ? "hover:bg-gray-100 hover:text-gray-700"
                  : "cursor-not-allowed"
              }`}
          >
            Previous
          </button>
        </li>
        {getPageNumbers().map((number, index) => (
          <li key={index}>
            <button
              onClick={() => handlePageClick(number)}
              className={`px-3 py-2 leading-tight border border-gray-300 
                ${
                  currentPage === number
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                    : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                }`}
            >
              {number}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg 
              ${
                currentPage !== totalPages
                  ? "hover:bg-gray-100 hover:text-gray-700"
                  : "cursor-not-allowed"
              }`}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
