export const SearchBar = ({ value, onChange }: any) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search products..."
      className="w-full p-2 border rounded"
    />
  );
};
