import { Editor } from "@tinymce/tinymce-react";
import React from "react";

interface AddTechnicalDetailsProps {
  technicalDetails: string;
  setTechnicalDetails: (content: string) => void;
}

const AddTechnicalDetails: React.FC<AddTechnicalDetailsProps> = ({ technicalDetails, setTechnicalDetails }) => {
  return (
    <div className="w-full">
      <label className="block text-lg font-medium text-gray-700 mb-2">
        Attributs du produit
      </label>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TinyMCE_API_KEY}
          value={technicalDetails}
          onEditorChange={(content: string) => {
            setTechnicalDetails(content);
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
              'undo redo | formatselect | bold italic underline | forecolor backcolor | ' +
              'bullist numlist | link table | alignleft aligncenter alignright',
            formats: {
              h1: { block: 'h1', classes: 'text-2xl font-bold' },
              h2: { block: 'h2', classes: 'text-xl font-bold' },
              h3: { block: 'h3', classes: 'text-lg font-bold' },
            },
            style_formats: [
              { title: 'Titre principal', format: 'h1' },
              { title: 'Sous-titre', format: 'h2' },
              { title: 'Petit titre', format: 'h3' },
            ],
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
              h1 {
                font-size: 24px;
                font-weight: bold;
              }
              h2 {
                font-size: 20px;
                font-weight: bold;
              }
              h3 {
                font-size: 18px;
                font-weight: bold;
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
              toolbar: 'undo redo | formatselect | bold italic | forecolor backcolor | table'
            }
          }}
        />
      </div>
    </div>
  );
};

export default AddTechnicalDetails;
