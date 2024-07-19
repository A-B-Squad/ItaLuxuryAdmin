import React from "react";

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const totalStars = 5;
  const hasHalfStar = rating % 1 !== 0;

  const fullStars = Math.floor(rating);
  return (
    <div className="flex">
      {Array.from({ length: totalStars }, (_, index) => {
        if (index < fullStars) {
          return (
            <svg
              key={index}
              className="w-6 h-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927C9.249 2.345 9.751 2.345 9.951 2.927L11.18 6.316C11.283 6.616 11.571 6.8 11.895 6.8H15.12C15.749 6.8 15.98 7.566 15.435 7.901L12.581 9.683C12.339 9.839 12.226 10.152 12.329 10.452L13.558 13.841C13.758 14.423 13.073 14.934 12.528 14.599L9.674 12.817C9.432 12.661 9.068 12.661 8.826 12.817L5.972 14.599C5.427 14.934 4.742 14.423 4.942 13.841L6.171 10.452C6.274 10.152 6.161 9.839 5.919 9.683L3.065 7.901C2.52 7.566 2.751 6.8 3.38 6.8H6.605C6.929 6.8 7.217 6.616 7.32 6.316L8.549 2.927H9.049Z" />
            </svg>
          );
        } else if (index === fullStars && hasHalfStar) {
          // Half star
          return (
            <svg
              key={index}
              className="w-5 h-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                fill="url(#half)"
                d="M9.049 2.927C9.249 2.345 9.751 2.345 9.951 2.927L11.18 6.316C11.283 6.616 11.571 6.8 11.895 6.8H15.12C15.749 6.8 15.98 7.566 15.435 7.901L12.581 9.683C12.339 9.839 12.226 10.152 12.329 10.452L13.558 13.841C13.758 14.423 13.073 14.934 12.528 14.599L9.674 12.817C9.432 12.661 9.068 12.661 8.826 12.817L5.972 14.599C5.427 14.934 4.742 14.423 4.942 13.841L6.171 10.452C6.274 10.152 6.161 9.839 5.919 9.683L3.065 7.901C2.52 7.566 2.751 6.8 3.38 6.8H6.605C6.929 6.8 7.217 6.616 7.32 6.316L8.549 2.927H9.049Z"
              />
            </svg>
          );
        } else {
          // Empty star
          return (
            <svg
              key={index}
              className="w-5 h-6 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927C9.249 2.345 9.751 2.345 9.951 2.927L11.18 6.316C11.283 6.616 11.571 6.8 11.895 6.8H15.12C15.749 6.8 15.98 7.566 15.435 7.901L12.581 9.683C12.339 9.839 12.226 10.152 12.329 10.452L13.558 13.841C13.758 14.423 13.073 14.934 12.528 14.599L9.674 12.817C9.432 12.661 9.068 12.661 8.826 12.817L5.972 14.599C5.427 14.934 4.742 14.423 4.942 13.841L6.171 10.452C6.274 10.152 6.161 9.839 5.919 9.683L3.065 7.901C2.52 7.566 2.751 6.8 3.38 6.8H6.605C6.929 6.8 7.217 6.616 7.32 6.316L8.549 2.927H9.049Z" />
            </svg>
          );
        }
      })}
    </div>
  );
};

export default StarRating;
