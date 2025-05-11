"use client";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, subDays } from "date-fns";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { FaCalendarAlt } from "react-icons/fa";

interface DateRangePickerProps {
    dateRange: DateRange | undefined;
    setDateRange: (dateRange: DateRange | undefined) => void;
    className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    dateRange,
    setDateRange,
    className = "",
}) => {
    const [selectedPreset, setSelectedPreset] = useState("last28");
    const [formattedDateRange, setFormattedDateRange] = useState<string>("");
    const [showCalendar, setShowCalendar] = useState(false);
    // Add a temporary state to hold the selected date range before applying
    const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);

    // Format date range whenever it changes
    useEffect(() => {
        if (dateRange && dateRange.from && dateRange.to) {
            const fromFormatted = format(dateRange.from, "dd/MM/yyyy");
            const toFormatted = format(dateRange.to, "dd/MM/yyyy");
            setFormattedDateRange(`${fromFormatted} - ${toFormatted}`);
        } else {
            setFormattedDateRange("");
        }

        // Update temp date range when parent date range changes
        setTempDateRange(dateRange);
    }, [dateRange]);

    // Handle preset selection
    const handlePresetChange = (value: string) => {
        setSelectedPreset(value);
        const today = new Date();
        let newRange: DateRange | undefined;

        switch (value) {
            case "today":
                newRange = {
                    from: today,
                    to: today,
                };
                break;
            case "last7":
                newRange = {
                    from: subDays(today, 7),
                    to: today,
                };
                break;
            case "last14":
                newRange = {
                    from: subDays(today, 14),
                    to: today,
                };
                break;
            case "last28":
                newRange = {
                    from: subDays(today, 28),
                    to: today,
                };
                break;
            case "last30":
                newRange = {
                    from: subDays(today, 30),
                    to: today,
                };
                break;
            case "last90":
                newRange = {
                    from: subDays(today, 90),
                    to: today,
                };
                break;
            case "last365":
                newRange = {
                    from: subDays(today, 365),
                    to: today,
                };
                break;
            case "allYears":
                // Set to a very old date to include all data
                newRange = {
                    from: new Date(2000, 0, 1),
                    to: today,
                };
                break;
            default:
                break;
        }

        // Only update the temporary date range
        setTempDateRange(newRange);
    };

    // Apply the selected date range
    const handleApply = () => {
        setDateRange(tempDateRange);
        setShowCalendar(false);
    };

    return (
        <div className={`${className} w-full`}>
            <div className="flex flex-col w-full md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="relative">
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="flex items-center border p-2 rounded-md bg-white text-dashboard-neutral-700 hover:bg-dashboard-neutral-100 transition duration-300 shadow-sm"
                    >
                        <FaCalendarAlt className="mr-2 text-dashboard-primary" />
                        {formattedDateRange || "Sélectionner une date"}
                    </button>
                    {showCalendar && (
                        <div className="absolute right-0 mt-2 bg-white p-4 rounded-md shadow-lg z-10 border border-dashboard-neutral-200 max-w-[calc(100vw-2rem)] overflow-auto">
                            <div className="mb-4">
                                <p className="text-sm font-medium mb-2 text-dashboard-neutral-600">Périodes prédéfinies:</p>
                                <Select onValueChange={handlePresetChange} value={selectedPreset}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner une période" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">Aujourd'hui</SelectItem>
                                        <SelectItem value="last7">7 derniers jours</SelectItem>
                                        <SelectItem value="last14">14 derniers jours</SelectItem>
                                        <SelectItem value="last28">28 derniers jours</SelectItem>
                                        <SelectItem value="last30">30 derniers jours</SelectItem>
                                        <SelectItem value="last90">90 derniers jours</SelectItem>
                                        <SelectItem value="last365">365 derniers jours</SelectItem>
                                        <SelectItem value="allYears">Toutes les années</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-sm font-medium mb-2 text-dashboard-neutral-600">Ou sélectionnez une période personnalisée:</p>
                                <Calendar
                                    mode="range"
                                    selected={tempDateRange}
                                    onSelect={(range) => setTempDateRange(range)}
                                    numberOfMonths={window.innerWidth < 640 ? 1 : 2}
                                    defaultMonth={tempDateRange?.from}
                                    className="rounded-md border"
                                />
                            </div>
                            <button
                                onClick={handleApply}
                                className="w-full mt-4 bg-dashboard-primary text-white py-2 rounded-md hover:bg-dashboard-primary-dark transition-all"
                            >
                                Appliquer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;