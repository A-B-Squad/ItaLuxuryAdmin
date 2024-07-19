import { CREATE_PACKAGE_COMMENTS_MUTATIONS } from "@/app/graph/mutations";
import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { FaCommentAlt, FaInfoCircle, FaUserCircle } from "react-icons/fa";

const Comments = ({ comments = [], packageId, refetch }:any) => {
  const [newComment, setNewComment] = useState("");
  const [createPackageComments] = useMutation(CREATE_PACKAGE_COMMENTS_MUTATIONS);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const updatedComments = [...comments, newComment];
      await createPackageComments({
        variables: {
          packageId,
          comment: updatedComments
        }
      });
      setNewComment("");
      refetch(); // Refetch the package data to get the updated comments
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="Comments bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Commentaires</h2>

      <div className="bg-blue-100 border-l-4 rounded-md border-blue-500 text-blue-700 p-2 mb-4 flex items-start">
        <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
        <p>
          Seuls vous et les autres membres du personnel pouvez voir les
          commentaires
        </p>
      </div>

      <textarea
        className="w-full p-3 border rounded-md outline-gray-200 mb-4"
        rows={4}
        placeholder="Laissez un commentaire..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      ></textarea>

      <button 
        className="bg-pink-500 text-white px-4 py-2 rounded-md flex items-center"
        onClick={handleSubmitComment}
      >
        <FaCommentAlt className="mr-2" />
        Commenter en tant que Maison NG
      </button>

      {comments.map((comment, index) => (
        <div key={index} className="mt-6 border-t pt-4">
          <div className="flex items-start">
            <FaUserCircle className="text-gray-400 text-3xl mr-3" />
            <div>
              <div className="flex items-center">
                <p className="font-semibold">Maison NG</p>
              </div>
              <p>{comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comments;