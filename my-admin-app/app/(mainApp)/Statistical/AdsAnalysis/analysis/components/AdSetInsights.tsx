import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

interface AdSetInsightsProps {
    adSetAnalysis: any;
    adSetsPerformanceData: any;
    performanceDistributionData: any;
    recommendations: any[];
}

const AdSetInsights: React.FC<AdSetInsightsProps> = ({
    adSetAnalysis,
    adSetsPerformanceData,
    performanceDistributionData,
    recommendations
}) => {
    if (!adSetAnalysis) return null;

    return (
        <>
            <h4 className="text-lg font-semibold text-dashboard-neutral-800 mb-4">Analyse des Ensembles de Publicités</h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                    <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3">Performances Comparatives</h5>
                    {adSetsPerformanceData && (
                        <div className="h-[300px]">
                            <Bar
                                data={adSetsPerformanceData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: 'rgba(0, 0, 0, 0.05)' }
                                        },
                                        x: {
                                            grid: { display: false }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        }
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3">Distribution des Performances</h5>
                    {performanceDistributionData && (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="w-3/4">
                                <Doughnut
                                    data={performanceDistributionData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-dashboard-neutral-50 p-4 rounded-lg mb-6">
                <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3">Insights Clés</h5>
                <ul className="space-y-2">
                    {adSetAnalysis.bestCTRAdSet && (
                        <li className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="ml-2 text-sm text-dashboard-neutral-700">
                                <span className="font-medium">{adSetAnalysis.bestCTRAdSet.name}</span> a le meilleur CTR ({adSetAnalysis.bestCTRAdSet.ctr?.toFixed(2)}%), ce qui est {((adSetAnalysis.bestCTRAdSet.ctr || 0) / adSetAnalysis.avgCTR).toFixed(1)}x supérieur à la moyenne.
                            </p>
                        </li>
                    )}
                    {adSetAnalysis.worstCTRAdSet && (
                        <li className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="ml-2 text-sm text-dashboard-neutral-700">
                                <span className="font-medium">{adSetAnalysis.worstCTRAdSet.name}</span> a le CTR le plus faible ({adSetAnalysis.worstCTRAdSet.ctr?.toFixed(2)}%), ce qui est {((adSetAnalysis.worstCTRAdSet.ctr || 0) / adSetAnalysis.avgCTR).toFixed(1)}x inférieur à la moyenne.
                            </p>
                        </li>
                    )}
                    {adSetAnalysis.bestCPCAdSet && (
                        <li className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="ml-2 text-sm text-dashboard-neutral-700">
                                <span className="font-medium">{adSetAnalysis.bestCPCAdSet.name}</span> a le CPC le plus bas (${adSetAnalysis.bestCPCAdSet.cpc?.toFixed(2)}), ce qui est {(adSetAnalysis.avgCPC / (adSetAnalysis.bestCPCAdSet.cpc || 1)).toFixed(1)}x moins cher que la moyenne.
                            </p>
                        </li>
                    )}
                </ul>
            </div>

            <div className="bg-dashboard-neutral-50 p-4 rounded-lg mb-6">
                <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3">Recommandations</h5>
                <ul className="space-y-2">
                    {recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="flex items-start">
                            <div className={`flex-shrink-0 h-5 w-5 ${rec.priority === 'high' ? 'text-red-500' :
                                rec.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="ml-2 text-sm text-dashboard-neutral-700">
                                <span className="font-medium">{rec.action}</span>: {rec.description}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default AdSetInsights;