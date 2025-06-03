import React from 'react';

interface CreativeAnalysisProps {
  activeCampaign: any;
  benchmarks: any;
  adFrequency: number;
}

const CreativeAnalysis: React.FC<CreativeAnalysisProps> = ({
  activeCampaign,
  benchmarks,
  adFrequency
}) => {
  return (
    <div className="bg-dashboard-neutral-50 p-4 rounded-lg mt-6">
      <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        Analyse des Créatifs
      </h5>
      <div className="mt-2 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-2">Impact des Créatifs</h6>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${activeCampaign.ctr > benchmarks.ctr
                ? "bg-green-500"
                : "bg-red-500"
                }`}></div>
              <span className="ml-2 text-sm text-dashboard-neutral-700">
                {activeCampaign.ctr > benchmarks.ctr
                  ? "Créatifs performants"
                  : "Créatifs à améliorer"}
              </span>
            </div>
            <p className="text-xs text-dashboard-neutral-600 mt-2">
              {activeCampaign.ctr > benchmarks.ctr
                ? "Vos créatifs génèrent un taux de clics supérieur à la moyenne du secteur."
                : "Vos créatifs génèrent un taux de clics inférieur à la moyenne du secteur."}
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-2">Fatigue Publicitaire</h6>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${adFrequency < benchmarks.frequency
                ? "bg-green-500"
                : adFrequency < benchmarks.frequency * 1.5
                  ? "bg-yellow-500"
                  : "bg-red-500"
                }`}></div>
              <span className="ml-2 text-sm text-dashboard-neutral-700">
                {adFrequency < benchmarks.frequency
                  ? "Faible risque de fatigue"
                  : adFrequency < benchmarks.frequency * 1.5
                    ? "Risque modéré de fatigue"
                    : "Risque élevé de fatigue"}
              </span>
            </div>
            <p className="text-xs text-dashboard-neutral-600 mt-2">
              {adFrequency < benchmarks.frequency
                ? "La fréquence d'affichage est optimale pour éviter la fatigue publicitaire."
                : adFrequency < benchmarks.frequency * 1.5
                  ? "La fréquence d'affichage approche le seuil critique, envisagez de rafraîchir vos créatifs."
                  : "La fréquence d'affichage est trop élevée, rafraîchissez vos créatifs ou élargissez votre audience."}
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-2">Recommandation Créative</h6>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${activeCampaign.ctr > benchmarks.ctr * 1.2
                ? "bg-green-500"
                : "bg-yellow-500"
                }`}></div>
              <span className="ml-2 text-sm text-dashboard-neutral-700">
                {activeCampaign.ctr > benchmarks.ctr * 1.2
                  ? "Maintenir l'approche actuelle"
                  : "Tester de nouveaux créatifs"}
              </span>
            </div>
            <p className="text-xs text-dashboard-neutral-600 mt-2">
              {activeCampaign.ctr > benchmarks.ctr * 1.2
                ? "Vos créatifs actuels sont très performants. Continuez avec cette approche."
                : "Testez de nouveaux visuels et messages pour améliorer l'engagement."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeAnalysis;