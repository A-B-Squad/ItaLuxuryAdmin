import React from 'react';
import { BiInfoCircle, BiCalendar, BiChevronDown } from 'react-icons/bi';
import { bundleTypes, BundleFormData } from './bundle.types';

interface BundleBasicInfoProps {
    formData: BundleFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const BundleBasicInfo: React.FC<BundleBasicInfoProps> = ({ formData, onChange }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <BiInfoCircle className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Informations de Base</h3>
                    <p className="text-sm text-gray-500">Définir les détails principaux de votre pack</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        Nom du Pack <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium placeholder-gray-400"
                        placeholder="ex: Achetez 2, Obtenez 1 Gratuit - Collection Été"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={onChange}
                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400"
                        rows={4}
                        placeholder="Fournir une description claire de cette offre promotionnelle..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            Type de Pack <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="type"
                                value={formData.type}
                                onChange={onChange}
                                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium appearance-none bg-white"
                            >
                                {bundleTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <BiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Statut</label>
                        <div className="relative">
                            <select
                                name="status"
                                value={formData.status}
                                onChange={onChange}
                                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium appearance-none bg-white"
                            >
                                <option value="ACTIVE">Actif</option>
                                <option value="INACTIVE">Inactif</option>
                            </select>
                            <BiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <BiCalendar className="text-blue-500" /> Date de Début
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={onChange}
                            className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <BiCalendar className="text-blue-500" /> Date de Fin
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={onChange}
                            className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                        />
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <BiInfoCircle /> Laisser vide pour aucune date de fin
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BundleBasicInfo;