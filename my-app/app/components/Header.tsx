import React from "react";
import { CiUser } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";

const Header = () => {
  return (
    <header className=" sticky top-0 z-50   shadow-md py-4  sm:px-10 bg-white font-[sans-serif] min-h-[70px]  tracking-wide w-full">
      <div className=" container flex items-center justify-end space-x-3">
        <button className="p-2 relative text-sm rounded-md font-bold text-white border border-gray-300 transition-all ease-in-out duration-300 hover:bg-transparent hover:text-strongBeige">
          <span className="w-4  h-4 font-extralight p-2 flex items-center justify-center bg-red-700 text-white rounded-full absolute right-1 bottom-1 text-[10px]">
            0
          </span>
          <IoIosNotificationsOutline size={24} className="text-gray-600" />
        </button>
        <button className="p-2 text-sm rounded-md font-bold text-white border  border-gray-300 transition-all ease-in-out duration-300 hover:bg-transparent hover:text-strongBeige">
          <CiUser size={24} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;
