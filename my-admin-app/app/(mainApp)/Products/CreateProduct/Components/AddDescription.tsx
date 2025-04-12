"use client";
import { Editor } from '@tinymce/tinymce-react';
import React from "react";
import type { Editor as TinyMCEEditor } from 'tinymce';

interface AddDescriptionProps {
  description: string;
  setDescription: (content: string) => void;
}

const AddDescription: React.FC<AddDescriptionProps> = ({ description, setDescription }) => {
  return (
    <div className="w-full">
      <label className="block text-lg font-medium text-gray-700 mb-2">
        Description du produit
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
            inline: false,
            plugins: [
              'lists',
              'link',
              'table',
              'autoresize',
              'autolink',
              'textcolor'
            ],
            toolbar:
              'undo redo | bold italic underline | forecolor backcolor | ' +
              'bullist numlist | link table | alignleft aligncenter alignright',
            content_style: `
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-size: 15px;
                line-height: 1.6;
                color: #333;
                padding: 20px 25px !important;
                margin: 0;
                min-height: 400px;
              }
              p, h1, h2, h3, h4, h5, h6 {
                margin: 0 0 16px 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
              }
              table, th, td {
                border: 1px solid #ddd;
                padding: 10px 12px;
              }
              th {
                background-color: #f5f5f5;
              }
              [data-mce-bogus="all"] {
                display: none;
              }
            `,
            table_default_attributes: {
              border: '1'
            },
            table_default_styles: {
              'border-collapse': 'collapse',
              width: '100%'
            },
            table_responsive_width: true,
            branding: false,
            toolbar_mode: 'sliding',
            mobile: {
              toolbar: 'undo redo | bold italic | forecolor backcolor | table'
            }
          }}
        />
      </div>
    </div>
  );
};

export default AddDescription;
