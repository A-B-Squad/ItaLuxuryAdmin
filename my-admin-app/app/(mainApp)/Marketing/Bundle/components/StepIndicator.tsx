import React from 'react';

const StepIndicator: React.FC = () => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">1</div>
                <span className="font-semibold text-gray-700">Infos de Base</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4 rounded-full">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '33%' }}></div>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">2</div>
                <span className="font-semibold text-gray-500">Conditions</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4 rounded-full"></div>
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">3</div>
                <span className="font-semibold text-gray-500">Récompenses</span>
            </div>
        </div>
    );
};

export default StepIndicator;