import React from 'react';

interface ScalingStrategyProps {
  scalingStrategy: {
    isReadyForScaling: boolean;
    approach: string;
    budgetIncrease: number;
    description: string;
  } | null;
}

const ScalingStrategy: React.FC<ScalingStrategyProps> = ({ scalingStrategy }) => {
  if (!scalingStrategy) return null;

  return (
    <div className="bg-dashboard-neutral-50 p-4 rounded-lg mt-6">
      <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
        Stratégie de Mise à l'Échelle
      </h5>

      <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-3">
          <div className={`w-3 h-3 rounded-full ${
            scalingStrategy.approach === 'aggressive' ? "bg-green-500" :
            scalingStrategy.approach === 'moderate' ? "bg-blue-500" :
            scalingStrategy.approach === 'conservative' ? "bg-yellow-500" :
            "bg-red-500"
          }`}></div>
          <span className="ml-2 text-sm font-medium text-dashboard-neutral-700">
            {scalingStrategy.isReadyForScaling ? "Prêt pour la mise à l'échelle" : "Non prêt pour la mise à l'échelle"}
          </span>
        </div>

        <p className="text-sm text-dashboard-neutral-600 mb-3">
          {scalingStrategy.description}
        </p>

        {scalingStrategy.isReadyForScaling && (
          <div className="mt-4">
            <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-2">Recommandation</h6>
            <div className="flex items-center justify-between bg-dashboard-neutral-50 p-3 rounded-lg">
              <div>
                <span className="text-sm text-dashboard-neutral-600">Approche:</span>
                <span className="ml-2 text-sm font-medium text-dashboard-neutral-800 capitalize">
                  {scalingStrategy.approach === 'aggressive' ? "Agressive" :
                   scalingStrategy.approach === 'moderate' ? "Modérée" :
                   scalingStrategy.approach === 'conservative' ? "Conservative" : "Aucune"}
                </span>
              </div>
              <div>
                <span className="text-sm text-dashboard-neutral-600">Augmentation du budget:</span>
                <span className="ml-2 text-sm font-medium text-dashboard-neutral-800">
                  {scalingStrategy.budgetIncrease}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScalingStrategy;