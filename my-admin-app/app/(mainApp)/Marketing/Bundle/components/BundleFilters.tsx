import React from 'react';
import { BiSearch } from 'react-icons/bi';
import { BundleType, BundleStatus, bundleTypes } from './bundle.types';

interface BundleFiltersProps {
    searchTerm: string;
    filterStatus: BundleStatus | '';
    filterType: BundleType | '';
    onSearchChange: (value: string) => void;
    onStatusChange: (value: BundleStatus | '') => void;
    onTypeChange: (value: BundleType | '') => void;
}

const BundleFilters: React.FC<BundleFiltersProps> = ({
    searchTerm,
    filterStatus,
    filterType,
    onSearchChange,
    onStatusChange,
    onTypeChange
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <BiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher des packs..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => onStatusChange(e.target.value as BundleStatus | '')}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                    <option value="">Tous les Statuts</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="INACTIVE">Inactif</option>
                </select>
                <select
                    value={filterType}
                    onChange={(e) => onTypeChange(e.target.value as BundleType | '')}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                    <option value="">Tous les Types</option>
                    {bundleTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default BundleFilters;