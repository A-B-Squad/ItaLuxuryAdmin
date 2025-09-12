import React from "react";
import { Line, Doughnut } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface ChartsGridProps {
    timeChartData: any;
    governorateChartData: any;
    chartOptions: ChartOptions<"line">;
    doughnutOptions: ChartOptions<"doughnut">;
}

const ChartsGrid: React.FC<ChartsGridProps> = ({
    timeChartData,
    governorateChartData,
    chartOptions,
    doughnutOptions,
}) => {
    return (
        <>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6">
                {/* Time Series Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="h-[400px]">
                        <Line data={timeChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Governorate Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="h-[400px]">
                        <Doughnut data={governorateChartData} options={doughnutOptions} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChartsGrid;