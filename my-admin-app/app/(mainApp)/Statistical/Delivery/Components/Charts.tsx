import React, { useMemo } from 'react'
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
const Charts = ({ chartData, getColorForPercentage, deliveryTimePercentage, averageTimeInHours }: any) => {
console.log(chartData)
    // Chart options with memoization
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 11, family: "'Inter', sans-serif" },
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(0, 0, 0, 0.05)" },
                ticks: {
                    font: { size: 11, family: "'Inter', sans-serif" }
                }
            },
        },
        plugins: {
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                titleFont: {
                    size: 13,
                    family: "'Inter', sans-serif"
                },
                bodyFont: {
                    size: 12,
                    family: "'Inter', sans-serif"
                },
                padding: 12,
                cornerRadius: 4,
                callbacks: {
                    afterBody: (tooltipItems: any) => {
                        if (tooltipItems.length === 0) return "";
                        const datasetIndex = tooltipItems[0].datasetIndex;
                        const dataIndex = tooltipItems[0].dataIndex;
                        const dataset = chartData.datasets[datasetIndex];
                        const totalPrice = dataset.total[dataIndex];
                        return `Total Price: ${totalPrice.toFixed(2)} DT`;
                    },
                },
            },
            legend: {
                position: "top" as const,
                labels: {
                    boxWidth: 20,
                    font: { size: 11, family: "'Inter', sans-serif" },
                    padding: 15
                }
            },
            title: {
                display: true,
                text: "Statut de la commande au fil du temps",
                font: {
                    size: 16,
                    family: "'Inter', sans-serif",
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
        },
    }), [chartData]) as any;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded-lg border border-dashboard-neutral-200 p-4">
                <h3 className="text-lg font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-dashboard-info rounded-full mr-2"></div>
                    Délai de livraison moyen
                </h3>
                <div className="flex flex-col items-center justify-center">
                    <svg width="220" height="220" viewBox="0 0 220 220" className="mb-4">
                        <circle
                            cx="110"
                            cy="110"
                            r="90"
                            fill="none"
                            stroke="#E2E8F0"
                            strokeWidth="20"
                        />
                        <motion.circle
                            cx="110"
                            cy="110"
                            r="90"
                            fill="none"
                            stroke={getColorForPercentage(deliveryTimePercentage)}
                            strokeWidth="20"
                            strokeDasharray={`${2 * Math.PI * 90}`}
                            transform="rotate(-90 110 110)"
                            initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                            animate={{
                                strokeDashoffset:
                                    2 * Math.PI * 90 * (1 - deliveryTimePercentage / 100),
                            }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        />
                        <text
                            x="110"
                            y="100"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="32px"
                            fontWeight="700"
                            fill="#1E293B"
                        >
                            {averageTimeInHours}
                        </text>
                        <text
                            x="110"
                            y="135"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="16px"
                            fontWeight="500"
                            fill="#64748B"
                        >
                            heures
                        </text>
                    </svg>
                    <div className="text-center">
                        <p className="text-dashboard-neutral-600 text-sm">
                            Temps moyen entre la commande et la livraison
                        </p>
                        <div className="mt-2 flex justify-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-dashboard-success mr-1"></div>
                                <span className="text-xs text-dashboard-neutral-600">Rapide (&lt;16h)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-dashboard-warning mr-1"></div>
                                <span className="text-xs text-dashboard-neutral-600">Normal (16-32h)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-dashboard-danger mr-1"></div>
                                <span className="text-xs text-dashboard-neutral-600">Lent (&gt;32h)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 shadow-md rounded-lg border border-dashboard-neutral-200 lg:col-span-2">
                <h3 className="text-lg font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-dashboard-primary rounded-full mr-2"></div>
                    Statut des commandes au fil du temps
                </h3>
                <div className="h-[400px]">
                    <Bar
                        data={{
                            ...chartData,
                            datasets: chartData.datasets.map((dataset: any, index: number) => ({
                                ...dataset,
                                backgroundColor: [
                                    "rgba(245, 158, 11, 0.7)",
                                    "rgba(59, 130, 246, 0.7)",
                                    "rgba(6, 182, 212, 0.7)",
                                    "rgba(16, 185, 129, 0.7)",
                                    "rgba(239, 68, 68, 0.7)",
                                ][index % 5]
                            }))
                        }}
                        options={chartOptions}
                    />
                </div>
            </div>
        </div>)
}

export default Charts