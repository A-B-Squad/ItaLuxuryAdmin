import React from "react";
const Loading = () => {
  return (
    <div className="w-full h-[80vh] flex items-center justify-center">
      <div className="loader  ">
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__bar"></div>
        <div className="loader__ball"></div>
      </div>
    </div>
  );
};

export default Loading;
