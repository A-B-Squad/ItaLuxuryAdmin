import moment from "moment";
import "moment/locale/fr";
import "moment-timezone";
import { MdDeleteOutline } from "react-icons/md";
import { IoMdClose } from "react-icons/io";

moment.locale("fr");

const CouponsRow = ({ coupons, onDeleteClick }: any) => {
  const formatDate = (timestamp: string) => {
    return moment(parseInt(timestamp, 10)).format("DD/MM/YYYY");
  };

  return (
    <tr className=" text-gray-700 border-b ">
      <td className="px-4 py-3">
        <div className=" text-sm">
          <div className="relative font-semibold tracking-wider  mr-3 rounded-full md:block">
            <p>{coupons.code}</p>
          </div>
        </div>
      </td>
      <td className="text-center  w-5 text-sm   font-semibold">
        {coupons.available ? (
          <p className="bg-mainColorAdminDash text-white   py-1 rounded-md">
            Non Utilisé
          </p>
        ) : (
          <p className="bg-red-400 text-white  py-1 rounded-md">Utilisé</p>
        )}
      </td>
      <td className="text-center    text-sm   font-semibold">
        <p className="   py-1 rounded-md">{coupons.discount}</p>
      </td>
      <td className="text-center px-4 py-3 text-ms font-semibold">
        {coupons?.checkout[0]?.createdAt ? (
          formatDate(coupons?.checkout[0]?.createdAt)
        ) : (
          <IoMdClose color="red" className="w-full" />
        )}
      </td>
      <td className="text-center px-4 py-3 text-sm font-semibold">
        {coupons?.checkout[0]?.id ? (
          coupons?.checkout[0]?.id
        ) : (
          <IoMdClose color="red" className="w-full" />
        )}
      </td>
      {coupons.available ? (
        <td className="Edits text-sm ">
          <div className="flex justify-center items-center gap-2">
            <button
              type="button"
              onClick={() => onDeleteClick(coupons)}
              className="flex justify-center items-center w-9 h-9 hover:opacity-40 transition-opacity shadow-md rounded-full border-2"
            >
              <MdDeleteOutline size={18} />
            </button>
          </div>
        </td>
      ) : (
        <td className="Edits text-sm text-center  ">
          <IoMdClose className="text-center w-full mt-4 " color="red" />
        </td>
      )}
    </tr>
  );
};

export default CouponsRow;
