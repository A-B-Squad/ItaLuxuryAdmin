import { CREATE_PACKAGE_COMMENTS_MUTATIONS } from "@/app/graph/mutations";
import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { FaCommentAlt, FaInfoCircle, FaUserCircle } from "react-icons/fa";

const Comments = ({ comments = [], packageId, refetch }: any) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createPackageComments] = useMutation(
    CREATE_PACKAGE_COMMENTS_MUTATIONS,
  );

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const updatedComments = [...comments, newComment];
      await createPackageComments({
        variables: {
          packageId,
          comment: updatedComments,
        },
      });
      setNewComment("");
      refetch(); // Refetch the package data to get the updated comments
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitComment();
    }
  };

  return (
    <div className="Comments bg-white shadow-sm border rounded-lg overflow-hidden">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">Commentaires</h2>
      </div>

      <div className="p-5">
        <div className="bg-blue-50 border-l-4 rounded-md border-blue-500 text-blue-700 p-3 mb-5 flex items-start">
          <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
          <p className="text-sm">
            Seuls vous et les autres membres du personnel pouvez voir les
            commentaires
          </p>
        </div>

        <div className="mb-5">
          <textarea
            className="w-full p-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            rows={4}
            placeholder="Laissez un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">Appuyez sur Ctrl+Enter pour envoyer</p>
        </div>

        <button
          className="bg-mainColorAdminDash hover:opacity-90 transition-opacity text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </>
          ) : (
            <>
              <FaCommentAlt className="mr-2" />
              Commenter en tant que Ita-Luxury
            </>
          )}
        </button>

        {comments.length > 0 ? (
          <div className="mt-6 space-y-5">
            {comments.map(
              (comment: string, index: number) => (
                <div key={index} className={`p-4 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border`}>
                  <div className="flex items-start">
                    <div className="bg-mainColorAdminDash text-white rounded-full p-2 mr-3">
                      <FaUserCircle className="text-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <p className="font-semibold text-mainColorAdminDash">Ita-Luxury</p>
                        <span className="text-xs text-gray-500 ml-2">
                          {/* If you have timestamp data, you can add it here */}
                          {/* {new Date(comment.timestamp).toLocaleString()} */}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 italic border-t mt-6">
            Aucun commentaire pour cette commande
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
