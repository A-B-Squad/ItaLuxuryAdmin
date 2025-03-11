"use client"
import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { Bar } from "react-chartjs-2";
import moment from "moment-timezone";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { GET_PACKAGES_QUERY } from "@/app/graph/queries";
import Loading from "../loading";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";

import DateRangePicker from "@/components/ui/date-range-picker";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Package {
    id: string;
    status: string;
    createdAt: string;
    Checkout: {
        total: number;
        freeDelivery: boolean;
    };
}

const DELIVERY_PRICE = 8;
const DEFAULT_TIMEZONE = "Africa/Tunis";

const STATUS_COLORS = {
    PAYED_AND_DELIVERED: 'rgba(16, 185, 129, 0.7)',  // dashboard-success
    PROCESSING: 'rgba(59, 130, 246, 0.7)',           // dashboard-primary
    PAYMENT_REFUSED: 'rgba(239, 68, 68, 0.7)',       // dashboard-danger
    TRANSFER_TO_DELIVERY_COMPANY: 'rgba(245, 158, 11, 0.7)', // dashboard-warning
    CONFIRMED: 'rgba(99, 102, 241, 0.7)',            // dashboard-secondary
    BACK: 'rgba(6, 182, 212, 0.7)',                  // dashboard-info
    REFUNDED: 'rgba(100, 116, 139, 0.7)',            // dashboard-neutral-500
    CANCELLED: 'rgba(71, 85, 105, 0.7)',             // dashboard-neutral-600
    PAYED_NOT_DELIVERED: 'rgba(16, 185, 129, 0.5)'   // dashboard-success (lighter)
};

const YearlyTurnoverPage: React.FC = () => {
    const { loading, data } = useQuery<{ getAllPackages: Package[] }>(GET_PACKAGES_QUERY, {
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true
    });

    const { toast } = useToast();
    const chartRef = useRef(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 365),
        to: new Date(),
    });
    const [formattedDateRange, setFormattedDateRange] = useState<string>("");

    // Format date range whenever it changes
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const fromFormatted = format(dateRange.from, "dd/MM/yyyy");
            const toFormatted = format(dateRange.to, "dd/MM/yyyy");
            setFormattedDateRange(`${fromFormatted} - ${toFormatted}`);
        } else {
            setFormattedDateRange("");
        }
    }, [dateRange]);



    // Process data with memoization for better performance
    const processedData = useMemo(() => {
        if (!data?.getAllPackages?.length) return {
            turnoverByYearAndStatus: {},
            orderCountByYearAndStatus: {},
            sortedYears: [],
            totalTurnover: 0,
            totalOrders: 0
        };

        const turnoverByYearAndStatus: Record<string, Record<string, number>> = {};
        const orderCountByYearAndStatus: Record<string, Record<string, number>> = {};
        let totalTurnover = 0;
        let totalOrders = 0;

        // Use a single loop for better performance
        data.getAllPackages.forEach(pkg => {
            const pkgDate = moment.tz(parseInt(pkg.createdAt), DEFAULT_TIMEZONE);

            // Skip if outside date range
            if (
                dateRange?.from && dateRange?.to &&
                (pkgDate.isBefore(dateRange.from) || pkgDate.isAfter(dateRange.to))
            ) {
                return;
            }

            const year = pkgDate.year().toString();
            const earnings = pkg.Checkout.freeDelivery
                ? pkg.Checkout.total
                : pkg.Checkout.total - DELIVERY_PRICE;

            // Initialize year objects if needed
            if (!turnoverByYearAndStatus[year]) {
                turnoverByYearAndStatus[year] = {};
            }
            if (!orderCountByYearAndStatus[year]) {
                orderCountByYearAndStatus[year] = {};
            }

            // Update turnover and order count
            turnoverByYearAndStatus[year][pkg.status] =
                (turnoverByYearAndStatus[year][pkg.status] || 0) + earnings;
            orderCountByYearAndStatus[year][pkg.status] =
                (orderCountByYearAndStatus[year][pkg.status] || 0) + 1;

            totalTurnover += earnings;
            totalOrders += 1;
        });

        const sortedYears = Object.keys(turnoverByYearAndStatus).sort((a, b) => parseInt(a) - parseInt(b));

        return {
            turnoverByYearAndStatus,
            orderCountByYearAndStatus,
            sortedYears,
            totalTurnover,
            totalOrders
        };
    }, [data, dateRange]);

    // Chart data preparation with memoization
    const chartData = useMemo(() => {
        if (!processedData.sortedYears.length) return { labels: [], datasets: [] };

        const datasets = (Object.keys(STATUS_COLORS) as Array<keyof typeof STATUS_COLORS>).map(status => ({
            label: status,
            data: processedData.sortedYears.map(year =>
                parseFloat((processedData.turnoverByYearAndStatus[year]?.[status] || 0).toFixed(2))
            ),
            backgroundColor: STATUS_COLORS[status],
            borderColor: STATUS_COLORS[status].replace('0.6', '1'),
            borderWidth: 1
        }));

        return {
            labels: processedData.sortedYears,
            datasets: datasets
        };
    }, [processedData]);

    // Order count chart data with memoization
    const orderCountChartData = useMemo(() => {
        if (!processedData.sortedYears.length) return { labels: [], datasets: [] };

        const datasets = (Object.keys(STATUS_COLORS) as Array<keyof typeof STATUS_COLORS>).map(status => ({
            label: status,
            data: processedData.sortedYears.map(year =>
                processedData.orderCountByYearAndStatus[year]?.[status] || 0
            ),
            backgroundColor: STATUS_COLORS[status],
            borderColor: STATUS_COLORS[status].replace('0.6', '1'),
            borderWidth: 1
        }));

        return {
            labels: processedData.sortedYears,
            datasets: datasets
        };
    }, [processedData]);

    // Chart options with better styling
    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    boxWidth: 20,
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    },
                    padding: 15
                }
            },
            title: {
                display: true,
                text: 'Chiffre d\'affaires annuel par statut',
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
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',  // dashboard-neutral-800
                titleFont: {
                    size: 13,
                    family: "'Inter', sans-serif"
                },
                bodyFont: {
                    size: 12,
                    family: "'Inter', sans-serif"
                },
                padding: 12,
                cornerRadius: 4
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                title: {
                    display: true,
                    text: 'Chiffre d\'affaires (TND)',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    }
                }
            }
        }
    }), []) as any;

    // Order count chart options
    const orderCountOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    boxWidth: 20,
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    },
                    padding: 15
                }
            },
            title: {
                display: true,
                text: 'Nombre de commandes par statut',
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
            tooltip: {
                backgroundColor: 'rgba(32, 41, 57, 0.8)',
                titleFont: {
                    size: 13,
                    family: "'Inter', sans-serif"
                },
                bodyFont: {
                    size: 12,
                    family: "'Inter', sans-serif"
                },
                padding: 12,
                cornerRadius: 4
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                title: {
                    display: true,
                    text: 'Nombre de commandes',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                        weight: 'bold'
                    }
                },
                ticks: {
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    }
                }
            }
        }
    }), []) as any;

    // Export functions with useCallback for better performance
    const exportToPDF = useCallback(() => {
        if (!data?.getAllPackages?.length) {
            toast({
                title: "Aucune donnée à exporter",
                variant: "destructive",
            });
            return;
        }

        const doc = new jsPDF({ orientation: "landscape" });
        const mainColor: [number, number, number] = [30, 41, 59];  // dashboard-neutral-800

        // Add a title with better styling
        doc.setFontSize(20);
        doc.setTextColor(...mainColor);
        doc.text("Rapport de Chiffre d'Affaires Annuel", 14, 22);

        // Add date range to the title
        doc.setFontSize(12);
        doc.text(`Période: ${formattedDateRange}`, 14, 30);

        // Add a separation line
        doc.setLineWidth(0.5);
        doc.line(14, 35, 282, 35);

        // Format the current date and time
        const currentDate = new Date();
        const formattedDate = currentDate
            .toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "-");
        const formattedTime = currentDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        // Add a subtitle with date and time
        doc.setFontSize(10);
        doc.text(`Généré le: ${formattedDate} à ${formattedTime}`, 14, 40);

        // Prepare data for the table
        const tableData = processedData.sortedYears.flatMap(year =>
            Object.entries(processedData.turnoverByYearAndStatus[year]).map(([status, amount]) => [
                year,
                status,
                amount.toFixed(2)
            ])
        );

        // Add the table with custom styles
        autoTable(doc, {
            startY: 50,
            head: [['Année', 'Statut', 'Chiffre d\'affaires (TND)']],
            body: tableData,
            foot: [['Total', '', processedData.totalTurnover.toFixed(2)]],
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: mainColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            footStyles: {
                fillColor: [224, 224, 224],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
            },
        });

        // Save the PDF
        doc.save(`chiffre_affaires_${formattedDate}.pdf`);
    }, [data, formattedDateRange, processedData, toast]);

    const exportToExcel = useCallback(() => {
        if (!data?.getAllPackages?.length) {
            toast({
                title: "Aucune donnée à exporter",
                variant: "destructive",
            });
            return;
        }

        // Prepare data for Excel
        const excelData = [
            ['Période', formattedDateRange],
            ['Année', 'Statut', 'Chiffre d\'affaires (TND)']
        ];

        processedData.sortedYears.forEach((year) => {
            Object.entries(processedData.turnoverByYearAndStatus[year]).forEach(([status, amount]) => {
                excelData.push([year, status, amount.toFixed(2)]);
            });
        });

        // Add total row
        excelData.push(['Total', '', processedData.totalTurnover.toFixed(2)]);

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Style definitions
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "204060" } },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
            },
        };
        const totalStyle = {
            font: { bold: true },
            fill: { fgColor: { rgb: "E0E0E0" } },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
            },
        };

        // Apply styles
        const headerRow = excelData[0].length;
        for (let i = 0; i < headerRow; i++) {
            const cellRef = XLSX.utils.encode_cell({ r: 1, c: i });
            if (!ws[cellRef]) ws[cellRef] = { t: "s" };
            ws[cellRef].s = headerStyle;
        }

        // Style the total row
        const lastRowIndex = excelData.length - 1;
        for (let i = 0; i < headerRow; i++) {
            const cellRef = XLSX.utils.encode_cell({ r: lastRowIndex, c: i });
            if (!ws[cellRef]) ws[cellRef] = { t: "s" };
            ws[cellRef].s = totalStyle;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Chiffre d'Affaires");

        // Format the current date
        const currentDate = new Date();
        const formattedDate = currentDate
            .toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "-");

        // Save the file
        XLSX.writeFile(wb, `chiffre_affaires_${formattedDate}.xlsx`);
    }, [data, formattedDateRange, processedData, toast]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="w-full bg-dashboard-neutral-50 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-dashboard-neutral-800 mb-6 border-b pb-3">Analyse du Chiffre d'Affaires Annuel</h1>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-dashboard-neutral-100 p-4 rounded-lg">
                <DateRangePicker
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                />
            </div>

            <div className="flex justify-end space-x-4 mb-6">
                <button
                    onClick={exportToPDF}
                    className="bg-dashboard-primary text-white px-4 py-2 rounded-md text-sm flex items-center hover:bg-dashboard-primary-dark transition-all shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exporter PDF
                </button>
                <button
                    onClick={exportToExcel}
                    className="bg-dashboard-success text-white px-4 py-2 rounded-md text-sm flex items-center hover:bg-dashboard-success-dark transition-all shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exporter Excel
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Summary Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-dashboard-primary to-dashboard-primary-dark p-6 rounded-lg shadow-md text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 opacity-90">Total du chiffre d'affaires</h3>
                                <p className="text-3xl font-bold">{processedData.totalTurnover.toFixed(2)} TND</p>
                                <p className="text-sm mt-2 opacity-80">Pour la période sélectionnée</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-4 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-dashboard-success to-dashboard-success-dark p-6 rounded-lg shadow-md text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 opacity-90">Total des commandes</h3>
                                <p className="text-3xl font-bold">{processedData.totalOrders}</p>
                                <p className="text-sm mt-2 opacity-80">Pour la période sélectionnée</p>
                            </div>
                            <div className="bg-white bg-opacity-20 p-4 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Turnover Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-dashboard-neutral-200 mb-8">
                    <div className="text-xl font-semibold mb-4 text-dashboard-neutral-800 flex items-center">
                        <div className="w-1 h-6 bg-dashboard-primary rounded-full mr-2"></div>
                        Chiffre d'affaires par année et statut
                    </div>
                    <div className="h-[500px]">
                        <Bar
                            ref={chartRef}
                            data={chartData}
                            options={options}
                            className="w-full h-full"
                        />
                    </div>
                </div>

                {/* Order Count Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-dashboard-neutral-200">
                    <div className="text-xl font-semibold mb-4 text-dashboard-neutral-800 flex items-center">
                        <div className="w-1 h-6 bg-dashboard-success rounded-full mr-2"></div>
                        Nombre de commandes par année et statut
                    </div>
                    <div className="h-[500px]">
                        <Bar
                            data={orderCountChartData}
                            options={orderCountOptions}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearlyTurnoverPage;