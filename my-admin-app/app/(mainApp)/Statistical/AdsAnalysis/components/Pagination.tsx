import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    itemName: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    itemName
}) => {
    return (
        <div className="px-4 py-3 flex items-center justify-between border-t border-dashboard-neutral-200">
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-dashboard-neutral-300 text-sm font-medium rounded-md ${currentPage === 1
                            ? 'bg-white text-dashboard-neutral-300 cursor-not-allowed'
                            : 'bg-white text-dashboard-primary hover:bg-dashboard-neutral-50'
                        }`}
                >
                    Précédent
                </button>
                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-dashboard-neutral-300 text-sm font-medium rounded-md ${currentPage === totalPages
                            ? 'bg-white text-dashboard-neutral-300 cursor-not-allowed'
                            : 'bg-white text-dashboard-primary hover:bg-dashboard-neutral-50'
                        }`}
                >
                    Suivant
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-dashboard-neutral-700">
                        Affichage de <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> à <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span> sur <span className="font-medium">{totalItems}</span> {itemName}
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-dashboard-neutral-300 bg-white text-sm font-medium ${currentPage === 1
                                    ? 'text-dashboard-neutral-300 cursor-not-allowed'
                                    : 'text-dashboard-neutral-500 hover:bg-dashboard-neutral-50'
                                }`}
                        >
                            <span className="sr-only">Précédent</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                        ? 'z-10 bg-dashboard-primary border-dashboard-primary text-white'
                                        : 'bg-white border-dashboard-neutral-300 text-dashboard-neutral-500 hover:bg-dashboard-neutral-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-dashboard-neutral-300 bg-white text-sm font-medium ${currentPage === totalPages
                                    ? 'text-dashboard-neutral-300 cursor-not-allowed'
                                    : 'text-dashboard-neutral-500 hover:bg-dashboard-neutral-50'
                                }`}
                        >
                            <span className="sr-only">Suivant</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;