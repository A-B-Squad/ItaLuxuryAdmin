import React from 'react';
import { BiPackage } from 'react-icons/bi';

const BundleEmptyState: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <BiPackage className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg font-semibold">Aucun pack trouvé</p>
            <p className="text-gray-400 text-sm mt-2">Essayez d'ajuster vos filtres ou créez un nouveau pack</p>
        </div>
    );
};

export default BundleEmptyState;