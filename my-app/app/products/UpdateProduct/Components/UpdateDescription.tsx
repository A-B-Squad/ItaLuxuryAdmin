"use client";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
import React, { useState, useRef, useMemo } from "react";

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
      // Configure table styles for Jodit Editor output
      extraButtons: [
        {
          name: "table",
          icon: "table",
          exec: (editor: any) => {
            editor.selection.insertHTML(`
              <table style="border: 1px solid; border-collapse: collapse; width: 100%;">
                <tr style="border: 1px solid;">
                  <td style="border: 1px solid; padding: 8px;"></td>
                  <td style="border: 1px solid; padding: 8px;"></td>
                </tr>
                <tr style="border: 1px solid;">
                  <td style="border: 1px solid; padding: 8px;"></td>
                  <td style="border: 1px solid; padding: 8px;"></td>
                </tr>
              </table>
            `);
          },
        },
      ],

      buttons:
        "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,superscript,subscript,spellcheck,cut,copy,paste,selectall,copyformat",
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
