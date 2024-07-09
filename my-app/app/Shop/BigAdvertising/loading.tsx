import React from "react";
import "../../globals.css";
const loading = () => {
  return (
    <div className="loader  z-[10000]">
      <div className="loader__bar"></div>
      <div className="loader__bar"></div>
      <div className="loader__bar"></div>
      <div className="loader__bar"></div>
      <div className="loader__bar"></div>
      <div className="loader__ball"></div>
    </div>
  );
};

export default loading;
