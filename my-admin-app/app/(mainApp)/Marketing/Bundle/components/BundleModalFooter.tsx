import React from 'react';
import { BiEdit, BiPlus, BiX } from 'react-icons/bi';

interface BundleModalFooterProps {
    isEditing: boolean;
    onCancel: () => void;
    onSubmit: () => void;
}

const BundleModalFooter: React.FC<BundleModalFooterProps> = ({ isEditing, onCancel, onSubmit }) => {
    return (
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-slate-50 px-8 py-6 flex justify-between items-center border-t-2 border-gray-200">
            <button
                onClick={onCancel}
                className="px-8 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-white transition-all font-bold text-gray-700 flex items-center gap-2"
            >
                <BiX size={20} />
                Annuler
            </button>
            <button
                onClick={onSubmit}
                className="px-10 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all font-bold flex items-center gap-2"
            >
                {isEditing ? <BiEdit size={20} /> : <BiPlus size={20} />}
                {isEditing ? 'Mettre à Jour le Pack' : 'Créer le Pack'}
            </button>
        </div>
    );
};

export default BundleModalFooter;