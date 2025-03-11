"use client";
import { Editor } from '@tinymce/tinymce-react';
import React from "react";

const AddDescription = ({ description, setDescription }: any) => {
  return (
    <>
      <div>
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TinyMCE_API_KEY}
          onBlur={(e) => setDescription(e.target.getContent())}
          value={description}
          init={{
            height: 500,
            width: "100%",
            plugins: [
              'image', 'link', 'lists', 'table',
              'textcolor', 'colorpicker', 'code'
            ],
            toolbar: [
              'undo redo | ',
              'styleselect | bold italic underline | ',
              'forecolor backcolor | ',
              'alignleft aligncenter alignright | ',
              'bullist numlist | ',
              'link image table | ',
              'code'
            ].join(''),
            content_style: `
               body { 
                 font-family: Helvetica, Arial, sans-serif; 
                 font-size: 16px; 
               }
               table { 
                 width: 100%; 
                 border-collapse: collapse; 
               }
               table, th, td { 
                 border: 1px solid #ddd; 
                 padding: 8px; 
               }
             `,

          }}
        />
      </div>
    </>
  );
};

export default AddDescription;