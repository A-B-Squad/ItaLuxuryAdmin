"use client";
import { Editor } from '@tinymce/tinymce-react';
import React, { useRef, useState, useEffect } from "react";

interface AddDescriptionProps {
  description: string;
  setDescription: (description: string) => void;
}

const AddDescription = ({ description, setDescription }: AddDescriptionProps) => {
  const editorRef = useRef<any>(null);
  const [initialContent, setInitialContent] = useState(description);
  
  // Only update initialContent when description prop changes from parent
  useEffect(() => {
    setInitialContent(description);
  }, [description]);

  const handleEditorChange = (content: string) => {
    // This prevents the auto-recreation issue by only updating when content actually changes
    setDescription(content);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-3 border-b">
        <h3 className="text-gray-700 font-medium">Description du produit</h3>
      </div>
      <div className="p-1">
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TinyMCE_API_KEY}
          onInit={(evt, editor) => {
            editorRef.current = editor;
          }}
          initialValue={initialContent}
          onEditorChange={handleEditorChange}
          init={{
            height: 500,
            width: "100%",
            menubar: true,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
              'textcolor', 'colorpicker'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | table link emoticons | help',
            content_style: `
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                font-size: 16px; 
                line-height: 1.5;
                padding: 15px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 1rem;
              }
              table, th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              p {
                margin-bottom: 1rem;
              }
            `,
            entity_encoding: "raw",
            cleanup: false,
            verify_html: false,
            // Improve deletion behavior
            browser_spellcheck: true,
            contextmenu: false,
            // Disable automatic formatting that might cause issues
            forced_root_block: 'p',
            force_br_newlines: false,
            force_p_newlines: false,
            // Improve paste behavior
            paste_as_text: false,
            paste_data_images: true,
            paste_merge_formats: true,
            // Other settings
            automatic_uploads: true,
            table_default_styles: {
              width: '100%'
            },
            table_responsive_width: true,
            table_default_attributes: {
              border: '1'
            }
          }}
        />
      </div>
    </div>
  );
};

export default AddDescription;
