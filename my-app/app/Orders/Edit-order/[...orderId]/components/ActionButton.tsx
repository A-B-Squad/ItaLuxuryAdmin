const ActionButton = ({ onClick, label, disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-40 h-14 px-2 text-sm font-medium text-center rounded border border-mainColorAdminDash transition-all ${
      disabled
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "hover:bg-mainColorAdminDash hover:text-white"
    }`}
  >
    {label}
  </button>
);
export default ActionButton;
