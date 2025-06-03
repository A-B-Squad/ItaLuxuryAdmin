import React from 'react';
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/ui/date-range-picker";

interface DateRangeSelectorProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ dateRange, setDateRange }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-dashboard-neutral-100 p-4 rounded-lg">
      <div className="mb-4 md:mb-0">
        <h2 className="text-lg font-semibold text-dashboard-neutral-800">Période d'analyse</h2>
        <p className="text-sm text-dashboard-neutral-600">Sélectionnez une période pour analyser les performances</p>
      </div>
      <div className="date-picker">
        <DateRangePicker
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;