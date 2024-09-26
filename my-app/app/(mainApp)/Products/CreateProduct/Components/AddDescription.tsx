"use client";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
import React, { useState, useRef, useMemo } from "react";
import "jodit/es5/jodit.min.css";

const AddDescription = ({ description, setDescription }: any) => {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start typing...",
      uploader: {
        insertImageAsBase64URI: true,
      },
      spellcheck: true,
      height: 159,
      minHeight: 500,
      extraButtons: [
        {
          name: "table",
          icon: "table",
          exec: (editor: any) => {
            try {
              editor.selection.insertHTML(`
                <table style="border: 2px solid #e5e7eb; border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 10px;">
                  <thead style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                    <tr>
                      <th style="border: 2px solid #e5e7eb; padding: 12px; text-align: left;">Header 1</th>
                      <th style="border: 2px solid #e5e7eb; padding: 12px; text-align: left;">Header 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="border: 2px solid #e5e7eb; padding: 12px;">Cell 1</td>
                      <td style="border: 2px solid #e5e7eb; padding: 12px;">Cell 2</td>
                    </tr>
                    <tr>
                      <td style="border: 2px solid #e5e7eb; padding: 12px;">Cell 3</td>
                      <td style="border: 2px solid #e5e7eb; padding: 12px;">Cell 4</td>
                    </tr>
                  </tbody>
                </table>
              `);
            } catch (error) {
              console.error("Error inserting table HTML:", error);
            }
          },
        },
      ],
      buttons:
        "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,superscript,subscript,spellcheck,cut,copy,paste,selectall,copyformat,table",
      createAttributes: {
        table: {
          style:
            "border: 2px solid #e5e7eb; border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 10px;",
        },
        thead: {
          style: "background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;",
        },
        tr: {
          style: "border: 2px solid #e5e7eb;",
        },
        th: {
          style: "border: 2px solid #e5e7eb; padding: 12px; text-align: left;",
        },
        tbody: {},
        td: {
          style: "border: 2px solid #e5e7eb; padding: 12px;",
        },
      },
    }),
    [],
  );

  return (
    <>
      <div>
        <JoditEditor
          ref={editor}
          value={description}
          config={config}
          onBlur={(newContent) => setDescription(newContent)}
        />
      </div>
      <div dangerouslySetInnerHTML={{ __html: description }} />
    </>
  );
};

export default AddDescription;
