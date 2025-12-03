import React from 'react';
import { BiPlus, BiPackage } from 'react-icons/bi';
import { Bundle } from './bundle.types';

interface BundleHeaderProps {
    filteredBundles: Bundle[];
    onCreateBundle: () => void;
}

const BundleHeader: React.FC<BundleHeaderProps> = ({ filteredBundles, onCreateBundle }) => {
    const activeBundles = filteredBundles.filter(b => b.status === 'ACTIVE').length;
    const inactiveBundles = filteredBundles.filter(b => b.status === 'INACTIVE').length;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Gestion des Packs
                    </h1>
                    <p className="text-gray-600 mt-2">Créer et gérer les packs promotionnels</p>
                    <div className="flex gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">{activeBundles} Actifs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <span className="text-sm text-gray-600">{inactiveBundles} Inactifs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BiPackage className="text-blue-500" />
                            <span className="text-sm text-gray-600">{filteredBundles.length} Total</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onCreateBundle}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl flex items-center gap-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                    <BiPlus size={24} />
                    Créer un Pack
                </button>
            </div>
        </div>
    );
};

export default BundleHeader;