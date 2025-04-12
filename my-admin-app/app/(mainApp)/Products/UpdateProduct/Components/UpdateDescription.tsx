"use client";
import { Editor } from '@tinymce/tinymce-react';
import React, { useRef, useEffect } from "react";
import type { Editor as TinyMCEEditor } from 'tinymce';

interface UpdateDescriptionProps {
  description: string;
  setDescription: (content: string) => void;
}

const UpdateDescription: React.FC<UpdateDescriptionProps> = ({ description, setDescription }) => {

  return (
    <div className="w-full">
      <label className="block text-lg font-medium text-gray-700 mb-2">
        Product Description
      </label>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TinyMCE_API_KEY}
          value={description}
          onEditorChange={(content: string) => {
            setDescription(content);
          }}
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'lists',
              'link',
              'table',
              'undo',
              'textcolor' // Optional for older versions, safe to include
            ],
            toolbar:
              'undo redo | bold italic underline | forecolor backcolor | bullist numlist | link table',
            color_map: [
              "000000", "Black",
              "FF0000", "Red",
              "FFFF00", "Yellow",
              "008000", "Green",
              "0000FF", "Blue",
              "800080", "Purple",
              "FFFFFF", "White"
            ],
            toolbar_mode: 'sliding',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          }}
        />

      </div>
    </div>
  );
};

export default UpdateDescription;