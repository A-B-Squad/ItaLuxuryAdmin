import Image from "next/image";
import Link from "next/link";
import StarRating from "./StarRating";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "@/components/ui/use-toast";
import { DELETE_REVIEW_MUTATION } from "@/app/graph/mutations";


interface Review {
  id: string;
  rating: number;
  comment?: string;
  userName?: string;
}

interface Product {
  id: string;
  name: string;
  reference: string;
  solde: number;
  inventory: number;
  images: string[];
  categories: any[];
  reviews: Review[];
}

interface ReviewRowProps {
  product: Product;
  onRowClick?: (productId: string) => void;
}

const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.length;
};

const ReviewsRow: React.FC<ReviewRowProps> = ({ product, onRowClick }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const averageRating = calculateAverageRating(product.reviews);

  // Set up the delete mutation
  const [deleteReview, { loading: isDeleting }] = useMutation(DELETE_REVIEW_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Avis supprimé",
        description: "L'avis a été supprimé avec succès",
        variant: "default",
      });


      setDeletingReviewId(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error.message}`,
        variant: "destructive",
      });
      setDeletingReviewId(null);
    }
  });

  // Handle delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      setDeletingReviewId(reviewId);
      await deleteReview({
        variables: {
          reviewId
        }
      });
    }
  };

  // Handle row click to toggle reviews and refetch data
  const handleRowClick = () => {
    const newShowReviews = !showReviews;
    setShowReviews(newShowReviews);

    // If we're showing reviews, call the onRowClick callback to refetch data
    if (newShowReviews && onRowClick) {
      onRowClick(product.id);
    }
  };

  return (
    <>
      <tr className="text-gray-700 cursor-pointer hover:bg-gray-100" onClick={handleRowClick}>
        <td className="px-4 py-3">
          <div className="flex items-center text-sm">
            <div className="relative w-12 h-12 mr-3 rounded-full md:block">
              <Image
                className=" w-full h-full rounded-full"
                style={{ objectFit: "contain" }}

                src={
                  product.images[0] ||
                  "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                }
                fill={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                alt={product.name}
              />
              <div
                className="absolute inset-0 rounded-full shadow-inner"
                aria-hidden="true"
              ></div>
            </div>
            <div>
              <Link
                target="_blank"
                href={`${process.env.NEXT_PUBLIC_BASE_URL_DOMAIN}/products/tunisie?productId=${product.id}`}
                className="font-semibold hover:opacity-85 transition-opacity text-black"
                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the link
              >
                {product.name}
              </Link>
            </div>
          </div>
        </td>
        <td className="text-center px-4 py-3 text-ms font-semibold">
          {product.reference}
        </td>
        <td className="text-center px-4 py-3 text-ms font-semibold">
          {product.solde}
        </td>
        <td className="text-center px-4 py-3 text-sm font-semibold">
          <span className="text-blue-600">
            {product.reviews.length}
          </span>
        </td>
        <td className="text-center px-4 py-3 text-sm">
          <div className="Reviews flex items-center justify-center space-x-2">
            <StarRating rating={averageRating} />
          </div>
        </td>
      </tr>

      {showReviews && product.reviews.length > 0 && (
        <tr>
          <td colSpan={5} className="px-4 py-2 bg-gray-50">
            <div className="p-3">
              <h3 className="font-semibold text-lg mb-2">Commentaires des clients</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {product.reviews.map((review, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">{review.userName || "Utilisateur anonyme"}</span>
                        <StarRating rating={review.rating} />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking delete
                          handleDeleteReview(review.id);
                        }}
                        disabled={isDeleting && deletingReviewId === review.id}
                        className={`text-xs px-2 py-1 rounded ${isDeleting && deletingReviewId === review.id
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                          }`}
                      >
                        {isDeleting && deletingReviewId === review.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                    {review.comment && (
                      <p className="text-sm mt-1 text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ReviewsRow;
