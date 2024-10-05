import React from "react";
import { TfiReload } from "react-icons/tfi";

const ReloadButton = () => {
  return (
    <button
      className="reloadPage border rounded-sm p-2"
      onClick={() => window.location.reload()}
      title="Reload"
    >
      <TfiReload size={18} />
    </button>
  );
};

export default ReloadButton;
