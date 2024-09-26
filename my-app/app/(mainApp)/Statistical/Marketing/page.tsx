"use client";
import React, { useState, useEffect } from "react";
import MarketingPage from "./MarketingPage";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfDay } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

const marketingPage = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 28),
    to: new Date(),
  });
  const [selectedPreset, setSelectedPreset] = useState("last28");
  const [formattedDateRange, setFormattedDateRange] = useState<string>("");

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    const today = new Date();
    let from: Date;
    switch (value) {
      case "today":
        from = startOfDay(today);
        break;
      case "yesterday":
        from = startOfDay(subDays(today, 1));
        break;
      case "last7":
        from = subDays(today, 7);
        break;
      case "last14":
        from = subDays(today, 14);
        break;
      case "last28":
        from = subDays(today, 28);
        break;
      default:
        from = subDays(today, 28);
    }
    setDateRange({ from, to: today });
  };

  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      const fromFormatted = format(dateRange.from, "dd/MM/yyyy");
      const toFormatted = format(dateRange.to, "dd/MM/yyyy");
      setFormattedDateRange(`${fromFormatted} - ${toFormatted}`);
    } else {
      setFormattedDateRange("");
    }
  }, [dateRange]);

  return (
    <div className="MarkitingPage">
      <div className="container mx-auto p-4 relative">
        <div className=" flex sticky items-center justify-between  mt-5 top-0 w-full">
          <div className="flex items-center  flex-col">
            <p className="text-sm font-medium">Selected Date Range:</p>
            <p className="text-sm">
              {formattedDateRange || "No date range selected"}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center border p-2 rounded bg-white text-gray-700 hover:bg-gray-100 transition duration-300"
            >
              <FaCalendarAlt className="mr-2" />
              {showCalendar ? "Hide Calendar" : "Show Calendar"}
            </button>
            {showCalendar && (
              <div className="absolute right-0 mt-2 bg-white p-2 rounded-md shadow-md z-10">
                <Select
                  onValueChange={handlePresetChange}
                  value={selectedPreset}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last14">Last 14 Days</SelectItem>
                    <SelectItem value="last28">Last 28 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range)}
                  numberOfMonths={2}
                />
              </div>
            )}
          </div>
        </div>
        <MarketingPage dateRange={dateRange} />
      </div>
    </div>
  );
};

export default marketingPage;
