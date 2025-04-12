import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Attribute {
  name: string;
  value: string;
}

interface AddAttributeProps {
  attributes: Attribute[];
  setAttributes: React.Dispatch<React.SetStateAction<Attribute[]>>;
}

const AddAttribute: React.FC<AddAttributeProps> = ({ attributes, setAttributes }) => {
  const handleAttributeChange = (
    index: number,
    field: keyof Attribute,
    value: string,
  ) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }]);
  };

  const handleRemoveAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  return (
    <div className="attributes mb-4 bg-white p-6 rounded-lg shadow-lg w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Attributs</h3>
        <button
          type="button"
          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-medium"
          onClick={handleAddAttribute}
        >
          <FiPlus size={16} />
          <span>Ajouter un attribut</span>
        </button>
      </div>

      {attributes.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          Aucun attribut ajouté. Cliquez sur "Ajouter un attribut" pour commencer.
        </div>
      ) : (
        <div className="space-y-3">
          {attributes.map((attribute, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="Nom de l'attribut (ex: Matériau)"
                  value={attribute.name}
                  onChange={(e) =>
                    handleAttributeChange(index, "name", e.target.value)
                  }
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="Valeur de l'attribut (ex: Cuir)"
                  value={attribute.value}
                  onChange={(e) =>
                    handleAttributeChange(index, "value", e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                onClick={() => handleRemoveAttribute(index)}
                aria-label="Supprimer l'attribut"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {attributes.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Les attributs permettent de spécifier des caractéristiques supplémentaires du produit comme la taille, le matériau, etc.</p>
        </div>
      )}
    </div>
  );
};

export default AddAttribute;
