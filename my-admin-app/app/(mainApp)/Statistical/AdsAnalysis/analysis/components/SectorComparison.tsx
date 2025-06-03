import React from 'react';

interface SectorComparisonProps {
    activeCampaign: any;
    benchmarks: any;
    adFrequency: number;
    campaignHealthScore: number;
}

const SectorComparison: React.FC<SectorComparisonProps> = ({
    activeCampaign,
    adFrequency,
    campaignHealthScore
}) => {
    return (
        <div className="bg-dashboard-neutral-50 p-4 rounded-lg">
            <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
                Analyse Comparative Sectorielle
            </h5>
            <div className="mt-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-1">CTR Moyen (Secteur du Luxe)</h6>
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-dashboard-neutral-800">1.2%</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeCampaign.ctr > 1.2
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}>
                                {activeCampaign.ctr > 1.2
                                    ? `+${((activeCampaign.ctr - 1.2) / 1.2 * 100)?.toFixed(0)}%`
                                    : `${((activeCampaign.ctr - 1.2) / 1.2 * 100)?.toFixed(0)}%`}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-1">CPC Moyen (Secteur du Luxe)</h6>
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-dashboard-neutral-800">1.81$</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeCampaign.cpc < 1.81
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}>
                                {activeCampaign.cpc < 1.81
                                    ? `-${((1.81 - activeCampaign.cpc) / 1.81 * 100)?.toFixed(0)}%`
                                    : `+${((activeCampaign.cpc - 1.81) / 1.81 * 100)?.toFixed(0)}%`}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-1">Taux de Conversion (Secteur)</h6>
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-dashboard-neutral-800">2.98%</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${(activeCampaign.conversions / activeCampaign.clicks) * 100 > 2.98
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}>
                                {(activeCampaign.conversions / activeCampaign.clicks) * 100 > 2.98
                                    ? `+${(((activeCampaign.conversions / activeCampaign.clicks) * 100 - 2.98) / 2.98 * 100)?.toFixed(0)}%`
                                    : `${(((activeCampaign.conversions / activeCampaign.clicks) * 100 - 2.98) / 2.98 * 100)?.toFixed(0)}%`}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-1">Fréquence d'Affichage (Secteur)</h6>
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-dashboard-neutral-800">3.2</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${adFrequency < 3.2
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}>
                                {adFrequency < 3.2
                                    ? `-${((3.2 - adFrequency) / 3.2 * 100)?.toFixed(0)}%`
                                    : `+${((adFrequency - 3.2) / 3.2 * 100)?.toFixed(0)}%`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-2">Positionnement Sectoriel</h6>
                    <div className={`p-3 rounded-lg ${campaignHealthScore > 70
                        ? "bg-green-50 border border-green-200"
                        : campaignHealthScore > 40
                            ? "bg-yellow-50 border border-yellow-200"
                            : "bg-red-50 border border-red-200"
                        }`}>
                        <p className="text-sm text-dashboard-neutral-700">
                            {campaignHealthScore > 70
                                ? "Cette campagne se positionne dans le top 25% des performances du secteur du luxe."
                                : campaignHealthScore > 40
                                    ? "Cette campagne se positionne dans la moyenne du secteur du luxe."
                                    : "Cette campagne se positionne dans les 25% les moins performants du secteur du luxe."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectorComparison;