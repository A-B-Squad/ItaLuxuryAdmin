"use client";
import React, { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_REVIEWS_MUTATION } from '@/app/graph/mutations';
import SearchProduct from '@/app/(mainApp)/components/searchProduct';

// Define proper type for product
interface Product {
    id: string;
    name: string;
    reference?: string;
    images?: string[];
}

const AddReviews = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [userName, setUserName] = useState<string>('');
    const [comment, setComment] = useState<string>('');
    const [notification, setNotification] = useState<{ type: string, message: string } | null>(null);

    // Handle product selection from the SearchProduct component
    const handleProductSelect = useCallback(
        (product: Product) => {
            if (product && product.id) {
                setSelectedProduct(product);
            }
        }, []
    );

    // Mutation to add review
    const [addReview, { loading: addingReview }] = useMutation(ADD_REVIEWS_MUTATION, {
        onCompleted: () => {
            setNotification({
                type: 'success',
                message: "L'avis a été ajouté au produit."
            });
            // Reset form
            setSelectedProduct(null);
            setRating(0);
            setUserName('');
            setComment('');

            // Clear notification after 3 seconds
            setTimeout(() => {
                setNotification(null);
            }, 3000);
        },
        onError: (error) => {
            setNotification({
                type: 'error',
                message: `Erreur lors de l'ajout de l'avis: ${error.message}`
            });

            // Clear notification after 3 seconds
            setTimeout(() => {
                setNotification(null);
            }, 3000);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct) {
            setNotification({
                type: 'error',
                message: "Veuillez sélectionner un produit"
            });
            return;
        }

        if (rating === 0) {
            setNotification({
                type: 'error',
                message: "Veuillez donner une note"
            });
            return;
        }

        if (!userName.trim()) {
            setNotification({
                type: 'error',
                message: "Veuillez entrer un nom de client"
            });
            return;
        }

        await addReview({
            variables: {
                productId: selectedProduct.id,
                rating: rating,
                userName: userName,
                comment: comment || ""
            }
        });
    };


    return (
        <div className="container mx-auto p-4">
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <div className="border-b p-6">
                    <h2 className="text-xl font-semibold text-gray-800">Ajouter un avis</h2>
                    <p className="text-sm text-gray-500 mt-1">Ajoutez un avis client pour un produit</p>
                </div>

                {notification && (
                    <div className={`p-4 mb-4 ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {notification.message}
                    </div>
                )}

                <div className="p-6">
                    {/* Search bar for products */}
                    <div className="mb-6">
                        <SearchProduct onProductSelect={handleProductSelect} />
                    </div>

                    {/* Display selected product */}
                    {selectedProduct && (
                        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-md">
                            <h3 className="text-md font-medium text-gray-800 mb-2">Produit sélectionné:</h3>
                            <div className="flex items-center">
                                {selectedProduct.images && selectedProduct.images[0] && (
                                    <div className="w-16 h-16 relative mr-3 flex-shrink-0">
                                        <img
                                            src={selectedProduct.images[0]}
                                            alt={selectedProduct.name}
                                            className="w-full h-full object-contain rounded-md"
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-800">{selectedProduct.name}</p>
                                    {selectedProduct.reference && (
                                        <p className="text-sm text-gray-600">Réf: {selectedProduct.reference}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">


                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="text-2xl focus:outline-none"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        {star <= (hoverRating || rating) ? (
                                            <span className="text-yellow-400">★</span>
                                        ) : (
                                            <span className="text-gray-300">★</span>
                                        )}
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-500">
                                    {rating > 0 ? `${rating} étoile${rating > 1 ? 's' : ''}` : 'Aucune note'}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                            <input
                                id="userName"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Entrez le nom du client"
                                required
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Entrez le commentaire du client (optionnel)"
                                rows={4}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={addingReview}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium ${addingReview ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {addingReview ? 'Ajout en cours...' : 'Ajouter l\'avis'}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default AddReviews;