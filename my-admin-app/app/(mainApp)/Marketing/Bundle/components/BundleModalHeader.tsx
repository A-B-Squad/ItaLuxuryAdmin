// components/BundleModalHeader.tsx
import React from 'react';
import { BiEdit, BiPlus, BiX } from 'react-icons/bi';

interface BundleModalHeaderProps {
    isEditing: boolean;
    onClose: () => void;
}

const BundleModalHeader: React.FC<BundleModalHeaderProps> = ({ isEditing, onClose }) => {
    return (
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center z-10">
            <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    {isEditing ? <BiEdit size={32} /> : <BiPlus size={32} />}
                    {isEditing ? 'Modifier le Pack' : 'Créer un Nouveau Pack'}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                    {isEditing 
                        ? 'Mettre à jour les paramètres de votre pack promotionnel' 
                        : 'Configurer une nouvelle offre promotionnelle pour vos clients'}
                </p>
            </div>
            <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all text-white"
            >
                <BiX size={32} />
            </button>
        </div>
    );
};

export default BundleModalHeader;