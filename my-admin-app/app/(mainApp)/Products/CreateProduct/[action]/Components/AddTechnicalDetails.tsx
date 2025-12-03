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
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'table',
              'wordcount'
            ],
            toolbar:
              'bold italic underline | forecolor backcolor | bullist numlist | link table | removeformat',
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
            branding: false,
            resize: false,
            statusbar: false
          }}
        />
      </div>
    </div>
  );
};

export default AddTechnicalDetails;
